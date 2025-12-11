import {
  boolean,
  integer,
  json,
  pgTable,
  text,
  varchar,
} from "drizzle-orm/pg-core";
import { createdAt, idUuid, updatedAt } from "../helper/schemaHelper.schema";

/**
 * 1. Drizzle 表定义
 * 翻译字典表 - 存储多语言翻译字典数据
 * 支持存储各种类型的翻译内容，包括按钮文本、提示信息等
 */

export const translationDictTable = pgTable("translation_dict", {
  id: idUuid, // 字典项唯一标识
  key: varchar("key", { length: 255 }).notNull().unique(), // 翻译键名，如 "close", "submit", "welcome.message"
  category: varchar("category", { length: 100 }).default("general"), // 分类，如 "common", "button", "message", "error"
  description: text("description"), // 描述，用于说明此翻译项的用途
  translations: json("translations").notNull().$type<Record<string, any>>(), // JSON格式的翻译内容，存储各语言的翻译
  isActive: boolean("is_active").default(true), // 是否启用
  sortOrder: integer("sort_order").default(0), // 排序权重
  createdAt,
  updatedAt,
});
