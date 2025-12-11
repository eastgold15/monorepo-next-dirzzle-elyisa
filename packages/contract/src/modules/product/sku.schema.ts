import { relations } from "drizzle-orm";
import {
  decimal,
  integer,
  json,
  pgTable,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createdAt, idUuid, updatedAt } from "../helper/schemaHelper.schema";
import { mediaTable } from "../media/media.schema";
import { productsTable } from "./product.schema";

// 5. SKU 表（库存销售单元）
export const skusTable = pgTable("skus_table", {
  id: idUuid,
  createdAt,
  updatedAt,
  skuCode: varchar("sku_code", { length: 100 }).notNull().unique(), // SKU编码
  productId: uuid("product_id").notNull(), // 关联商品
  imageId: uuid("image_id").references(() => mediaTable.id), // 关联媒体文件ID
  price: decimal("price", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"),
  marketPrice: decimal("market_price", { precision: 10, scale: 2 }),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
  weight: decimal("weight", { precision: 8, scale: 3 }).default("0.000"), // kg
  volume: decimal("volume", { precision: 10, scale: 3 }).default("0.000"), // m³
  stock: decimal("stock").default("0"), // 库存
  specJson: json("spec_json").notNull(), // 销售属性快照，如 {"color":"red","size":"m"}
  extraAttributes: json("extra_attributes"), // 非销售属性，如重量、体积、生产日期等
  status: integer("status").notNull().default(1), // 1:可售, 0:停售
});

// SKU 关系（更新）
export const skuRelations = relations(skusTable, ({ one }) => ({
  product: one(productsTable, {
    fields: [skusTable.productId],
    references: [productsTable.id],
  }),
  media: one(mediaTable, {
    fields: [skusTable.imageId],
    references: [mediaTable.id],
  }),
}));
