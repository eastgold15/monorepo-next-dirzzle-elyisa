/**
 * 工厂分类关联表 Schema定义
 * 支持工厂与分类的多对多关系
 */

import { relations } from "drizzle-orm";
import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { categoriesTable } from "../../table";
import { factoriesTable } from "./factory.schema";

// 工厂分类关联表
export const factoryCategoryTable = pgTable(
  "factory_category",
  {
    // 工厂ID
    factoryId: uuid("factory_id")
      .references(() => factoriesTable.id, { onDelete: "cascade" })
      .notNull(),
    // 分类ID
    categoryId: uuid("category_id")
      .references(() => categoriesTable.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.factoryId, table.categoryId] })]
);

// 工厂分类关联关系定义
export const factoryCategoryRelations = relations(
  factoryCategoryTable,
  ({ one }) => ({
    factory: one(factoriesTable, {
      fields: [factoryCategoryTable.factoryId],
      references: [factoriesTable.id],
    }),
    category: one(categoriesTable, {
      fields: [factoryCategoryTable.categoryId],
      references: [categoriesTable.id],
    }),
  })
);
