// 商品分类表 - 存储商品的分类信息
// 包含分类的基本信息、层级关系和显示属性

import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { salespersonsTable } from "../01factory/sales_person.schema";
import { createdAt, idUuid, updatedAt } from "../helper/schemaHelper.schema";
import { productsTable } from "../product/product.schema";

export const categoriesTable = pgTable("categories", {
  id: idUuid, // 分类唯一标识
  name: varchar("name", { length: 255 }).notNull(), // 分类名称翻译键，引用 translation_dict.key
  slug: varchar("slug", { length: 100 }).notNull().unique(), // 分类别名，用于URL优化
  description: varchar("description", { length: 255 }).notNull(), // 分类描述翻译键，引用 translation_dict.key
  parentId: uuid("parent_id"), //null 表示顶级分类
  sortOrder: integer("sort_order").default(0), // 排序权重，值越小越靠前
  isVisible: boolean("is_visible").default(true), // 是否在前端显示
  icon: varchar("icon", { length: 255 }).default(""), // 分类图标
  createdAt,
  updatedAt,
});

// 5. 关系定义
export const categoriesRelations = relations(
  categoriesTable,
  ({ one, many }) => ({
    parent: one(categoriesTable, {
      fields: [categoriesTable.parentId],
      references: [categoriesTable.id],
      relationName: "categoryParent",
    }),
    children: many(categoriesTable, {
      relationName: "categoryParent",
    }),
    products: many(productsTable),
    salespersons: many(salespersonsTable, {
      relationName: "salesperson_category",
    }),
  })
);
