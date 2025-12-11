import { z } from "zod";
import { FOLDDER_TYPE } from "../helper/constant";

// === 枚举 ===
const FolderType = z.enum([
  FOLDDER_TYPE.GENERAL,
  FOLDDER_TYPE.BANNER,
  FOLDDER_TYPE.PRODUCT,
  FOLDDER_TYPE.LOGO,
  FOLDDER_TYPE.USER_AVATAR,
  FOLDDER_TYPE.OTHER,
]);

// === 业务 Schema ===
const UploadImage = z.object({
  file: z.file(), // 在浏览器中是 File，在 Bun/Elysia 中通常是 File-like 对象
  folder: FolderType,
  category: z.string().default("general"),
  alt: z.string().optional(),
  description: z.string().optional(),
  isPublic: z.boolean().default(true),
});

const UploadImages = z.object({
  files: z.array(z.file()), // Elysia 会将多文件解析为 File[]
  folder: FolderType,
  category: z.string().default("general"),
  description: z.string().optional(),
  isPublic: z.boolean().default(true),
});

const UploadResponse = z.object({
  url: z.string(),
  filename: z.string(),
  originalName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  folder: z.string(),
});

// === 1. 运行时 Schema 集合（值）===
export const UploadModel = {
  UploadImage,
  UploadImages,
  UploadResponse,
  FolderType,
} as const;

// === 2. 编译时类型集合（类型）===
export type UploadModel = {
  UploadImage: z.infer<typeof UploadImage>;
  UploadImages: z.infer<typeof UploadImages>;
  UploadResponse: z.infer<typeof UploadResponse>;
  FolderType: z.infer<typeof FolderType>;
};
