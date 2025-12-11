/**
 * 工厂（Factory）Schema定义
 * 在 contract 包中定义，供前后端共享
 */

import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { categoriesTable, productsTable } from "../../table";
import { exportersTable } from "../01exporter/exporter.schema";
import { createdAt, idUuid, updatedAt } from "../helper/schemaHelper.schema";

// 工厂表
export const factoriesTable = pgTable("factories", {
  id: idUuid,
  createdAt,
  updatedAt,

  // 基本信息
  name: varchar("name", { length: 200 }).notNull(), // 工厂名称
  code: varchar("code", { length: 50 }).unique().notNull(), // 工厂编码，用于业务识别

  // 工厂信息
  description: text("description"), // 工厂描述
  website: varchar("website", { length: 500 }).notNull(), // 官网地址
  address: text("address").notNull(), // 详细地址
  categoryId: uuid("category_id").references(() => categoriesTable.id).notNull(),
  contactPhone: integer("contact_phone").notNull(),
  logo: varchar("logo", { length: 500 }), // 工厂Logo URL

  // 出口商关联
  exporterId: uuid("exporter_id").references(() => exportersTable.id), // 所属出口商（若该工厂不独立出口，则挂靠某出口商）

  // 状态
  isActive: boolean("is_active").default(true).notNull(), // 是否激活
  isVerified: boolean("is_verified").default(false).notNull(), // 是否已认证

  // 其他信息
  businessLicense: varchar("business_license", { length: 500 }), // 营业执照图片
  mainProducts: text("main_products"), // 主营产品
  annualRevenue: varchar("annual_revenue", { length: 100 }), // 年营业额
  employeeCount: integer("employee_count"), // 员工数量
});

// 工厂关系定义
export const factoryRelations = relations(factoriesTable, ({ one, many }) => ({
  exporter: one(exportersTable, {
    fields: [factoriesTable.exporterId],
    references: [exportersTable.id],
  }),
  products: many(productsTable),
}));
