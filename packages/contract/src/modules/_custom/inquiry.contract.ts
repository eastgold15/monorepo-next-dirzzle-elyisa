/**
 * ✍️ 【Contract - 业务自定义层】
 * --------------------------------------------------------
 * 💡 你可以直接在此修改 Response, Create, Update 等字段。
 * 🛡️ 脚本检测到文件存在时永远不会覆盖此处。
 * --------------------------------------------------------
 */
import { t } from "elysia";
import { PaginationParams, SortParams } from "../../helper/query-types.model";
import type { InferDTO } from "../../helper/utils";
import type { inquiryItemsTable, inquiryTable } from "../../table.schema";
import { InquiryBase } from "../_generated/inquiry.contract";

/**
 * Inquiry 契约定义
 * 你可以直接在此处添加或 Omit 字段
 */
export const InquiryContract = {
  // 响应字段 (默认展开所有数据库字段)
  Response: t.Object({
    ...InquiryBase.fields,
  }),

  // 创建请求 (默认排除系统字段) 这是一个特殊，需要满足挺多
  Create: t.Composite([
    t.Object(
      t.Omit(t.Object(InquiryBase.insertFields), [
        "id",
        "createdAt",
        "updatedAt",
        "inquiryNumber",
      ]).properties
    ),
    t.Object({
      productId: t.String(),
      skuId: t.String(),
      quantity: t.Number(),
      productName: t.String(),
      productDesc: t.String(),
      paymentMethod: t.String(),
      customerRemarks: t.Optional(t.String()),
    }),
  ]),
  // 更新请求 (精细化可选更新)
  Update: t.Partial(
    t.Omit(t.Object(InquiryBase.insertFields), [
      "id",
      "createdAt",
      "updatedAt",
      "siteId",
    ])
  ),

  // Patch 请求 (部分更新)
  Patch: t.Partial(
    t.Omit(t.Object(InquiryBase.insertFields), [
      "id",
      "createdAt",
      "updatedAt",
      "siteId",
    ])
  ),

  // 列表查询
  ListQuery: t.Object({
    ...t.Partial(t.Object(InquiryBase.insertFields)).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),

  ListResponse: t.Object({
    data: t.Array(t.Object(InquiryBase.fields)),
    total: t.Number(),
  }),
} as const;

// ✨ DTO 类型直接在此导出，方便外部引用
export type InquiryDTO = InferDTO<typeof InquiryContract>;

// 📦 带关联数据的类型
export type InquiryWithItems = typeof inquiryTable.$inferSelect & {
  items?: (typeof inquiryItemsTable.$inferSelect)[];
};
