import { z } from "zod";

/**
 * OSS 模块模型定义（使用 Zod）
 */

// === 业务 Schema ===
const UploadParams = z.object({
  key: z.string().describe("文件在OSS中的路径"),
  contentType: z.string().optional().describe("文件MIME类型"),
  expires: z.number().optional().describe("签名过期时间(秒)"),
});

const FileInfo = z.object({
  fileName: z.string().describe("文件名"),
  url: z.string().url().describe("文件URL"),
  size: z.number().describe("文件大小(字节)"),
  contentType: z.string().optional().describe("文件MIME类型"),
  lastModified: z.string().datetime().optional().describe("最后修改时间"),
  etag: z.string().optional().describe("文件ETag"),
});

const DeleteParams = z.object({
  key: z.string().describe("要删除的文件路径"),
});

const ExistsParams = z.object({
  key: z.string().describe("要检查的文件路径"),
});

const BatchDelete = z.object({
  keys: z.array(z.string()).min(1, "至少提供一个文件路径"),
});

const ListParams = z.object({
  prefix: z.string().optional().describe("文件前缀"),
  marker: z.string().optional().describe("分页标记"),
  maxKeys: z.coerce.number().max(1000).default(100).describe("最大返回数量"),
  delimiter: z.string().optional().describe("目录分隔符"),
});

const ListResult = z.object({
  files: z.array(FileInfo),
  prefixes: z.array(z.string()).describe("目录前缀列表"),
  nextMarker: z.string().optional().describe("下一页标记"),
  isTruncated: z.boolean().describe("是否已截断"),
});

const PresignedUrlParams = z.object({
  key: z.string().describe("文件在OSS中的路径"),
  method: z.enum(["GET", "PUT", "DELETE"]).default("GET").describe("HTTP方法"),
  expires: z.number().min(1).max(3600).default(3600).describe("过期时间(秒)"),
  contentType: z.string().optional().describe("文件MIME类型"),
});

// === 1. 运行时 Schema 集合（值）===
export const OssModel = {
  UploadParams,
  FileInfo,
  DeleteParams,
  ExistsParams,
  BatchDelete,
  ListParams,
  ListResult,
  PresignedUrlParams,
} as const;

// === 2. 编译时类型集合（类型）===
export type OssModel = {
  UploadParams: z.infer<typeof UploadParams>;
  FileInfo: z.infer<typeof FileInfo>;
  DeleteParams: z.infer<typeof DeleteParams>;
  ExistsParams: z.infer<typeof ExistsParams>;
  BatchDelete: z.infer<typeof BatchDelete>;
  ListParams: z.infer<typeof ListParams>;
  ListResult: z.infer<typeof ListResult>;
  PresignedUrlParams: z.infer<typeof PresignedUrlParams>;
};
