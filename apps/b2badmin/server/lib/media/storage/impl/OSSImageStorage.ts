/**
 * OSS 存储策略实现
 * 基于现有的 OSS 服务，实现抽象存储基类
 */

import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { IMAGE_MIME_TYPE_MAP } from "@repo/contract";
import { HttpError } from "elysia-http-problem-json";
import { AbstractImageStorage } from "../ImageStorage";

// 顶层正则表达式常量，提升性能
const HTTPS_PROTOCOL_REGEX = /^https?:\/\//;

export type OSSConfig = {
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region: string;
  endpoint: string;
  domain?: string; // 自定义域名
};

export class OSSImageStorage extends AbstractImageStorage {
  private client: S3Client | null = null;
  private readonly bucket: string;
  readonly config: OSSConfig;

  constructor(config: OSSConfig) {
    super(config);
    this.config = config;
    this.bucket = config.bucket;
    this.validateConfig();
  }

  private validateConfig(): void {
    const required = ["accessKeyId", "secretAccessKey", "bucket", "endpoint"];
    const missing = required.filter(
      (key) => !this.config[key as keyof OSSConfig]
    );

    if (missing.length > 0) {
      throw new HttpError.BadRequest(`OSS 配置缺失：${missing.join(", ")}`);
    }
  }

  private getClient(): S3Client {
    if (!this.client) {
      this.client = new S3Client({
        region: this.config.region,
        endpoint: this.config.endpoint,
        credentials: {
          accessKeyId: this.config.accessKeyId,
          secretAccessKey: this.config.secretAccessKey,
        },
        forcePathStyle: false, // 华为云OBS和阿里云OSS都使用虚拟主机样式
      });
    }
    return this.client;
  }

  async uploadFile(
    file: Buffer | Uint8Array | string | Blob,
    originalName: string,
    folder: string,
    contentType?: string
  ): Promise<{
    url: string;
    fileName: string;
    size: number;
    contentType: string;
    key?: string;
  }> {
    try {
      const key = this.generateUniqueFileName(originalName, folder);

      // 处理文件数据
      let body: Buffer | Uint8Array;
      let size: number;

      if (file instanceof Blob) {
        const arrayBuffer = await file.arrayBuffer();
        body = new Uint8Array(arrayBuffer);
        size = arrayBuffer.byteLength;
      } else if (typeof file === "string") {
        body = Buffer.from(file);
        size = body.length;
      } else {
        body = file;
        size = body.length;
      }

      // 确定内容类型
      const finalContentType =
        contentType || this.getContentTypeFromFileName(originalName);

      // 上传到 OSS
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: finalContentType,
      });

      await this.getClient().send(command);

      // 生成公开 URL
      const url = this.getPublicUrl(key);

      return {
        url,
        fileName: originalName,
        size,
        contentType: finalContentType,
        key,
      };
    } catch (error) {
      throw new Error(
        `OSS 上传失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  }

  async deleteFile(fileOrUrl: string): Promise<boolean> {
    try {
      const key = this.extractKeyFromUrl(fileOrUrl);
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.getClient().send(command);
      return true;
    } catch (error) {
      console.error("OSS 删除文件失败:", error);
      return false;
    }
  }

  async fileExists(fileOrUrl: string): Promise<boolean> {
    try {
      const key = this.extractKeyFromUrl(fileOrUrl);
      const command = new HeadObjectCommand({ Bucket: this.bucket, Key: key });
      await this.getClient().send(command);
      return true;
    } catch (error: any) {
      if (error?.name === "NotFound") {
        return false;
      }
      return false;
    }
  }

  /**
   * 获取预签名 URL
   * @param key 对象键
   * @param options 选项
   * @returns 预签名 URL
   */
  async getPresignedUrl(
    key: string,
    options: {
      method: "GET" | "PUT";
      expiresIn?: number;
    }
  ): Promise<string> {
    try {
      const expiresIn = options.expiresIn || 3600; // 默认 1 小时

      let command;
      switch (options.method) {
        case "PUT":
          command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
          });
          break;
        default:
          command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
          });
          break;
      }

      const url = await getSignedUrl(this.getClient(), command, {
        expiresIn,
      });

      return url;
    } catch (error) {
      throw new Error(
        `获取预签名URL失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  }

  async getFileInfo(fileOrUrl: string): Promise<{
    url: string;
    fileName: string;
    size: number;
    contentType?: string;
    updatedAt?: Date;
  }> {
    try {
      const key = this.extractKeyFromUrl(fileOrUrl);
      const command = new HeadObjectCommand({ Bucket: this.bucket, Key: key });
      const response = await this.getClient().send(command);

      return {
        url: this.getPublicUrl(key),
        fileName: key.split("/").pop() || "unknown",
        size: response.ContentLength || 0,
        contentType: response.ContentType,
        updatedAt: response.LastModified,
      };
    } catch (error) {
      throw new Error(
        `获取文件信息失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  }

  getPublicUrl(key: string): string {
    // 优先使用自定义域名
    if (this.config.domain) {
      return `${this.config.domain}/${key}`;
    }

    // 使用默认的 OSS URL 格式
    const endpoint = this.config.endpoint || "";
    const host = endpoint.replace(HTTPS_PROTOCOL_REGEX, "");
    return `https://${this.bucket}.${host}/${key}`;
  }

  private getContentTypeFromFileName(fileName: string): string {
    const extension = fileName.split(".").pop()?.toLowerCase() || "jpg";
    return IMAGE_MIME_TYPE_MAP[extension] || "application/octet-stream";
  }

  getProviderInfo(): {
    name: string;
    type: string;
    endpoint?: string;
  } {
    const endpoint = this.config.endpoint;
    let name = "OSS";

    if (endpoint.includes("myhuaweicloud.com") || endpoint.includes("obs.")) {
      name = "华为云OBS";
    } else if (endpoint.includes("aliyuncs.com") || endpoint.includes("oss-")) {
      name = "阿里云OSS";
    } else if (endpoint.includes("amazonaws.com")) {
      name = "AWS S3";
    }

    return {
      name,
      type: "object-storage",
      endpoint,
    };
  }

  /**
   * 重写父类方法，从 OSS URL 中提取 key
   */
  protected extractKeyFromUrl(url: string): string {
    // 如果传入的本身就是 key（没有 http 协议），直接返回
    if (!(url.startsWith("http://") || url.startsWith("https://"))) {
      return url;
    }

    try {
      const urlObj = new URL(url);
      let pathname = urlObj.pathname;

      // 移除开头的斜杠
      if (pathname.startsWith("/")) {
        pathname = pathname.substring(1);
      }

      return pathname;
    } catch {
      return url;
    }
  }
}
