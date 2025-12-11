/**
 * 询价商品项模型定义
 * 询价管理模块 - 商品项子模块
 */

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { t } from "elysia";
import { z } from "zod";
import { PaginationParams, SortParams } from "../helper/query-types";
import { inquiryItemsTable } from "./inquiryItem.schema";

// ===== 第一层：基础 Schema（数据库层） =====

// Insert: 插入数据 Schema，包含所有字段
const Insert = createInsertSchema(inquiryItemsTable);

// UpdateBase: 基础更新 Schema，包含所有可更新字段
const UpdateBase = createUpdateSchema(inquiryItemsTable);

// Select: 查询结果 Schema，完整的实体结构
const Select = createSelectSchema(inquiryItemsTable);

// ===== 第二层：业务 Schema（应用层） =====

// Create: 创建 Schema，排除自动生成字段
const Create = Insert;
// Update: 业务更新 Schema，用于全量更新
const Update = UpdateBase;
// Patch: 部分更新 Schema，所有字段可选
const Patch = UpdateBase;

// ===== 第三层：查询 Schema（查询层） =====

// BusinessQuery: 业务查询参数
const BusinessQuery = z.object({
  inquiryId: z.string().optional(), // 询价ID
  productId: z.string().optional(), // 商品ID
  quantity: z.string().optional(), // 数量筛选
  minPrice: z.string().min(0).optional(), // 最低价格
  maxPrice: z.string().min(0).optional(), // 最高价格
});

// ListQuery: 列表查询 Schema，包含分页和排序
const ListQuery = BusinessQuery.extend(PaginationParams.shape).extend(
  SortParams.shape
);

// ===== 第四层：视图 Schema（展示层） =====

// Entity: 实体视图 Schema，用于返回给前端
const Entity = t.Omit(Select, ["id", "updatedAt"]);

// ===== 值聚合导出（运行时 Schema） =====
export const InquiryItemTModel = {
  // 基础 Schema
  Insert,
  UpdateBase,
  Select,
  Entity,
} as const;

// ===== 类型聚合导出（编译时类型） =====
export type InquiryItemTModel = {
  // 基础类型
  Insert: typeof Insert.static;
  UpdateBase: typeof UpdateBase.static;
  Select: typeof Select.static;
  // 视图类型
  Entity: typeof Entity.static;
};
