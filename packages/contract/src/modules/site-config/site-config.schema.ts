// 网站配置表 - 存储网站的各种配置项
// 支持按分类管理不同模块的配置

import { boolean, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createdAt, idUuid, updatedAt } from "../helper/schemaHelper.schema";

export const siteConfigTable = pgTable("site_config", {
  id: idUuid, // 配置项唯一标识
  createdAt,
  updatedAt,
  key: varchar("key", { length: 100 }).notNull().unique(), // 配置键名
  value: text("value").notNull().default(""), // 配置值
  description: text("description").default(""), // 配置项描述
  category: varchar("category", { length: 50 }).default("general"), // 配置分类(general, seo, payment等)
  url: varchar("url", { length: 255 }).default(""), // 访问URL
  translatable: boolean("translatable").default(true), // 是否需要翻译（false=不需要翻译，如邮箱、电话等）
  visible: boolean("visible").default(false), // 是否展示（false=隐藏不展示）
});
