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
import { AttributeTemplateBase } from "../_generated/attributetemplate.contract";
import { MasterBase } from "../_generated/master.contract";

/**
 * AttributeTemplate 契约定义
 * 你可以直接在此处添加或 Omit 字段
 */
export const AttributeTemplateContract = {
  // 响应字段 (默认展开所有数据库字段)
  Response: t.Object({
    ...AttributeTemplateBase.fields,
  }),

  // 创建请求 (默认排除系统字段)
  Create: t.Object({
    fields: t.Optional(
      t.Array(
        t.Object({
          key: AttributeBase.insertFields.key,
          code: AttributeBase.insertFields.code,
          inputType: AttributeBase.insertFields.inputType,
          isRequired: AttributeBase.insertFields.isRequired,
          isSkuSpec: AttributeBase.fields.isSkuSpec,
          value: t.Optional(t.String()), // 可选：text/number 类型使用
          options: t.Optional(t.Array(t.String())), // 可选：select/multiselect 类型使用
        })
      )
    ),
    name: AttributeTemplateBase.insertFields.name,
    siteCategoryId: t.Optional(t.String()), // 可选：不强制要求站点分类
    masterCategoryId: MasterBase.fields.id,
  }),

  // 更新请求 (精细化可选更新)
  Update: t.Partial(
    t.Object({
      fields: t.Optional(
        t.Array(
          t.Object({
            key: AttributeBase.insertFields.key,
            code: AttributeBase.insertFields.code,
            inputType: AttributeBase.insertFields.inputType,
            isRequired: AttributeBase.insertFields.isRequired,
            isSkuSpec: AttributeBase.fields.isSkuSpec,
            value: t.Optional(t.String()), // 可选：text/number 类型使用
            options: t.Optional(t.Array(t.String())), // 可选：select/multiselect 类型使用
          })
        )
      ),
      name: AttributeTemplateBase.insertFields.name,
      siteCategoryId: t.Optional(t.String()), // 可选：不强制要求站点分类
      masterCategoryId: MasterBase.fields.id,
    })
  ),

  // 列表查询
  ListQuery: t.Object({
    ...t.Partial(t.Object(AttributeTemplateBase.insertFields)).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),

  ListResponse: t.Object({
    data: t.Array(t.Object(AttributeTemplateBase.fields)),
    total: t.Number(),
  }),
} as const;

// ✨ DTO 类型直接在此导出，方便外部引用
export type AttributeTemplateDTO = InferDTO<typeof AttributeTemplateContract>;
