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
  UploadResponse,
  FolderType,
} as const;

// === 2. 编译时类型集合（类型）===
export type UploadTModel = {
  UploadImage: typeof UploadImage.static;
  UploadImages: typeof UploadImages.static;
  UploadResponse: typeof UploadResponse.static;
  FolderType: typeof FolderType.static;
};
