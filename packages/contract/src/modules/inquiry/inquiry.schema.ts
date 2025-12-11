/**
 * 询价相关数据库Schema定义
 * 包含客户询价信息
 */

import { relations } from "drizzle-orm";

import { integer, pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";
import { createdAt, idUuid, updatedAt } from "../helper/schemaHelper.schema";
import { inquiryItemsTable } from "./inquiryItem.schema";

export const inquiryStatusEnum = pgEnum("inquiry_status", [
  "pending",
  "quoted",
  "sent",
  "completed",
  "cancelled",
]);

// 询价主表 - 客户询价信息
export const inquiryTable = pgTable("inquiries", {
  id: idUuid,
  createdAt,
  updatedAt,

  // 客户基本信息
  customerName: varchar("customer_name", { length: 100 }), // 客户姓名
  customerCompany: varchar("company_name", { length: 200 }).notNull(), // 公司名称
  customerEmail: varchar("email", { length: 255 }).notNull(), // 邮箱地址
  customerPhone: integer("phone"), // 手机号
  customerWhatsapp: varchar("whatsapp", { length: 50 }), // WhatsApp号
  // 询价状态
  status: inquiryStatusEnum("status").default("pending").notNull(), // pending/sent/completed
});

// 询价表关系定义
export const inquiryRelations = relations(inquiryTable, ({ one, many }) => ({
  items: many(inquiryItemsTable),
}));
