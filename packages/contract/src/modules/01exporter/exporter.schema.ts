/**
 * 出口商（Exporter）Schema定义
 * 在 contract 包中定义，供前后端共享
 */

import { boolean, json, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createdAt, idUuid, updatedAt } from "../helper/schemaHelper.schema";
export type BankInfo = {
  beneficiary: string;
  accountNo: string; //账号
};
// 出口商表
export const exportersTable = pgTable("exporters", {
  id: idUuid,
  createdAt,
  updatedAt,

  // 基本信息
  name: varchar("name", { length: 200 }).notNull(), // 出口商公司名称
  code: varchar("code", { length: 50 }).unique().notNull(), // 出口商编码，用于业务识别
  // 地址信息
  address: text("address"), // 地址
  website: varchar("website", { length: 500 }), // 官网

  bankInfo: json("bank_info").$type<BankInfo>(),
  // 状态
  isActive: boolean("is_active").default(true).notNull(), // 是否激活
  isVerified: boolean("is_verified").default(false).notNull(), // 是否已认证
});

// 出口商关系定义（将在 relations.ts 文件中定义）
export const exporterRelations = null;
