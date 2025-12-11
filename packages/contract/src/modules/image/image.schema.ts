// 图片表 - 存储系统中的所有图片信息
// 支持多种用途的图片管理（产品图片、广告图片等）

import { integer, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";
import { adsTable } from "../ads/ads.schema";
import { createdAt, idUuid, updatedAt } from "../helper/schemaHelper.schema";
import { productMediaTable } from "../product/product.schema";

/**
 * 1. Drizzle 表定义
 * 图片表 - 存储系统中的所有图片信息
 * 支持多种用途的图片管理（产品图片、广告图片等）
 */
export const imagesTable = pgTable("images", {
  id: idUuid, // 图片唯一标识
  createdAt,
  updatedAt,
  fileName: varchar("file_name", { length: 255 }).notNull(), // 存储文件名
  imageUrl: text("image_url").notNull().unique(), // 图片访问URL - 添加唯一约束用于外键引用
  category: varchar("category", { length: 50 }).notNull().default("general"), // 图片分类
  fileSize: integer("file_size").notNull(), // 文件大小(字节)
  mimeType: varchar("mime_type", { length: 100 }).notNull(), // 文件MIME类型
  alt: text("alt").default(""), // 图片ALT文本
});

//5. 创建关联
export const imagesRelations = relations(imagesTable, ({ many }) => ({
  // 图片可以被多个广告使用 - 外键在advertisements表中
  advertisements: many(adsTable),
  // 图片可以被多个商品使用(通过中间表)
  productImages: many(productMediaTable),
}));
