import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { categoriesTable } from "../category/category.schema";
import { createdAt, idUuid } from "../helper/schemaHelper.schema";
import { productTemplateTable } from "./product.schema";

export const InputTypeEnum = pgEnum("input_type", ["select", "text", "number"]);

// 1. 属性模板表
export const attributeTemplateTable = pgTable("attribute_templates", {
  id: idUuid,
  createdAt,
  name: varchar("name", { length: 100 }).notNull(), // 模板名称，如：服装模板
  categoryId: uuid("category_id")
    .references(() => categoriesTable.id)
    .notNull(), // 关联分类
});

// 属性定义关系
export const attributeTemplateRelations = relations(
  attributeTemplateTable,
  ({ many, one }) => ({
    attributes: many(attributeTable),
    productTemplates: many(productTemplateTable),
    category: one(categoriesTable, {
      fields: [attributeTemplateTable.categoryId],
      references: [categoriesTable.id],
    }),
  })
);

// 2. 属性定义表
export const attributeTable = pgTable("attributes_table", {
  id: idUuid,
  createdAt,
  templateId: uuid("template_id")
    .references(() => attributeTemplateTable.id)
    .notNull(), // 所属模板
  name: varchar("name", { length: 100 }).notNull(), // 属性名，如：颜色
  code: varchar("code", { length: 50 }).notNull(), // 属性编码，如：color
  inputType: InputTypeEnum("input_type").default("select"), // select / text / number
  isRequired: boolean("is_required").default(true), // 是否必填
  isSaleAttr: boolean("is_sale_attr").default(true), // 是否销售属性（影响SKU）
  sortOrder: integer("sort_order").default(0),
});

// 属性定义关系
export const attributeRelations = relations(
  attributeTable,
  ({ one, many }) => ({
    template: one(attributeTemplateTable, {
      fields: [attributeTable.templateId],
      references: [attributeTemplateTable.id],
    }),
    values: many(attributeValueTable),
  })
);

// 3. 属性值表（仅用于 input_type = 'select' 的属性）
export const attributeValueTable = pgTable("attribute_values_table", {
  id: idUuid,
  createdAt,
  attributeId: uuid("attribute_id")
    .references(() => attributeTable.id)
    .notNull(), // 关联属性
  value: varchar("value", { length: 100 }).notNull(), // 显示值，如：红色
  valueCode: varchar("value_code", { length: 50 }).notNull(), // 编码，如：red
  sortOrder: integer("sort_order").default(0),
});

// 属性值关系
export const attributeValueRelations = relations(
  attributeValueTable,
  ({ one }) => ({
    attribute: one(attributeTable, {
      fields: [attributeValueTable.attributeId],
      references: [attributeTable.id],
    }),
  })
);
