// Upload module TypeBox type definitions
// Replaces Zod with TypeBox for runtime validation and type safety

import { t } from "elysia";
import { FOLDDER_TYPE } from "../helper/constant";

// === 枚举 ===
const FolderType = t.UnionEnum([
  FOLDDER_TYPE.GENERAL,
  FOLDDER_TYPE.BANNER,
  FOLDDER_TYPE.PRODUCT,
  FOLDDER_TYPE.LOGO,
  FOLDDER_TYPE.USER_AVATAR,
  FOLDDER_TYPE.OTHER,
]);

// === 业务 Schema ===
const UploadImage = t.Object({
  file: t.File(), // 在浏览器中是 File，在 Bun/Elysia 中通常是 File-like 对象
  folder: FolderType,
  category: t.String({ default: "general" }),
  alt: t.Optional(t.String()),
  description: t.Optional(t.String()),
  isPublic: t.Boolean({ default: true }),
});

const UploadImages = t.Object({
  files: t.Array(t.File()), // Elysia 会将多文件解析为 File[]
  folder: FolderType,
  category: t.String({ default: "general" }),
  description: t.Optional(t.String()),
  isPublic: t.Boolean({ default: true }),
});

const UploadConfig = t.Object({
  category: t.String(), // 文件分类（如：avatar, product, document等）
  mediaType: t.Union([
    t.Literal("image"),
    t.Literal("video"),
    t.Literal("document"),
    t.Literal("audio"),
  ]), // 媒体类型
  multiple: t.Optional(t.Boolean()), // 是否允许多文件
  maxSize: t.Optional(t.Number()), // 最大文件大小（字节）
  maxFiles: t.Optional(t.Number()), // 最大文件数量
  accept: t.Optional(t.String()), // 接受的文件类型
});

const UploadFile = t.Object({
  id: t.String(),
  file: t.Unknown(), // File 对象
  name: t.String(),
  size: t.Number(),
  type: t.String(),
  preview: t.Optional(t.String()),
  progress: t.Number(),
  status: t.Union([
    t.Literal("pending"), // 等待上传
    t.Literal("uploading"), // 上传中
    t.Literal("success"), // 上传成功
    t.Literal("error"), // 上传失败
  ]),
  error: t.Optional(t.String()),
});

const UploadResponse = t.Object({
  url: t.String(),
  filename: t.String(),
  originalName: t.String(),
  fileSize: t.Number(),
  mimeType: t.String(),
  folder: t.String(),
});

// === 1. 运行时 Schema 集合（值）===
export const UploadTModel = {
  UploadImage,
  UploadImages,
  UploadConfig,
  UploadFile,
  UploadResponse,
  FolderType,
} as const;

// === 2. 编译时类型集合（类型）===
export type UploadTModel = {
  UploadImage: typeof UploadImage.static;
  UploadImages: typeof UploadImages.static;
  UploadConfig: typeof UploadConfig.static;
  UploadFile: typeof UploadFile.static;
  UploadResponse: typeof UploadResponse.static;
  FolderType: typeof FolderType.static;
};
