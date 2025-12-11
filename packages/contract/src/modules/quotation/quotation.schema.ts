/**
 * 询价单（Quotation）Schema定义
 * 在 contract 包中定义，供前后端共享
 */

import { relations } from "drizzle-orm";
import { date, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { exportersTable } from "../01exporter/exporter.schema";
import { CustomerTable } from "../customer/customer.schema";
import { createdAt, idUuid, updatedAt } from "../helper/schemaHelper.schema";

// 询价单表
export const quotationsTable = pgTable("quotations", {
  id: idUuid,
  createdAt,
  updatedAt,

  // 基本信息
  refNo: varchar("ref_no", { length: 50 }).notNull(), // 报价单编号
  date: date("date").notNull(), // 日期

  // 关联信息
  clientId: uuid("client_id")
    .references(() => CustomerTable.id, { onDelete: "restrict" })
    .notNull(), // 客户
  exporterId: uuid("exporter_id")
    .references(() => exportersTable.id, { onDelete: "restrict" })
    .notNull(), // 出口商（卖方）

  // 交期信息
  deliveryTimeDays: varchar("delivery_time_days", { length: 50 }), // 交期（如 "35-45"）
  sampleLeadtimeDays: varchar("sample_leadtime_days", { length: 50 }), // 样品周期

  // 付款条款
  paymentTerms: text("payment_terms"), // 付款条款

  // 质量要求
  qualityRemark: text("quality_remark"), // 质量要求
  safetyCompliance: text("safety_compliance"), // 安全合规（如 EN71）

  // 状态
  status: varchar("status", { length: 20 }).default("draft").notNull(), // 状态（Draft / Confirmed / Signed）
});

// 询价单关系定义
export const quotationRelations = relations(
  quotationsTable,
  ({ one, many }) => ({
    client: one(CustomerTable, {
      fields: [quotationsTable.clientId],
      references: [CustomerTable.id],
    }),
    exporter: one(exportersTable, {
      fields: [quotationsTable.exporterId],
      references: [exportersTable.id],
    }),
  })
);
