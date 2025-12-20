// Inquiry module contract - 自定义扩展
// 用于询价管理

import { t } from "elysia";
// 1. 导入自动生成的原始契约
import { InquiryContract as Generated } from "../_generated/inquiry.contract";
import { InquiryitemsContract } from "../_generated/inquiryitems.contract";
import { MediaContract } from "../_generated/media.contract";
import { ProductsContract } from "../_generated/products.contract";
import { SkusContract } from "../_generated/skus.contract";
import { CustomersContract } from "../_generated/customers.contract";
import { SalespersonsContract } from "../_generated/salespersons.contract";

/**
 * 自定义扩展契约：Inquiry
 * 模式：继承基础字段 + 叠加询价业务特有的复杂逻辑
 */

// --- A. 扩展响应结构 (增加关联数据) ---
const CustomResponse = t.Composite([
  Generated.Response, // 保持数据库字段同步
  t.Object({
    // 关联的询价项目
    items: t.Optional(t.Array(InquiryItemsContract.Response)),
    // 商品信息
    product: t.Optional(ProductsContract.Response),
    // SKU信息
    sku: t.Composite([
      SkusContract.Response,
      t.Object({
        // SKU关联的媒体文件
        media: t.Optional(MediaContract.Response),
      }),
    ]),
    // 额外的业务字段
    _extra: t.Optional(t.Any()), // 预留临时扩展位
  }),
]);

// --- B. 扩展创建请求 (前端特有的字段) ---
const CustomCreate = t.Composite([
  Generated.Create,
  t.Object({
    // SKU对象（包含媒体信息）
    sku: t.Composite([
      SkusContract.Response,
      t.Object({
        media: t.Optional(MediaContract.Response),
      }),
    ]),
    // 客户信息（可能不在主表）
    customerName: t.String(),
    customerCompany: t.Optional(t.String()),
    customerPhone: t.Optional(t.String()),
    customerWhatsapp: t.Optional(t.String()),
    customerEmail: t.Optional(t.String()),
    customerRemarks: t.Optional(t.String()),
    // 产品描述（富文本）
    productDesc: t.Optional(t.String()),
    // 产品名称（冗余存储，方便查询）
    productName: t.Optional(t.String()),
    // 支付方式
    paymentMethod: t.Optional(t.String()),
    // 数量
    quantity: t.Optional(t.Number()),
  }),
]);

// --- C. 扩展查询参数 ---
const CustomListQuery = t.Composite([
  Generated.ListQuery,
  t.Object({
    // 按客户邮箱筛选
    customerEmail: t.Optional(t.String()),
    // 按客户手机筛选
    customerPhone: t.Optional(t.String()),
    // 按状态筛选
    status: t.Optional(
      t.Union([
        t.Literal("pending"),
        t.Literal("processing"),
        t.Literal("completed"),
        t.Literal("cancelled"),
      ])
    ),
    // 按商品ID筛选
    productId: t.Optional(t.String()),
    // 时间范围筛选
    startDate: t.Optional(t.Date()),
    endDate: t.Optional(t.Date()),
  }),
]);

// --- D. 组装并导出 ---
export const InquiryContract = {
  ...Generated, // 默认继承所有：Update, Patch
  Response: CustomResponse, // 覆盖为自定义详情响应
  Create: CustomCreate, // 覆盖为自定义创建请求
  ListQuery: CustomListQuery, // 覆盖为自定义查询请求
} as const;

// --- E. 导出 DTO 类型给前端使用 ---
export type InquiryDTO = {
  Response: typeof InquiryContract.Response.static;
  Create: typeof InquiryContract.Create.static;
  Update: typeof Generated.Update.static; // 未修改的直接透传
  Patch: typeof Generated.Patch.static;
  ListQuery: typeof InquiryContract.ListQuery.static;
  ListResponse: typeof Generated.ListResponse.static;
};

// --- F. 导出业务类型 ---
export type InquiryWithItems = {
  id: string;
  customerName: string;
  customerCompany: string | null;
  customerEmail: string;
  customerPhone: string | null;
  customerWhatsapp: string;
  status: string;
  itemCount: number;
  createdAt: Date;
  items: Array<{
    id: string;
    inquiryId: string;
    skuId: string;
    skuPrice: number;
    productName: string;
    productDescription: string | null;
    skuImage: string;
    skuQuantity: number;
    paymentMethod: string | null;
    customerRequirements: string | null;
    createdAt: Date;
  }>;
};
