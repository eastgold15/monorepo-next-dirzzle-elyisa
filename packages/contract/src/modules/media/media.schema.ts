/**
 * 媒体文件表 - 统一的媒体资源管理
 * 合并了原 images 表的功能，支持多种类型的媒体文件
 */

import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";

import { usersTable } from "../01auth/auth.schema";
import { factoriesTable } from "../01factory/factory.schema";
import { adsTable } from "../ads/ads.schema";
import { createdAt, idUuid, updatedAt } from "../helper/schemaHelper.schema";
import { productMediaTable } from "../product/product.schema";
export const mediaStatusEnum = pgEnum("media_status", ["active", "deleted"]);
export const mediaTable = pgTable("media", {
  id: idUuid, // 文件唯一标识
  createdAt,
  updatedAt,
  storageKey: varchar("storage_key", { length: 255 }).notNull(), // 存储后端键（相对路径或对象键）hash值
  category: varchar("category").notNull(),
  userId: uuid("user_id").references(() => usersTable.id, {
    onDelete: "cascade",
  }), // 上传用户ID（可选）
  factoryId: uuid("factory_id").references(() => factoriesTable.id, {
    onDelete: "cascade",
  }), // 所属工厂ID（可选，用于权限控制）
  originalName: varchar("original_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(), // 文件MIME类型
  status: boolean("status").notNull().default(true), // 文件状态（是否可用）
  isPublic: boolean("is_public").notNull().default(false), // 是否公开文件（默认不公开）
});


// 假设您的 mediaTable 和 mediaMetadataTable 如下定义:
// mediaTable: id (Primary Key)
// mediaMetadataTable: fileId (Foreign Key -> mediaTable.id)

// 假设文件和元数据是一对一关系，外键在 mediaMetadataTable 上。
export const mediaRelations = relations(mediaTable, ({ many, one }) => ({
  // 1. 媒体文件与媒体元数据的一对一关系 (mediaTable -> mediaMetadataTable)
  // fields: mediaTable 中作为引用的字段
  // references: mediaMetadataTable 中被引用的字段
  metadata: one(mediaMetadataTable, {
    fields: [mediaTable.id],
    references: [mediaMetadataTable.fileId],
  }),

  // 2. 媒体文件被多个广告使用 (外键在 adsTable 上)
  ads: many(adsTable),

  // 3. 媒体文件被多个商品使用 (通过中间表 productMediaTable)
  productMedia: many(productMediaTable),
}));


export const mediaTypeEnum = pgEnum("media_type", [
  "image",
  "video",
  "document",
  "audio",
  "other",
]);
export const mediaMetadataTable = pgTable("media_metadata", {
  id: idUuid, // 媒体文件元数据唯一标识
  fileId: uuid("file_id")
    .references(() => mediaTable.id, { onDelete: "cascade" })
    .notNull(), // 关联文件ID
  mediaType: mediaTypeEnum("media_type").notNull(), // 媒体类型（image, video, document, audio, other）
  width: integer("width"), // 宽度（图片/视频）
  height: integer("height"), // 高度（图片/视频）
  duration: integer("duration"), // 时长（视频/音频，秒）
  metadataJson: text("metadata_json").default(""), // 元数据（JSON格式）
  thumbnailKey: varchar("thumbnail_key", { length: 255 }), // 缩略图键（图片）
});


