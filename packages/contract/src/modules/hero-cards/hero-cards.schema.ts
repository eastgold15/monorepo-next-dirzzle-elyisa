// 首页展示卡片表 - 存储首页展示的营销卡片信息

import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { createdAt, idUuid, updatedAt } from "../helper/schemaHelper.schema";
import { mediaTable } from "../media/media.schema";

/**
 * 首页展示卡片表 - 存储首页展示的营销卡片信息
 */
export const heroCardsTable = pgTable("hero_cards", {
  id: idUuid, // 卡片唯一标识
  createdAt,
  updatedAt,
  title: varchar("title", { length: 255 }).notNull(), // 卡片标题
  description: text("description").notNull(), // 卡片描述
  buttonText: varchar("button_text", { length: 100 }).notNull(), // 按钮文字
  buttonUrl: varchar("button_url", { length: 500 }), // 按钮跳转链接
  backgroundClass: varchar("background_class", { length: 100 }).default(
    "bg-blue-50"
  ), // 背景样式类
  imageId: uuid("image_id").references(() => mediaTable.id), // 关联媒体文件ID
  sortOrder: integer("sort_order").default(0), // 排序顺序
  isActive: boolean("is_active").default(true), // 是否启用
});

// 创建关联关系
export const heroCardsRelations = relations(heroCardsTable, ({ one }) => ({
  // 每个卡片关联一个媒体文件
  media: one(mediaTable, {
    fields: [heroCardsTable.imageId],
    references: [mediaTable.id],
  }),
}));
