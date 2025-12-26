/**
 * ✍️ 【Contract - 业务自定义层】
 * --------------------------------------------------------
 * 💡 你可以直接在此修改 Response, Create, Update 等字段。
 * 🛡️ 脚本检测到文件存在时永远不会覆盖此处。
 * --------------------------------------------------------
 */
import { t } from "elysia";
import { SortParams } from "../../helper/query-types.model";
import type { InferDTO } from "../../helper/utils";
import { SkusBase } from "../_generated/skus.contract";

const Create = t.Omit(t.Object(SkusBase.insertFields), [
  "id",
  "createdAt",
  "updatedAt",
  "siteId",
]);
/**
 * Skus 契约定义
 * 你可以直接在此处添加或 Omit 字段
 */
export const SkusContract = {
  // 响应字段 (默认展开所有数据库字段)
  Response: t.Object({
    ...SkusBase.fields,
  }),

  // 创建请求 (默认排除系统字段)
  Create: t.Object(
    t.Omit(t.Object(SkusBase.insertFields), ["id", "createdAt", "updatedAt"])
      .properties
  ),

  // 更新请求 (精细化可选更新)
  Update: t.Partial(
    t.Composite([
      t.Omit(t.Object(SkusBase.insertFields), [
        "id",
        "createdAt",
        "updatedAt",
        "siteId",
      ]),
      t.Object({
        mediaIds: t.Optional(t.Array(t.String())), // 该 SKU 的图片 ID 列表
        mainImageId: t.Optional(t.String()), // 指定哪张 ID 为主图
      }),
    ])
  ),

  // Patch 请求 (部分更新)
  Patch: t.Partial(
    t.Composite([
      t.Omit(t.Object(SkusBase.insertFields), [
        "id",
        "createdAt",
        "updatedAt",
        "siteId",
      ]),
      t.Object({
        mediaIds: t.Optional(t.Array(t.String())),
        mainImageId: t.Optional(t.String()),
      }),
    ])
  ),

  BatchCreate: t.Object({
    productId: t.String(),
    skus: t.Array(
      t.Object({
        skuCode: t.String(),
        price: t.Number(),
        stock: t.Optional(t.Number()),
        specJson: t.Any(),
        mediaIds: t.Optional(t.Array(t.String())),
      })
    ),
  }),

  // 列表查询
  ListQuery: t.Object({
    // ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),

  ListResponse: t.Object({
    data: t.Array(t.Object(SkusBase.fields)),
    total: t.Number(),
  }),
} as const;

// ✨ DTO 类型直接在此导出，方便外部引用
export type SkusDTO = InferDTO<typeof SkusContract>;
