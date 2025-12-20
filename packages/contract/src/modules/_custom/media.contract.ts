// Media module contract - 自定义扩展
// 用于媒体文件管理和上传

import { t } from "elysia";
// 1. 导入自动生成的原始契约
import { MediaContract as Generated } from "../_generated/media.contract";

// 2. 导入你可能需要关联的其他契约
// import { UserContract } from "../generated/user.contract";

/**
 * 自定义扩展契约：Media
 * 模式：继承基础字段 + 叠加复杂逻辑
 */

// --- A. 扩展响应结构 (最常用：增加关联数据) ---
const CustomResponse = t.Composite([
  Generated.Response, // 保持数据库字段同步
  t.Object({
    // 在这里添加关联字段，例如：
    // uploader: t.Optional(UserContract.Response),
    // metadata: t.Optional(MediametadataContract.Response),
    // tags: t.Array(t.String()),
    // fileStats: t.Object({
    //   size: t.Number(),
    //   dimensions: t.Optional(t.Object({
    //     width: t.Number(),
    //     height: t.Number(),
    //   })),
    // }),
    // thumbnailUrl: t.Optional(t.String()),
    // previewUrl: t.Optional(t.String()),
    // downloadUrl: t.String(),
  }),
]);

// --- B. 扩展创建请求 (例如：增加前端特有的校验) ---
const CustomCreate = t.Composite([
  Generated.Create,
  t.Object({
    // 例如：增加"文件描述"和"标签"这些额外的业务字段
    description: t.Optional(t.String()),
    tags: t.Optional(t.Array(t.String())),
    alt: t.Optional(t.String()), // 图片的 alt 文本
    title: t.Optional(t.String()),
    // watermark: t.Optional(t.Boolean()),
    // compress: t.Optional(t.Boolean()),
  }),
]);

// --- C. 自定义业务类型 ---
// 文件上传请求
const UploadRequest = t.Object({
  file: t.File({
    type: ["image/*", "video/*", "application/pdf"],
    maxSize: "10m",
  }),
  category: t.Optional(t.String()),
  description: t.Optional(t.String()),
  tags: t.Optional(t.Array(t.String())),
  alt: t.Optional(t.String()),
  title: t.Optional(t.String()),
  // isPublic: t.Optional(t.Boolean()),
});

// 批量上传请求
const BatchUploadRequest = t.Object({
  files: t.Array(
    t.File({
      type: ["image/*", "video/*", "application/pdf"],
      maxSize: "10m",
    }),
    { minimum: 1, maximum: 10 }
  ),
  category: t.Optional(t.String()),
  description: t.Optional(t.String()),
  tags: t.Optional(t.Array(t.String())),
});

// 媒体查询参数
const MediaQuery = t.Object({
  category: t.Optional(t.String()),
  mimeType: t.Optional(t.String()),
  uploaderId: t.Optional(t.String()),
  tags: t.Optional(t.Array(t.String())),
  dateRange: t.Optional(
    t.Object({
      start: t.String({ format: "date-time" }),
      end: t.String({ format: "date-time" }),
    })
  ),
  sizeRange: t.Optional(
    t.Object({
      min: t.Number({ minimum: 0 }),
      max: t.Number({ minimum: 0 }),
    })
  ),
  isPublic: t.Optional(t.Boolean()),
  hasMetadata: t.Optional(t.Boolean()),
});

// 媒体统计
const MediaStats = t.Object({
  totalCount: t.Number(),
  totalSize: t.Number(),
  categoryStats: t.Array(
    t.Object({
      category: t.String(),
      count: t.Number(),
      size: t.Number(),
    })
  ),
  recentUploads: t.Number(),
  popularTags: t.Array(
    t.Object({
      tag: t.String(),
      count: t.Number(),
    })
  ),
});

// 媒体处理请求
const ProcessMediaRequest = t.Object({
  mediaId: t.String(),
  operations: t.Array(
    t.Object({
      type: t.UnionEnum(["resize", "crop", "compress", "watermark", "format"]),
      params: t.Object({}, { additionalProperties: true }),
    })
  ),
});

// --- D. 组装并导出 ---
export const MediaContract = {
  ...Generated, // 默认继承所有：Update, Patch, ListQuery
  Response: CustomResponse, // 覆盖为自定义详情响应
  Create: CustomCreate, // 覆盖为自定义创建请求

  // 自定义业务类型
  UploadRequest,
  BatchUploadRequest,
  MediaQuery,
  MediaStats,
  ProcessMediaRequest,
} as const;

// --- E. 导出 DTO 类型给前端使用 ---
export type MediaDTO = {
  Response: typeof MediaContract.Response.static;
  Create: typeof MediaContract.Create.static;
  Update: typeof Generated.Update.static; // 未修改的直接透传
  Patch: typeof Generated.Patch.static;
  ListQuery: typeof Generated.ListQuery.static;
  ListResponse: typeof Generated.ListResponse.static & {
    // 如果列表也需要扩展，可以在这里交叉类型
  };

  // 自定义类型
  UploadRequest: typeof MediaContract.UploadRequest.static;
  BatchUploadRequest: typeof MediaContract.BatchUploadRequest.static;
  MediaQuery: typeof MediaContract.MediaQuery.static;
  MediaStats: typeof MediaContract.MediaStats.static;
  ProcessMediaRequest: typeof MediaContract.ProcessMediaRequest.static;
};
