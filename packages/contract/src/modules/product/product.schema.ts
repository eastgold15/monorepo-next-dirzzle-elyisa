// 商品模块数据库表定义
// 包含商品、SKU、属性模板等完整的商品管理体系

import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { factoriesTable } from "../01factory/factory.schema";
import { categoriesTable } from "../category/category.schema";
import { createdAt, idUuid, updatedAt } from "../helper/schemaHelper.schema";
import { mediaTable } from "../media/media.schema";
import { attributeTemplateTable } from "./attribute.schema";
import { skusTable } from "./sku.schema";

// 1. 商品表 - 存储商品的基本信息、价格、库存等
export const productsTable = pgTable("products_table", {
  id: idUuid, // 商品唯一标识
  createdAt,
  updatedAt,
  spuCode: varchar("spu_code", { length: 64 }).notNull().unique(), // 商品编码
  name: varchar("name", { length: 255 }).notNull(), // 商品名称
  description: text("description"), // 商品详细描述
  status: integer("status").notNull().default(1), // 1:上架, 0:下架

  factoryId: uuid("factory_id").references(() => factoriesTable.id, {
    onDelete: "restrict",
  }), // 所属工厂ID（可选）

  // 商品单位
  units: varchar("units", { length: 20 }), // 单位（如 PCS）
});

export const productsRelations = relations(productsTable, ({ many, one }) => ({
  productMedia: many(productMediaTable),
  productCategories: many(productCategoriesTable),
  skus: many(skusTable),
  productTemplate: many(productTemplateTable),
  productFactories: many(factoriesTable),
  factory: one(factoriesTable, {
    fields: [productsTable.factoryId],
    references: [factoriesTable.id],
  }),
}));

// 6. 商品分类关联表 - 处理商品与分类的多对多关系
export const productCategoriesTable = pgTable("product_categories", {
  productId: uuid("product_id").references(() => productsTable.id).notNull(), // 商品ID
  categoryId: uuid("category_id").references(() => categoriesTable.id).notNull(), // 分类ID
});

export const productCategoriesRelations = relations(
  productCategoriesTable,
  ({ one }) => ({
    product: one(productsTable, {
      fields: [productCategoriesTable.productId],
      references: [productsTable.id],
    }),
    category: one(categoriesTable, {
      fields: [productCategoriesTable.categoryId],
      references: [categoriesTable.id],
    }),
  })
);

// 7. 商品绑定属性模板表
export const productTemplateTable = pgTable("product_template_table", {
  productId: uuid("product_id")
    .primaryKey()
    .references(() => productsTable.id, { onDelete: "cascade" }), // 商品ID
  templateId: uuid("template_id")
    .notNull()
    .references(() => attributeTemplateTable.id), // 模板ID
  createdAt: timestamp("created_at").defaultNow(),
});

// 商品绑定属性模板关系
export const productTemplateRelations = relations(
  productTemplateTable,
  ({ one }) => ({
    product: one(productsTable, {
      fields: [productTemplateTable.productId],
      references: [productsTable.id],
    }),
    template: one(attributeTemplateTable, {
      fields: [productTemplateTable.templateId],
      references: [attributeTemplateTable.id],
    }),
  })
);

// 8. 商品图片关联表 - 处理商品与图片的多对多关系
export const productMediaTable = pgTable("product_images", {
  productId: uuid("product_id")
    .notNull()
    .references(() => productsTable.id), // 商品ID
  imageId: uuid("image_id")
    .references(() => mediaTable.id)
    .notNull(), // 媒体文件ID
  isMain: boolean("is_main").default(false), // 是否主图
});

export const productMediaRelations = relations(
  productMediaTable,
  ({ one }) => ({
    product: one(productsTable, {
      fields: [productMediaTable.productId],
      references: [productsTable.id],
    }),
    media: one(mediaTable, {
      fields: [productMediaTable.imageId],
      references: [mediaTable.id],
    }),
  })
);
