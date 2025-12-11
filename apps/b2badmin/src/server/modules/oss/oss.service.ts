/**
 * OSS服务模块
 * 使用AWS SDK S3 Client实现文件上传和管理
 * 支持华为云OBS和阿里云OSS，通过统一的环境变量配置
 */

import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { IMAGE_MIME_TYPE_MAP } from "@repo/contract";
import { HttpError } from "elysia-http-problem-json";

// 顶层正则表达式常量，提升性能
const HTTPS_PROTOCOL_REGEX = /^https?:\/\//;

// 创建OSS客户端（纯函数）
const createOSSClient = () => {
  const accessKeyId = process.env.ACCESS_KEY_ID;
  const secretAccessKey = process.env.SECRET_ACCESS_KEY;
  const bucket = process.env.BUCKET;
  const region = process.env.REGION;
  const endpoint = process.env.ENDPOINT;

  if (!(accessKeyId && secretAccessKey && bucket && endpoint)) {
    throw new HttpError.BadRequest(
      "OSS 配置缺失：请检查 ACCESS_KEY_ID, SECRET_ACCESS_KEY, BUCKET, ENDPOINT"
    );
  }

  return new S3Client({
    region,
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: false, // 华为云OBS和阿里云OSS都使用虚拟主机样式
  });
};

// 获取单例客户端（懒加载）

let _client: S3Client | null = null;
const _bucket = process.env.BUCKET || "";
let _hasAttempted = false;
const getClient = () => {
  if (!(_client || _hasAttempted)) {
    _client = createOSSClient();
    _hasAttempted = true;
  }
  return _client as S3Client;
};
// 生成唯一文件名
const generateUniqueKey = (originalName: string, folder?: string): string => {
  const randomStr = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split(".").pop()?.toLowerCase() || "jpg";
  const shortName = (originalName.split(".")[0] || "file").substring(0, 20);
  return `${folder || "uploads"}/${shortName}_${randomStr}.${extension}`;
};
// 获取公共 URL
export const getPublicUrl = (key: string): string => {
  const customDomain = process.env.DOMAIN;
  if (customDomain) {
    return `${customDomain}/${key}`;
  }
  const endpoint = process.env.ENDPOINT || "";
  const host = endpoint.replace(HTTPS_PROTOCOL_REGEX, "");
  return `https://${_bucket}.${host}/${key}`;
};
const uploadFileInternal = async (
  file: Buffer | Uint8Array | string | Blob,
  key: string,
  contentType: string
) => {
  const client = getClient();
  let body: Buffer | Uint8Array;
  if (file instanceof Blob) {
    body = new Uint8Array(await file.arrayBuffer());
  } else if (typeof file === "string") {
    body = Buffer.from(file);
  } else {
    body = file;
  }
  const command = new PutObjectCommand({
    Bucket: _bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  });
  const res = await client.send(command);
  return {
    ...res,
    key,
    url: getPublicUrl(key),
  };
};

export const uploadFileDirect = async (
  file: Buffer | Uint8Array | string | Blob,
  key: string,
  contentType = "application/octet-stream"
) => uploadFileInternal(file, key, contentType);

// 公共方法：上传图片（自动处理 key 和 MIME）
export const uploadImage = (
  imageFile: Buffer | Uint8Array | Blob,
  folder: string,
  filename: string
) => {
  const key = generateUniqueKey(filename, folder);
  const extension = filename.split(".").pop()?.toLowerCase() || "jpg";
  const contentType = IMAGE_MIME_TYPE_MAP[extension] || "image/jpeg";
  return uploadFileInternal(imageFile, key, contentType);
};
// 删除文件
export const deleteFile = async (key: string): Promise<void> => {
  try {
    const client = getClient();
    console.log(`Deleting file with key: ${key}`);
    const command = new DeleteObjectCommand({ Bucket: _bucket, Key: key });
    await client.send(command);
  } catch (error) {
    console.error("文件删除失败:", error);
    throw new Error(
      `文件删除失败: ${error instanceof Error ? error.message : "未知错误"}`
    );
  }
};

// 检查文件是否存在
export const fileExists = async (key: string): Promise<boolean> => {
  try {
    const client = getClient();
    const command = new HeadObjectCommand({ Bucket: _bucket, Key: key });
    await client.send(command);
    return true;
  } catch (error) {
    if ((error as any)?.name === "NotFound") {
      return false;
    }
    console.error("检查文件存在性失败:", error);
    return false;
  }
};

export const getProviderInfo = (): { provider: string; endpoint: string } => {
  const endpoint = process.env.ENDPOINT || "";
  let provider = "unknown";
  if (endpoint.includes("myhuaweicloud.com") || endpoint.includes("obs.")) {
    provider = "华为云OBS";
  } else if (endpoint.includes("aliyuncs.com") || endpoint.includes("oss-")) {
    provider = "阿里云OSS";
  }
  return { provider, endpoint };
};

/**
 * 获取文件信息
 * @param key 文件在OSS中的路径
 * @returns 文件统计信息
 */
export const getFileStats = async (key: string) => {
  const command = new HeadObjectCommand({
    Bucket: _bucket,
    Key: key,
  });
  const response = await getClient().send(command);
  return {
    ...response,
    size: response.ContentLength || 0,
    updatedAt: response.LastModified,
  };
};
