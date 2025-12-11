/**
 * Media module TypeBox type definitions
 * Unified media file management including images, videos, documents, etc.
 */

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { t } from "elysia";
import { PaginationParams, SortParams } from "../helper/query-types.t.model";
import { mediaTable } from "./media.schema";

// === 枚举 ===
export const FileType = t.Union([
  t.Literal("image"),
  t.Literal("video"),
  t.Literal("document"),
  t.Literal("audio"),
  t.Literal("other"),
]);
export type FileType = typeof FileType.static;

export const StorageProvider = t.Union([
  t.Literal("local"),
  t.Literal("oss"),
  t.Literal("s3"),
]);
export type StorageProvider = typeof StorageProvider.static;

// === 基础 Schema ===
const Insert = createInsertSchema(mediaTable);
const UpdateBase = createUpdateSchema(mediaTable);
const Select = createSelectSchema(mediaTable);

// === 业务 Schema ===
const Create = t.Omit(Insert, ["id", "createdAt", "updatedAt"]); // 文件上传时会自动生成的字段不需要手动提供

const BusinessQuery = t.Object({
  filename: t.Optional(t.String()),
  type: t.Optional(FileType),
  provider: t.Optional(StorageProvider),
  folder: t.Optional(t.String()),
});

const ListQuery = t.Object({
  ...BusinessQuery.properties,
  ...PaginationParams.properties,
  ...SortParams.properties,
});

const Entity = Select;

const FileUpload = t.Object({
  file: t.File(), // 文件上传
  folder: t.Optional(t.String()),
  provider: t.Optional(StorageProvider),
});

// === 1. 运行时 Schema 集合（值）===
export const MediaTModel = {
  Insert,

  Select,
  Create,

  ListQuery,
  Entity,
  BusinessQuery,
  FileUpload,
  FileType,
  StorageProvider,
} as const;

// === 2. 编译时类型集合（类型）===
export type MediaTModel = {
  Insert: typeof Insert.static;

  Select: typeof Select.static;
  Create: typeof Create.static;

  ListQuery: typeof ListQuery.static;
  Entity: typeof Entity.static;
  BusinessQuery: typeof BusinessQuery.static;
  FileUpload: typeof FileUpload.static;
  FileType: FileType;
  StorageProvider: StorageProvider;
};
