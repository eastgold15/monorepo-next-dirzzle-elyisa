// 广告表 - 存储网站的广告信息
// 支持多种类型的广告展示和管理

import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createdAt, idUuid, updatedAt } from "../helper/schemaHelper.schema";
import { mediaTable } from "../media/media.schema";

export const adsTypeEnum = pgEnum("ads_type", ["banner", "carousel", "list"]);
export const adsPositionEnum = pgEnum("ads_position", [
  "home-top",
  "home-middle",
  "sidebar",
]);

export const adsTable = pgTable("advertisements", {
  id: idUuid, // 广告唯一标识
  createdAt,
  updatedAt,
  title: varchar("title", { length: 255 }).notNull(), // 广告标题
  description: varchar("description", { length: 255 }).notNull(), // 广告描述
  type: adsTypeEnum("type").notNull(), // 广告类型(banner, carousel, list等)
  image_id: uuid("image_id")
    .notNull()
    .references(() => mediaTable.id), // 广告图片ID - 引用mediaSchema.id
  link: varchar("link", { length: 500 }).notNull(), // 广告链接地址
  position: adsPositionEnum("ads_position").default("home-top"), // 广告显示位置
  sortOrder: integer("sort_order").default(0), // 排序权重
  isActive: boolean("is_active").default(true), // 是否启用
  startDate: timestamp("start_date").notNull(), // 广告开始时间
  endDate: timestamp("end_date").notNull(), // 广告结束时间
});

/**
 * 2. 广告关系定义
 */
export const adsRelations = relations(adsTable, ({ one }) => ({
  // 广告图片关联到图片管理表 - 外键在ads表中
  imageRef: one(mediaTable, {
    fields: [adsTable.image_id],
    references: [mediaTable.id],
  }),
}));
