/**
 * Bun S3 存储策略实现
 * 使用 Bun 原生 S3 API 替代 AWS SDK
 * 提供更好的性能和更简洁的 API
 */

import { IMAGE_MIME_TYPE_MAP } from "@repo/contract";
import { S3Client } from "bun";
import { AbstractImageStorage } from "../ImageStorage";

export type BunS3Config = {
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region?: string;
  endpoint?: string;
  domain?: string; // 自定义域名
  acl?: string; // 默认 ACL，如 'public-read'
};

export class BunS3Storage extends AbstractImageStorage {
  private readonly client: S3Client;
  private readonly bucket: string;
  readonly config: BunS3Config;

  constructor(config: BunS3Config) {
    super(config);
    this.config = config;
    this.bucket = config.bucket;
    this.validateConfig();
    this.client = this.createClient();
  }

  private validateConfig(): void {
    const required = ["accessKeyId", "secretAccessKey", "bucket"];
    const missing = required.filter(
      (key) => !this.config[key as keyof BunS3Config]
    );

    if (missing.length > 0) {
      console.log(`Bun S3 配置缺失：${missing.join(", ")}`);
    }
  }

  private createClient(): S3Client {
    return new S3Client({
      accessKeyId: this.config.accessKeyId,
      secretAccessKey: this.config.secretAccessKey,
      bucket: this.bucket,
      region: this.config.region,
      endpoint: this.config.endpoint,
      acl: this.config.acl as
        | "private"
        | "public-read"
        | "public-read-write"
        | "aws-exec-read"
        | "authenticated-read"
        | "bucket-owner-read"
        | "bucket-owner-full-control"
        | undefined,
    });
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
      let body: Buffer | Uint8Array | string | Blob;
      let size: number;

      if (file instanceof Blob) {
        const arrayBuffer = await file.arrayBuffer();
        body = new Uint8Array(arrayBuffer);
        size = arrayBuffer.byteLength;
      } else if (typeof file === "string") {
        body = file;
        size = Buffer.byteLength(file);
      } else {
        body = file;
        size = body.length;
      }

      // 确定内容类型
      const finalContentType =
        contentType || this.getContentTypeFromFileName(originalName);

      // 使用 Bun S3 API 上传
      const s3File = this.client.file(key);
      await s3File.write(body, {
        type: finalContentType,
        // 可以设置 ACL
        ...(this.config.acl && {
          acl: this.config.acl as
            | "private"
            | "public-read"
            | "public-read-write"
            | "aws-exec-read"
            | "authenticated-read"
            | "bucket-owner-read"
            | "bucket-owner-full-control",
        }),
      });

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
        `Bun S3 上传失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  }

  async deleteFile(fileOrUrl: string): Promise<boolean> {
    try {
      const key = this.extractKeyFromUrl(fileOrUrl);
      const s3File = this.client.file(key);
      await s3File.delete();
      return true;
    } catch (error) {
      console.error("Bun S3 删除文件失败:", error);
      return false;
    }
  }

  async fileExists(fileOrUrl: string): Promise<boolean> {
    try {
      const key = this.extractKeyFromUrl(fileOrUrl);
      const s3File = this.client.file(key);
      return await s3File.exists();
    } catch (error) {
      return false;
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
      const s3File = this.client.file(key);
      const stat = await s3File.stat();

      return {
        url: this.getPublicUrl(key),
        fileName: key.split("/").pop() || "unknown",
        size: stat.size,
        contentType: stat.type,
        updatedAt: stat.lastModified,
      };
    } catch (error) {
      throw new Error(
        `获取文件信息失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  }

  /**
   * 获取预签名 URL（实现基类抽象方法）
   */
  getPresignedUrl(
    key: string,
    options: {
      method: "GET" | "PUT";
      expiresIn?: number;
    }
  ): Promise<string> {
    const s3File = this.client.file(key);
    return Promise.resolve(
      s3File.presign({
        expiresIn: options.expiresIn ?? 3600,
        method: options.method,
      })
    );
  }

