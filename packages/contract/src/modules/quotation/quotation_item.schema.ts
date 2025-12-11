/**
 * 询价单明细（Quotation Item）Schema定义
 * 在 contract 包中定义，供前后端共享
 */

import { relations } from "drizzle-orm";
import { decimal, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { factoriesTable } from "../01factory/factory.schema";
import { createdAt, idUuid, updatedAt } from "../helper/schemaHelper.schema";
import { productsTable } from "../product/product.schema";
import { quotationsTable } from "./quotation.schema";

// 询价单明细表
export const quotationItemsTable = pgTable("quotation_items", {
  id: idUuid,
  createdAt,
  updatedAt,

  // 关联信息
  quotationId: uuid("quotation_id")
    .references(() => quotationsTable.id, { onDelete: "cascade" })
    .notNull(), // 所属报价单
  productId: uuid("product_id")
    .references(() => productsTable.id, { onDelete: "restrict" })
    .notNull(), // 商品
  factoryId: uuid("factory_id")
    .references(() => factoriesTable.id, { onDelete: "restrict" })
    .notNull(), // 本次报价指定的工厂

  // 价格信息
  unitPriceUsd: decimal("unit_price_usd", {
    precision: 10,
    scale: 2,
  }).notNull(), // 单价
  quantity: integer("quantity").notNull(), // 数量
  totalUsd: decimal("total_usd", { precision: 12, scale: 2 }).notNull(), // 小计

  // 其他信息
  remark: text("remark"), // 备注
});

// 询价单明细关系定义
export const quotationItemRelations = relations(
  quotationItemsTable,
  ({ one }) => ({
    quotation: one(quotationsTable, {
      fields: [quotationItemsTable.quotationId],
      references: [quotationsTable.id],
    }),
    product: one(productsTable, {
      fields: [quotationItemsTable.productId],
      references: [productsTable.id],
    }),
    factory: one(factoriesTable, {
      fields: [quotationItemsTable.factoryId],
      references: [factoriesTable.id],
    }),
  })
);
