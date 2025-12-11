// 系统配置表 - 存储系统级别的配置信息
// 包括每日询价计数等系统统计数据

import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createdAt, idUuid, updatedAt } from "../helper/schemaHelper.schema";

// 系统配置表 - 存储各种系统级别的配置和计数
export const systemConfigTable = pgTable("system_config", {
  id: idUuid,
  createdAt,
  updatedAt,

  // 配置键
  configKey: varchar("config_key", { length: 100 }).notNull().unique(),

  // 配置值
  configValue: text("config_value").notNull(),

  // 配置类型
  configType: varchar("config_type", { length: 50 }).default("string"), // string, number, json, date

  // 配置描述
  description: varchar("description", { length: 255 }),
});

// 每日询价计数表 - 记录每天的询价数量
export const dailyInquiryCounterTable = pgTable("daily_inquiry_counter", {
  id: idUuid,
  createdAt,
  updatedAt,

  // 日期 - 格式: YYYY-MM-DD
  date: varchar("date", { length: 10 }).notNull().unique(),

  // 当天的询价总数
  count: integer("count").default(0).notNull(),

  // 最后更新时间
  lastResetAt: timestamp("last_reset_at").defaultNow(),
});
