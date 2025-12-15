/**
 * 询价模型定义
 * 询价管理模块
 */

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { t } from "elysia";
import { inquiryTable } from "../../table.schema";
import { SkuTModel } from "../product/sku.t.model";
import { InquiryItemTModel } from "./inquiryItem.t.model";

// ===== 第一层：基础 Schema（数据库层） =====

// Insert: 插入数据 Schema，包含所有字段
const Insert = createInsertSchema(inquiryTable);
// UpdateBase: 基础更新 Schema，包含所有可更新字段
const UpdateBase = createUpdateSchema(inquiryTable);
// Select: 查询结果 Schema，完整的实体结构
const Select = createSelectSchema(inquiryTable);

// ===== 第二层：业务 Schema（应用层） =====

// Create: 创建 Schema，排除自动生成字段
const Create = Insert;
// Update: 业务更新 Schema，用于全量更新
const Update = UpdateBase;
// Patch: 部分更新 Schema，所有字段可选
const Patch = UpdateBase;
const Entity = t.Omit(Select, ["id", "updatedAt"]);

// ===== 第三层：查询 Schema（查询层） =====

// ===== 第四层：视图 Schema（展示层） =====

// Entity: 实体视图 Schema，用于返回给前端

const InqueryWithItem = t.Intersect([
  Entity,
  t.Object({
    // 统计字段
    itemCount: t.Number(),
    // 商品项列表
    items: t.Array(InquiryItemTModel.Entity), // 统计字段
  }),
]);

export const CustomerSubmitForm = t.Object({
  customerName: t.String(),
  customerCompany: t.String(),
  customerEmail: t.String(),
  customerPhone: t.Number(),
  customerWhatsapp: t.String(),
  customerRemarks: t.String(),
});

const SkuSchema = SkuTModel.EntityWithMeida;
const OrderInfo = t.Object({
  productId: t.String(),
  productName: t.Optional(t.String()),
  sku: SkuSchema,
  specs: t.String(),
  quantity: t.Number(),
  paymentMethod: t.String(),
  productDesc: t.String(),
  unit: t.String(),
});
const InquriryOrder = t.Intersect([OrderInfo, CustomerSubmitForm]);

// ===== 值聚合导出（运行时 Schema） =====
export const InquiryTModel = {
  // 基础 Schema
  Insert,
  UpdateBase,
  Select,
  Entity,
  // 业务 Schema
  Create,
  Update,
  Patch,

  InqueryWithItem,

  InquriryOrder,
  // 枚举

  ClientSubmitForm: CustomerSubmitForm,
} as const;

// ===== 类型聚合导出（编译时类型） =====
export type InquiryTModel = {
  // 基础类型
  Insert: typeof Insert.static;
  UpdateBase: typeof UpdateBase.static;
  Select: typeof Select.static;

  // 业务类型（输入类型）
  Create: typeof Create.static;
  Update: typeof Update.static;
  ClientSubmitForm: typeof CustomerSubmitForm.static;
  InqueryWithItem: typeof InqueryWithItem.static;
  InquriryOrder: typeof InquriryOrder.static;
};
