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
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";
import { usersTable } from "../01auth/auth.schema";
import { adsTable } from "../ads/ads.schema";
import { createdAt, idUuid, updatedAt } from "../helper/schemaHelper.schema";
import { productMediaTable } from "../product/product.schema";
export const mediaStatusEnum = pgEnum("media_status", ["active", "deleted"]);
export const mediaTable = pgTable("file", {
  id: idUuid, // 文件唯一标识
  createdAt,
  updatedAt,
  storage_key: varchar("storage_key", { length: 255 }).notNull(), // 存储后端键（相对路径或对象键）
  bucket_name: varchar("bucket_name", { length: 255 }).notNull(),
  user_id: varchar("user_id", { length: 255 }).references(() => usersTable.id, {
    onDelete: "cascade",
  }), // 上传用户ID
  original_name: varchar("original_name", { length: 255 }).notNull(),
  mime_type: varchar("mime_type", { length: 100 }).notNull(), // 文件MIME类型
  file_hash: varchar("file_hash", { length: 255 }).notNull(),
  status: boolean("status").notNull().default(true), // 文件状态（是否可用）
  is_public: boolean("is_public").notNull().default(false), // 是否公开文件（默认不公开）
});

export const mediaMetadataTable = pgTable("media_metadata", {
  id: idUuid, // 媒体文件元数据唯一标识
  file_id: idUuid
    .references(() => mediaTable.id, { onDelete: "cascade" })
    .notNull(), // 关联文件ID
  media_type: varchar("media_type", { length: 50 }).notNull(), // 媒体类型（image, video, document, audio, other）
  width: integer("width"), // 宽度（图片/视频）
  height: integer("height"), // 高度（图片/视频）
  duration: integer("duration"), // 时长（视频/音频，秒）
  metadata_json: text("metadata_json").default(""), // 元数据（JSON格式）
  thumbnail_key: varchar("thumbnail_key", { length: 255 }), // 缩略图键（图片）
});





// 创建关联关系
export const mediaRelations = relations(mediaTable, ({ many }) => ({
  // 媒体文件可以被多个广告使用 - 外键在advertisements表中
  ads: many(adsTable),
  // 媒体文件可以被多个商品使用(通过中间表)
  productMedia: many(productMediaTable),
}));
