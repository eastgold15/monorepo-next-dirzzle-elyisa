/**
 * 媒体文件模型定义
 * 统一的媒体文件管理，包含图片、视频、文档等所有媒体类型
 */

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { FOLDDER_TYPE } from "../helper/constant";
import { PaginationParams, SortParams } from "../helper/query-types";
import { mediaTable } from "./media.schema";

// === 枚举 ===
export const FileType = z.enum([
  "image",
  "video",
  "document",
  "audio",
  "other",
]);
export type FileType = z.infer<typeof FileType>;

export const StorageProvider = z.enum(["local", "oss", "s3"]);
export type StorageProvider = z.infer<typeof StorageProvider>;

// === 基础 Schema ===
const Insert = createInsertSchema(mediaTable);
const UpdateBase = createUpdateSchema(mediaTable);
const Select = createSelectSchema(mediaTable);

// === 业务 Schema ===
const Create = Insert.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  // 文件上传时会自动生成的字段不需要手动提供
  url: z.string().optional(),
  key: z.string().optional(),
  fileSize: z.number().optional(),
  storageProvider: z.string().optional(),
});

const Update = UpdateBase.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  // 更新时可以修改的字段
  url: z.string().optional(),
  key: z.string().optional(),
  fileSize: z.number().optional(),
  storageProvider: z.string().optional(),
});

const Patch = UpdateBase.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

const BusinessQuery = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  folder: z.string().optional(),
  fileType: FileType.optional(),
  mimeType: z.string().optional(),
  storageProvider: StorageProvider.optional(),
  isPublic: z.coerce.boolean().optional(),
  entityType: z.string().optional(),
  entityId: z.coerce.string().optional(),
});

const ListQuery = BusinessQuery.extend(PaginationParams.shape).extend(
  SortParams.shape
);

const Entity = Select.extend({
  url: z.string().url(), // 确保返回的是完整 URL
});

const UploadFileDto = z.object({
  file: z.file(),
  folder: z.enum(FOLDDER_TYPE).default(FOLDDER_TYPE.GENERAL),
  category: z.string().default("general"),
  description: z.string().optional(),
  alt: z.string().optional(),
  tags: z.string().optional(),
  isPublic: z.boolean().default(true),
});
const UploadFilesDto = z.object({
  files: z.array(z.file()),
  folder: z.enum(FOLDDER_TYPE).default(FOLDDER_TYPE.GENERAL),
  category: z.string().default("general"),
  description: z.string().optional(),
  tags: z.string().optional(),
  isPublic: z.boolean().default(true),
});

// === 批量操作 Schema ===
const BatchUpload = z.object({
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  media: z.array(
    z.object({
      url: z.string().min(1, "媒体文件URL不能为空"),
      fileType: FileType.default("other"),
      category: z.string().default("general"),
      sortIndex: z.string().default(0),
      alt: z.string().optional(),
      description: z.string().optional(),
    })
  ),
});

const BatchDelete = z.object({
  ids: z.array(z.string()).min(1, "请选择要删除的媒体文件"),
});

const BatchUpdate = z.object({
  ids: z.array(z.string()).min(1, "请选择要更新的媒体文件"),
  updates: z.object({
    category: z.string().optional(),
    folder: z.string().optional(),
    alt: z.string().optional(),
    description: z.string().optional(),
    tags: z.string().optional(),
    isPublic: z.boolean().optional(),
  }),
});

// === 1. 运行时 Schema 集合（值）===
export const MediaModel = {
  Insert,
  Update,
  Select,
  Create,
  Patch,
  ListQuery,
  Entity,
  UploadFileDto,
  UploadFilesDto,
  BatchUpload,
  BatchDelete,
  BatchUpdate,
  FileType,
  StorageProvider,
  BusinessQuery,
} as const;

// === 2. 编译时类型集合（类型）===
export type MediaModel = {
  Insert: z.infer<typeof Insert>;
  Update: z.infer<typeof Update>;
  Select: z.infer<typeof Select>;
  Create: z.infer<typeof Create>;
  Patch: z.infer<typeof Patch>;
  ListQuery: z.infer<typeof ListQuery>;
  Entity: z.infer<typeof Entity>;
  UploadFileDto: z.infer<typeof UploadFileDto>;
  UploadFilesDto: z.infer<typeof UploadFilesDto>;
  BatchUpload: z.infer<typeof BatchUpload>;
  BatchDelete: z.infer<typeof BatchDelete>;
  BatchUpdate: z.infer<typeof BatchUpdate>;
  FileType: z.infer<typeof FileType>;
  StorageProvider: z.infer<typeof StorageProvider>;
  BusinessQuery: z.infer<typeof BusinessQuery>;
};
