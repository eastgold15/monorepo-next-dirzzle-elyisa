/**
 * 询价模型定义
 * 询价管理模块
 */

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { PaginationParams, SortParams } from "../helper/query-types";
import { inquiryTable } from "./inquiry.schema";
import { InquiryItemModel } from "./inquiryItem.model";

// ===== 第一层：基础 Schema（数据库层） =====

// Insert: 插入数据 Schema，包含所有字段
const Insert = createInsertSchema(inquiryTable);

// UpdateBase: 基础更新 Schema，包含所有可更新字段
const UpdateBase = createUpdateSchema(inquiryTable);

// Select: 查询结果 Schema，完整的实体结构
const Select = createSelectSchema(inquiryTable);

// ===== 第二层：业务 Schema（应用层） =====

// Create: 创建 Schema，排除自动生成字段
const Create = Insert.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  // 验证规则
  customerName: z
    .string()
    .min(1, "客户姓名不能为空")
    .max(100, "客户姓名不能超过100个字符"),
  email: z.email("请输入有效的邮箱地址"),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  companyName: z.string().max(200, "公司名称不能超过200个字符").optional(),
  notes: z.string().optional(),
});

// Update: 业务更新 Schema，用于全量更新
const Update = UpdateBase.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  // 验证规则
  customerName: z.string().min(1, "客户姓名不能为空").max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  companyName: z.string().max(200).optional(),
  notes: z.string().optional(),
});

// Patch: 部分更新 Schema，所有字段可选
const Patch = UpdateBase.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

// CreateWithItems: 创建询价（包含商品项）
const CreateWithItems = Create.extend({
  itemsId: z.array(z.string()).min(1, "至少需要询价一个商品"),
});

// ===== 第三层：查询 Schema（查询层） =====

// BusinessQuery: 业务查询参数
const BusinessQuery = z.object({
  status: z.enum(["pending", "sent", "completed"]).optional(),
  email: z.string().optional(),
  sessionId: z.string().optional(),
  productId: z.string().optional(), // 查询包含特定商品的询价
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// ListQuery: 列表查询 Schema，包含分页和排序
const ListQuery = BusinessQuery.extend(PaginationParams.shape).extend(
  SortParams.shape
);

// ===== 第四层：视图 Schema（展示层） =====

// Entity: 实体视图 Schema，用于返回给前端
const Entity = Select.extend({
  // 统计字段
  itemCount: z.number().default(0),
  // 商品项列表
  items: z.array(InquiryItemModel.Select).default([]),
});

// Brief: 简要信息 Schema（用于列表展示）
const Brief = Select.pick({
  id: true,
  customerName: true,
  companyName: true,
  email: true,
  status: true,
  emailSent: true,
  createdAt: true,
}).extend({
  itemCount: z.number().default(0),
});

// CustomerSession: 客户会话信息 Schema
const CustomerSession = Select.pick({
  id: true,
  customerName: true,
  email: true,
  phone: true,
  whatsapp: true,
  companyName: true,
  sessionId: true,
  createdAt: true,
});

// EmailInfo: 邮件发送信息 Schema（扩展）
const EmailInfo = Select.pick({
  id: true,
  customerName: true,
  email: true,
  companyName: true,
  createdAt: true,
}).extend({
  inquiryNumber: z.string(),
  itemCount: z.number(),
});

// ===== 特殊业务 Schema =====

// 批量操作
const BatchDelete = z.object({
  ids: z.array(z.string()).min(1, "至少选择一个询价记录"),
});

const BatchUpdate = z.object({
  ids: z.array(z.string()).min(1, "至少选择一个询价记录"),
  data: Patch,
});

// 状态更新
const StatusUpdate = z.object({
  status: z.enum(["pending", "sent", "completed"]),
  emailSent: z.boolean().optional(),
  emailSentAt: z.date().optional(),
});

// 邮件发送
const EmailSend = z.object({
  inquiryId: z.string(),
  recipientEmail: z.string().email(),
  subject: z.string().optional(),
  includeExcel: z.boolean().default(true),
});

// Excel导出数据结构
const ExcelData = z.object({
  inquiry: z.object({
    inquiryNumber: z.string(),
    customerName: z.string(),
    companyName: z.string().optional(),
    email: z.string(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    notes: z.string().optional(),
    createdAt: z.date(),
  }),
  items: z.array(InquiryItemModel.ExcelExport),
});

// ===== 枚举定义 =====
export const InquiryStatusEnum = z.enum(["pending", "sent", "completed"]);

export type InquiryStatusEnum = z.infer<typeof InquiryStatusEnum>;

// ===== 值聚合导出（运行时 Schema） =====
export const InquiryModel = {
  // 基础 Schema
  Insert,
  UpdateBase,
  Select,

  // 业务 Schema
  Create,
  Update,
  Patch,
  ListQuery,
  Entity,
  Brief,
  BusinessQuery,
  CreateWithItems,

  // 特殊 Schema
  BatchDelete,
  BatchUpdate,
  StatusUpdate,
  EmailSend,
  CustomerSession,
  EmailInfo,
  ExcelData,

  // 枚举
  InquiryStatusEnum,
} as const;

// ===== 类型聚合导出（编译时类型） =====
export type InquiryModel = {
  // 基础类型
  Insert: z.infer<typeof Insert>;
  UpdateBase: z.infer<typeof UpdateBase>;
  Select: z.infer<typeof Select>;

  // 业务类型（输入类型）
  Create: z.infer<typeof Create>;
  Update: z.infer<typeof Update>;
  Patch: z.infer<typeof Patch>;
  ListQuery: z.infer<typeof ListQuery>;
  BusinessQuery: z.infer<typeof BusinessQuery>;
  CreateWithItems: z.infer<typeof CreateWithItems>;

  // 视图类型
  Entity: z.infer<typeof Entity>;
  Brief: z.infer<typeof Brief>;
  CustomerSession: z.infer<typeof CustomerSession>;
  EmailInfo: z.infer<typeof EmailInfo>;
  ExcelData: z.infer<typeof ExcelData>;

  // 特殊操作类型
  BatchDelete: z.infer<typeof BatchDelete>;
  BatchUpdate: z.infer<typeof BatchUpdate>;
  StatusUpdate: z.infer<typeof StatusUpdate>;
  EmailSend: z.infer<typeof EmailSend>;

  // 枚举类型
  InquiryStatusEnum: z.infer<typeof InquiryStatusEnum>;
};
