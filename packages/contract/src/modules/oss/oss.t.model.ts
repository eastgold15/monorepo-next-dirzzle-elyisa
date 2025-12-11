// OSS module TypeBox type definitions
// Replaces Zod with TypeBox for runtime validation and type safety

import { t } from "elysia";

/**
 * OSS 模块模型定义（使用 TypeBox）
 */

// === 业务 Schema ===
const UploadParams = t.Object({
  key: t.String({ description: "文件在OSS中的路径" }),
  contentType: t.Optional(t.String({ description: "文件MIME类型" })),
  expires: t.Optional(t.Number({ description: "签名过期时间(秒)" })),
});

const FileInfo = t.Object({
  fileName: t.String({ description: "文件名" }),
  url: t.String({ format: "uri", description: "文件URL" }),
  size: t.Number({ description: "文件大小(字节)" }),
  contentType: t.Optional(t.String({ description: "文件MIME类型" })),
  lastModified: t.Optional(
    t.String({ format: "date-time", description: "最后修改时间" })
  ),
  etag: t.Optional(t.String({ description: "文件ETag" })),
});

const DeleteParams = t.Object({
  key: t.String({ description: "要删除的文件路径" }),
});

const ExistsParams = t.Object({
  key: t.String({ description: "要检查的文件路径" }),
});

const BatchDelete = t.Object({
  keys: t.Array(t.String(), { minItems: 1, description: "文件路径数组" }),
});

const ListParams = t.Object({
  prefix: t.Optional(t.String({ description: "文件前缀" })),
  marker: t.Optional(t.String({ description: "分页标记" })),
  maxKeys: t.Optional(
    t.Number({ maximum: 1000, default: 100, description: "最大返回数量" })
  ),
  delimiter: t.Optional(t.String({ description: "目录分隔符" })),
});

const ListResult = t.Object({
  files: t.Array(FileInfo),
  prefixes: t.Array(t.String({ description: "目录前缀列表" })),
  nextMarker: t.Optional(t.String({ description: "下一页标记" })),
  isTruncated: t.Boolean({ description: "是否已截断" }),
});

const PresignedUrlParams = t.Object({
  key: t.String({ description: "文件在OSS中的路径" }),
  method: t.UnionEnum(["GET", "PUT", "DELETE"], {
    default: "GET",
    description: "HTTP方法",
  }),
  expires: t.Number({
    minimum: 1,
    maximum: 3600,
    default: 3600,
    description: "过期时间(秒)",
  }),
  contentType: t.Optional(t.String({ description: "文件MIME类型" })),
});

// === 1. 运行时 Schema 集合（值）===
export const OssTModel = {
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
export type OssTModel = {
  UploadParams: typeof UploadParams.static;
  FileInfo: typeof FileInfo.static;
  DeleteParams: typeof DeleteParams.static;
  ExistsParams: typeof ExistsParams.static;
  BatchDelete: typeof BatchDelete.static;
  ListParams: typeof ListParams.static;
  ListResult: typeof ListResult.static;
  PresignedUrlParams: typeof PresignedUrlParams.static;
};
