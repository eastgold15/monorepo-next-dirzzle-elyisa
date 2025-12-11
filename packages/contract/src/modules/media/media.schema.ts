/**
 * 媒体文件表 - 统一的媒体资源管理
 * 合并了原 images 表的功能，支持多种类型的媒体文件
 */

import { boolean, integer, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";
import { adsTable } from "../ads/ads.schema";
import { createdAt, idUuid, updatedAt } from "../helper/schemaHelper.schema";
import { productMediaTable } from "../product/product.schema";

/**
 * 媒体文件表 - 存储系统中的所有媒体文件信息
 * 支持多种用途的媒体管理（产品图片、广告图片、文档、视频等）
 */
export const mediaTable = pgTable("media", {
  id: idUuid, // 媒体文件唯一标识
  createdAt,
  updatedAt,

  // 文件基本信息
  fileName: varchar("file_name", { length: 255 }).notNull(), // 存储文件名
  originalName: varchar("original_name", { length: 255 }).notNull(), // 原始文件名
  url: text("url").notNull().unique(), // 媒体文件访问URL - 添加唯一约束用于外键引用
  key: text("key").notNull(), // 存储后端内部标识（相对路径或对象键）

  // 文件分类和类型
  category: varchar("category", { length: 50 }).notNull().default("general"), // 文件分类
  folder: varchar("folder", { length: 100 }).notNull().default("uploads"), // 存储文件夹
  fileType: varchar("file_type", { length: 50 }).notNull().default("image"), // 文件类型：image, video, document, audio, other
  mimeType: varchar("mime_type", { length: 100 }).notNull(), // 文件MIME类型

  // 文件属性
  fileSize: integer("file_size").notNull(), // 文件大小(字节)
  width: integer("width"), // 宽度（图片/视频）
  height: integer("height"), // 高度（图片/视频）
  duration: integer("duration"), // 时长（视频/音频，秒）

  // 内容描述
  alt: text("alt").default(""), // ALT文本（图片）
  description: text("description").default(""), // 文件描述
  tags: text("tags").default(""), // 标签（逗号分隔）

  // 存储信息
  storageProvider: varchar("storage_provider", { length: 50 })
    .notNull()
    .default("local"), // 存储提供者：local, oss, s3等
  storageConfig: text("storage_config").default(""), // 存储配置（JSON格式）

  // 状态和元数据
  isPublic: boolean("is_public").default(true), // 是否公开访问
  metadata: text("metadata").default(""), // 其他元数据（JSON格式）

  // 关联信息（可选）
  entityType: varchar("entity_type", { length: 50 }).default(""), // 关联实体类型
  entityId: varchar("entity_id", { length: 50 }).default(""), // 关联实体ID
  sortIndex: integer("sort_index").default(0), // 排序索引
});

// 创建关联关系
export const mediaRelations = relations(mediaTable, ({ many }) => ({
  // 媒体文件可以被多个广告使用 - 外键在advertisements表中
  ads: many(adsTable),
  // 媒体文件可以被多个商品使用(通过中间表)
  productImages: many(productMediaTable),
}));
