/**
 * Media module TypeBox type definitions
 * Unified media file management including images, videos, documents, etc.
 */

import { Type as t } from "@sinclair/typebox";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { PaginationParams, SortParams } from "../helper/query-types.t.model";

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

import { mediaTable } from "../../table.schema";
import { FileType } from "../../helper/constant";
import { MediaMetaTModel } from "./meta.t.model";

// === 业务 Schema ===
const Create = t.Omit(Insert, ["id", "createdAt", "updatedAt", "bucket_name"]); // 文件上传时会自动生成的字段不需要手动提供

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
  media: Create,
  meta: MediaMetaTModel.UploadCreate,
});

const PresignUrlQuery = t.Object({
  mimeType: t.String(),
  fileNameHash: t.String(),
  category: t.Optional(t.String()),
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
  PresignUrlQuery,
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
  PresignUrlQuery: typeof PresignUrlQuery.static;
};
