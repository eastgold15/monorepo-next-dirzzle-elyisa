/**
 * 商品-工厂关系（Product Factories）Schema定义
 * 处理商品与工厂的多对多关系
 * 在 contract 包中定义，供前后端共享
 */

import { relations } from "drizzle-orm";
import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { factoriesTable } from "../01factory/factory.schema";
import { productsTable } from "./product.schema";

// 商品-工厂关联表
export const productFactoriesTable = pgTable(
  "product_factories",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => productsTable.id, { onDelete: "cascade" }), // 商品
    factoryId: uuid("factory_id")
      .notNull()
      .references(() => factoriesTable.id, { onDelete: "cascade" }), // 工厂
  },
  (table) => [
    primaryKey({ columns: [table.productId, table.factoryId] }), // 联合主键
  ]
);

// 商品-工厂关系定义
export const productFactoryRelations = relations(
  productFactoriesTable,
  ({ one }) => ({
    product: one(productsTable, {
      fields: [productFactoriesTable.productId],
      references: [productsTable.id],
    }),
    factory: one(factoriesTable, {
      fields: [productFactoriesTable.factoryId],
      references: [factoriesTable.id],
    }),
  })
);
