/**
 * 客户（Client）Schema定义
 * 在 contract 包中定义，供前后端共享
 */

import { relations } from "drizzle-orm";
import { integer, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createdAt, idUuid, updatedAt } from "../helper/schemaHelper.schema";

// 客户表
export const CustomerTable = pgTable("customer", {
  id: idUuid,
  createdAt,
  updatedAt,

  companyName: varchar("company_name", { length: 200 }).notNull(), // 公司名称
  name: varchar("contact_name", { length: 100 }), // 联系人姓名
  // 联系信息  k
  email: varchar("email", { length: 255 }), // 邮箱
  whatsapp: varchar("whatsapp", { length: 50 }), // WhatsApp
  phone: varchar("phone", { length: 20 }), // 电话
  address: text("address"), // 详细地址
});

// 客户关系定义
export const clientRelations = relations(CustomerTable, ({ many }) => ({
  // 将在后续添加关系
}));
