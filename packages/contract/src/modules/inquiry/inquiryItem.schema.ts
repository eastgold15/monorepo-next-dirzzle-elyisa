/**
 * 询价商品项数据库Schema定义
 * 独立文件以避免循环依赖
 */

import { relations } from "drizzle-orm";
import { decimal, integer, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";

import { createdAt, idUuid, updatedAt } from "../helper/schemaHelper.schema";
import { skusTable } from "../product/sku.schema";
import { inquiryTable } from "./inquiry.schema";

// 询价商品明细表
export const inquiryItemsTable = pgTable("inquiry_items", {
  id: idUuid,
  createdAt,
  updatedAt,

  inquiryId: uuid("inquiry_id")
    .references(() => inquiryTable.id, { onDelete: "cascade" })
    .notNull(),
  skuId: uuid("Sku_id")
    .references(() => skusTable.id)
    .notNull(),
  // 商品快照（防止商品信息变更）
  productName: varchar("product_name", { length: 255 }).notNull(),
  productDescription: text("product_description"),
  skuQuantity: integer("sku_quantity").notNull(),
  skuImage: varchar("sku_image", { length: 500 }), // 主图URL
  skuPrice: decimal("sku_price", { precision: 10, scale: 2 }),
  paymentMethod: varchar("payment_method", { length: 255 }).notNull(),
  // 询价要求
  customerRequirements: text("customer_requirements"), // 客户特殊要求
});

// 询价商品项关系定义
export const inquiryItemsRelations = relations(
  inquiryItemsTable,
  ({ one }) => ({
    inquiry: one(inquiryTable, {
      fields: [inquiryItemsTable.inquiryId],
      references: [inquiryTable.id],
    }),
  })
);
