// 商品统计表 - 存储商品相关的统计数据

import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { createdAt, idUuid, updatedAt } from "../helper/schemaHelper.schema";

export const productStatisticsTable = pgTable("product_statistics", {
  id: idUuid, // 统计记录唯一标识
  createdAt,
  updatedAt,
  productId: integer("product_id"), // 商品ID
  date: varchar("date", { length: 10 }).notNull(), // 统计日期 (YYYY-MM-DD)
  viewType: varchar("view_type", { length: 50 }).notNull(), // 查看类型 (view, search, favorite)
  count: integer("count").default(0).notNull(), // 查看次数
});