  /**
   * 生成预签名 URL（扩展方法，支持更多选项）
   */
  presignUrl(
    key: string,
    expiresIn = 3600,
    options: {
      method?: "GET" | "PUT" | "DELETE";
      acl?: string;
      type?: string;
    } = {}
  ): Promise<string> {
    const s3File = this.client.file(key);
    return Promise.resolve(
      s3File.presign({
        expiresIn,
        method: options.method,
        acl: options.acl as
          | "private"
          | "public-read"
          | "public-read-write"
          | "aws-exec-read"
          | "authenticated-read"
          | "bucket-owner-read"
          | "bucket-owner-full-control"
          | undefined,
        type: options.type,
      })
    );
  }

  /**
   * 获取公开访问 URL（实现基类抽象方法）
   */
  getPublicUrl(key: string): string {
    // 优先使用自定义域名
    if (this.config.domain) {
      return `${this.config.domain}/${key}`;
    }

    // 如果配置了 endpoint，使用 endpoint 构建 URL
    if (this.config.endpoint) {
      // 处理不同的 endpoint 格式
      const endpoint = this.config.endpoint;
      if (endpoint.includes("amazonaws.com")) {
        // AWS S3
        const region = this.config.region || "us-east-1";
        return `https://${this.bucket}.s3.${region}.amazonaws.com/${key}`;
      }
      if (endpoint.includes("r2.cloudflarestorage.com")) {
        // Cloudflare R2
        return `https://${this.bucket}.${endpoint.replace("https://", "")}/${key}`;
      }
      // 其他 S3 兼容服务
      const host = endpoint.replace(/^https?:\/\//, "");
      return `https://${this.bucket}.${host}/${key}`;
    }

    // 默认情况 - 使用 Bun 的默认格式
    return `s3://${this.bucket}/${key}`;
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
    let name = "Bun S3";

    if (endpoint?.includes("amazonaws.com")) {
      name = "AWS S3 (Bun API)";
    } else if (endpoint?.includes("r2.cloudflarestorage.com")) {
      name = "Cloudflare R2 (Bun API)";
    } else if (endpoint?.includes("digitaloceanspaces.com")) {
      name = "DigitalOcean Spaces (Bun API)";
    } else if (
      endpoint?.includes("myhuaweicloud.com") ||
      endpoint?.includes("obs.")
    ) {
      name = "华为云 OBS (Bun API)";
    } else if (
      endpoint?.includes("aliyuncs.com") ||
      endpoint?.includes("oss-")
    ) {
      name = "阿里云 OSS (Bun API)";
    }

    return {
      name,
      type: "bun-s3-storage",
      endpoint,
    };
  }

  /**
   * 重写父类方法，从 URL 中提取 key
   */
  protected extractKeyFromUrl(url: string): string {
    // 如果传入的本身就是 key（没有 http 协议），直接返回
    if (
      !(
        url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("s3://")
      )
    ) {
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

  /**
   * 获取客户端实例（用于高级操作）
   */
  getClient(): S3Client {
    return this.client;
  }

  /**
   * 列出文件
   * @param prefix 前缀
   * @param maxKeys 最大返回数量
   */
  async listFiles(
    prefix?: string,
    maxKeys = 1000
  ): Promise<{
    files: Array<{
      key: string;
      size: number;
      lastModified: Date;
      etag: string;
    }>;
    isTruncated: boolean;
  }> {
    try {
      const result = await this.client.list({
        prefix,
        maxKeys,
      });

      return {
        files: (result.contents || []).map((item: any) => ({
          key: item.key,
          size: item.size,
          lastModified: new Date(item.lastModified),
          etag: item.etag,
        })),
        isTruncated: result.isTruncated ?? false,
      };
    } catch (error) {
      throw new Error(
        `列出文件失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  }
}
