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
import { SessionBase } from "../_generated/session.contract";

/**
 * Session 契约定义
 * 你可以直接在此处添加或 Omit 字段
 */
export const SessionContract = {
  // 响应字段 (默认展开所有数据库字段)
  Response: t.Object({
    ...SessionBase.fields,
  }),

  // 创建请求 (默认排除系统字段)
  Create: t.Object(
    t.Omit(t.Object(SessionBase.insertFields), ["id", "createdAt", "updatedAt"])
      .properties
  ),

  // 更新请求 (精细化可选更新)
  Update: t.Partial(
    t.Omit(t.Object(SessionBase.insertFields), [
      "id",
      "createdAt",
      "updatedAt",
      "siteId",
    ])
  ),

  // 列表查询
  ListQuery: t.Object({
    ...t.Partial(t.Object(SessionBase.insertFields)).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),

  ListResponse: t.Object({
    data: t.Array(t.Object(SessionBase.fields)),
    total: t.Number(),
  }),
} as const;

// ✨ DTO 类型直接在此导出，方便外部引用
export type SessionDTO = InferDTO<typeof SessionContract>;
