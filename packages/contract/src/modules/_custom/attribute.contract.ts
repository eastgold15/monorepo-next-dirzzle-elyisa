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
import { AttributeBase } from "../_generated/attribute.contract";

/**
 * Attribute 契约定义
 * 你可以直接在此处添加或 Omit 字段
 */
export const AttributeContract = {
  // 响应字段 (默认展开所有数据库字段)
  Response: t.Object({
    ...AttributeBase.fields,
  }),
  Entity: t.Object({
    ...AttributeBase.fields,
  }),
  Create: t.Object({
    ...t.Partial(t.Object(AttributeBase.insertFields)).properties,
  }),
  Update: t.Object({
    ...t.Partial(t.Object(AttributeBase.insertFields)).properties,
  }),

  // 列表查询
  ListQuery: t.Object({
    ...t.Partial(t.Object(AttributeBase.insertFields)).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),

  ListResponse: t.Object({
    data: t.Array(t.Object(AttributeBase.fields)),
    total: t.Number(),
  }),
} as const;

// ✨ DTO 类型直接在此导出，方便外部引用
export type AttributeDTO = InferDTO<typeof AttributeContract>;
