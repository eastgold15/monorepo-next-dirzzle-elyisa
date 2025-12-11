/**
 * 业务员（Salesperson）模型定义
 * 业务员管理模块
 */

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { PaginationParams, SortParams } from "../helper/query-types";
import { salespersonsTable } from "./sales_person.schema";

// ===== 第一层：基础 Schema（数据库层） =====

// Insert: 插入数据 Schema，包含所有字段
const Insert = createInsertSchema(salespersonsTable);

// UpdateBase: 基础更新 Schema，包含所有可更新字段
const UpdateBase = createUpdateSchema(salespersonsTable);

// Select: 查询结果 Schema，完整的实体结构
const Select = createSelectSchema(salespersonsTable);

// ===== 第二层：业务 Schema（应用层） =====

// Create: 创建 Schema，排除自动生成字段
const Create = Insert.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const Update = UpdateBase.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const Patch = UpdateBase.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

// ===== 第三层：查询 Schema（查询层） =====

const BusinessQuery = z.object({
  name: z.coerce.string().optional(),
  email: z.coerce.string().optional(),
  exporterId: z.string().optional(),
  factoryId: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.optional(z.coerce.string()),
});

const ListQuery = BusinessQuery.extend(PaginationParams.shape).extend(
  SortParams.shape
);

const Entity = Select.extend({
  exporter: z.any().optional(),
  factory: z.any().optional(),
});

// === 特殊业务 Schema ===
const BatchDelete = z.object({
  ids: z.array(z.string()).min(1, "至少选择一个业务员"),
});

const StatusUpdate = z.object({
  id: z.string(),
  isActive: z.boolean(),
});

// === 枚举定义 ===
export const SalespersonStatusEnum = z.enum(["active", "inactive", "pending"]);

// === 1. 运行时 Schema 集合（值）===
export const SalespersonModel = {
  Insert,
  UpdateBase,
  Update,
  Select,
  Create,
  Patch,
  BusinessQuery,
  ListQuery,
  Entity,
  BatchDelete,
  StatusUpdate,
  SalespersonStatusEnum,
} as const;

// === 2. 编译时类型集合（类型）===
export type SalespersonModel = {
  Insert: z.infer<typeof Insert>;
  UpdateBase: z.infer<typeof UpdateBase>;
  Update: z.infer<typeof Update>;
  Select: z.infer<typeof Select>;
  Create: z.infer<typeof Create>;
  Patch: z.infer<typeof Patch>;
  BusinessQuery: z.infer<typeof BusinessQuery>;
  ListQuery: z.infer<typeof ListQuery>;
  Entity: z.infer<typeof Entity>;
  BatchDelete: z.infer<typeof BatchDelete>;
  StatusUpdate: z.infer<typeof StatusUpdate>;
  SalespersonStatusEnum: z.infer<typeof SalespersonStatusEnum>;
};
