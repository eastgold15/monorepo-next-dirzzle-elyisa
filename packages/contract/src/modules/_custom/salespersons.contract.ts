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
import { SalespersonsBase } from "../_generated/salespersons.contract";

/**
 * Salespersons 契约定义
 * 你可以直接在此处添加或 Omit 字段
 */

// 用户信息对象
const UserInfo = t.Object({
  id: t.String(),
  name: t.String(),
  email: t.String(),
  phone: t.Optional(t.String()),
  isActive: t.Boolean(),
});

const Response = t.Object({
  ...SalespersonsBase.fields,
  user: t.Optional(UserInfo),
  affiliations: t.Optional(
    t.Array(
      t.Object({
        id: t.String(),
        entityType: t.Union([t.Literal("exporter"), t.Literal("factory")]),
        exporterId: t.Optional(t.String()),
        factoryId: t.Optional(t.String()),
      })
    )
  ),
  masterCategories: t.Optional(
    t.Array(
      t.Object({
        id: t.String(),
        masterCategoryId: t.String(),
        salespersonId: t.String(),
        masterCategory: t.Optional(
          t.Object({
            id: t.String(),
            name: t.String(),
            slug: t.String(),
          })
        ),
      })
    )
  ),
});

export const SalespersonsContract = {
  // 响应字段 (包含用户和关联信息)
  Response,
  // 创建业务员完整请求 (包含用户创建和归属)
  // 归属关系会自动从当前登录用户的站点获取
  Create: t.Object({
    // 用户信息
    email: t.String(),
    password: t.String(),
    name: t.String(),
    // 业务员信息
    phone: t.Optional(t.String()),
    whatsapp: t.Optional(t.String()),
    position: t.Optional(t.String()),
    department: t.Optional(t.String()),
    avatar: t.Optional(t.String()),
    // 负责的主分类
    masterCategoryIds: t.Optional(t.Array(t.String())),
  }),
  // 更新请求
  Update: t.Partial(
    t.Omit(t.Object(SalespersonsBase.insertFields), [
      "id",
      "createdAt",
      "updatedAt",
      "siteId",
      "userId",
    ])
  ),

  // 列表查询
  ListQuery: t.Object({
    ...t.Partial(t.Object(SalespersonsBase.insertFields)).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
    entityType: t.Optional(
      t.Union([t.Literal("exporter"), t.Literal("factory")])
    ),
  }),

  ListResponse: t.Object({
    data: t.Array(t.Object(Response)),
    total: t.Number(),
  }),
} as const;

// ✨ DTO 类型直接在此导出，方便外部引用
export type SalespersonsDTO = InferDTO<typeof SalespersonsContract>;
export type SalespersonWithDetails = SalespersonsDTO["Response"];
