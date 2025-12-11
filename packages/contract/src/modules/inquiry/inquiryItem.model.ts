/**
 * 询价商品项模型定义
 * 询价管理模块 - 商品项子模块
 */

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
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
const Create = Insert.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  // 验证规则
  productId: z.number().int().positive("商品ID必须是正整数"),
  productName: z
    .string()
    .min(1, "商品名称不能为空")
    .max(200, "商品名称不能超过200个字符"),
  quantity: z
    .number()
    .int()
    .min(1, "询价数量至少为1")
    .max(9999, "询价数量不能超过9999"),
  productDescription: z
    .string()
    .max(1000, "商品描述不能超过1000个字符")
    .optional(),
  productPrice: z.number().min(0, "商品价格不能为负数").optional(),
  productImage: z.string().url("请输入有效的图片链接").optional(),
  customerRequirements: z
    .string()
    .max(500, "客户要求不能超过500个字符")
    .optional(),
});

// Update: 业务更新 Schema，用于全量更新
const Update = UpdateBase.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  // 验证规则
  productId: z.number().int().optional(),
  productName: z.string().min(1).max(200).optional(),
  quantity: z.number().int().min(1).max(9999).optional(),
  productDescription: z.string().max(1000).optional(),
  productPrice: z.number().min(0).optional(),
  productImage: z.string().url().optional(),
  customerRequirements: z.string().max(500).optional(),
});

// Patch: 部分更新 Schema，所有字段可选
const Patch = UpdateBase.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

// ===== 第三层：查询 Schema（查询层） =====

// BusinessQuery: 业务查询参数
const BusinessQuery = z.object({
  inquiryId: z.string().optional(), // 询价ID
  productId: z.string().optional(), // 商品ID
  quantity: z.coerce.number().optional(), // 数量筛选
  minPrice: z.coerce.number().min(0).optional(), // 最低价格
  maxPrice: z.coerce.number().min(0).optional(), // 最高价格
});

// ListQuery: 列表查询 Schema，包含分页和排序
const ListQuery = BusinessQuery.extend(PaginationParams.shape).extend(
  SortParams.shape
);

// ===== 第四层：视图 Schema（展示层） =====

// Entity: 实体视图 Schema，用于返回给前端
const Entity = Select.extend({
  // 商品信息扩展
  product: z
    .object({
      id: z.number(),
      name: z.string(),
      slug: z.string(),
      merchantId: z.number(),
      images: z.array(z.any()).optional(),
    })
    .optional(),
  // 询价信息
  inquiry: z
    .object({
      id: z.number(),
      inquiryNumber: z.string(),
      customerName: z.string(),
      email: z.string(),
    })
    .optional(),
});

// Brief: 简要信息 Schema（用于列表展示）
const Brief = Select.pick({
  id: true,
  inquiryId: true,
  productId: true,
  productName: true,
  quantity: true,
  productPrice: true,
  createdAt: true,
});

// ProductInfo: 商品信息 Schema（用于商品关联）
const ProductInfo = Select.pick({
  id: true,
  inquiryId: true,
  productId: true,
  productName: true,
  productDescription: true,
  productImage: true,
  productPrice: true,
});

// ===== 特殊业务 Schema =====

// 批量操作
const BatchDelete = z.object({
  ids: z.array(z.string()).min(1, "至少选择一个询价商品项"),
});

const BatchUpdate = z.object({
  ids: z.array(z.string()).min(1, "至少选择一个询价商品项"),
  data: Patch,
});

// Excel导出结构
const ExcelExport = z.object({
  productName: z.string(),
  productDescription: z.string().optional(),
  productImage: z.string().optional(),
  productPrice: z.number().optional(),
  quantity: z.number(),
  customerRequirements: z.string().optional(),
  totalPrice: z.number().optional(),
  merchantName: z.string().optional(),
});

// ===== 值聚合导出（运行时 Schema） =====
export const InquiryItemModel = {
  // 基础 Schema
  Insert,
  UpdateBase,
  Update,
  Select,

  // 业务 Schema
  Create,
  Patch,
  ListQuery,
  BusinessQuery,
  Entity,
  Brief,
  ProductInfo,

  // 特殊 Schema
  BatchDelete,
  BatchUpdate,
  ExcelExport,
} as const;

// ===== 类型聚合导出（编译时类型） =====
export type InquiryItemModel = {
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

  // 视图类型
  Entity: z.infer<typeof Entity>;
  Brief: z.infer<typeof Brief>;
  ProductInfo: z.infer<typeof ProductInfo>;

  // 特殊操作类型
  BatchDelete: z.infer<typeof BatchDelete>;
  BatchUpdate: z.infer<typeof BatchUpdate>;
  ExcelExport: z.infer<typeof ExcelExport>;
};
