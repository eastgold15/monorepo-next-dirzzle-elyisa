/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */

import {
  AttributeContract,
  AttributeTemplateContract,
  attributeTable,
  attributeTemplateTable,
  attributeValueTable,
} from "@repo/contract";
import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";
import {
  attributeTemplateService,
  productTemplateService,
} from "../../modules/index";

export const attributetemplateController = new Elysia({
  prefix: "/attributetemplate",
})
  .use(dbPlugin)
  .use(authGuardMid)
  .get(
    "/:id",
    async ({ params, db }) => {
      const [template] = await db
        .select()
        .from(attributeTemplateTable)
        .where(eq(attributeTemplateTable.id, params.id))
        .limit(1);

      if (!template) {
        throw new HttpError.NotFound("模板不存在");
      }

      // 获取模板的属性列表
      const attributes = await db
        .select()
        .from(attributeTable)
        .where(eq(attributeTable.templateId, params.id));

      return {
        ...template,
        attributes,
      };
    },
    {
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "获取单个模板",
        description: "根据ID获取属性模板详情及其属性列表",
        tags: ["Templates"],
      },
    }
  )
  .delete(
    "/:id",
    ({ params, auth, db }) =>
      attributeTemplateService.delete(params.id, { db, auth }),
    {
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "删除模板",
        description: "删除指定的属性模板",
        tags: ["Templates"],
      },
    }
  )
  // 获取所有可用的模板
  .get(
    "/",
    async ({ query, db, auth }) =>
      await productTemplateService.getTemplates({ db, auth }, query.search),
    {
      query: AttributeTemplateContract.ListQuery,
      detail: {
        summary: "获取所有可用模板",
        description: "获取系统中所有可用的属性模板列表（全局公用）",
        tags: ["Templates"],
      },
    }
  )
  .post(
    "/",
    async ({
      body: { name, siteCategoryId, masterCategoryId, fields },
      db,
    }) => {
      return await db.transaction(async (tx) => {
        // 1. 创建属性模板
        const [templateRes] = await tx
          .insert(attributeTemplateTable)
          .values({
            masterCategoryId,
            siteCategoryId, // 别忘了保存站点分类 ID
            name,
          })
          .returning({ id: attributeTemplateTable.id });

        if (!templateRes) {
          throw new HttpError.BadRequest("创建属性模板失败");
        }
        const { id: templateId } = templateRes;

        // 2. 处理字段列表
        if (fields && fields.length > 0) {
          for (const field of fields) {
            const { inputType, isRequired, value, code, key, isSkuSpec } =
              field;

            // 2.1 插入属性定义 (attributeTable)
            const [newAttribute] = await tx
              .insert(attributeTable)
              .values({
                templateId,
                key, // 这里的 key 是 UI 上的 Display Name
                code, // slugify 后的 API Code
                inputType,
                isRequired: !!isRequired,
                isSkuSpec: !!isSkuSpec,
              })
              .returning({ id: attributeTable.id });

            // 2.2 根据类型解析 value
            let valuesToInsert: string[] = [];

            if (inputType === "select" || inputType === "multiselect") {
              // 如果是选择类型，value 是 "Red, Blue, Green"，需要分割
              valuesToInsert = value
                ? value
                  .split(",")
                  .map((v) => v.trim())
                  .filter(Boolean)
                : [];
            } else if (inputType === "text" || inputType === "number") {
              // 如果是文本/数字类型，value 可能是 placeholder 或默认值
              // 如果业务要求这种类型不存入 valueTable，则可以跳过
              if (value) valuesToInsert = [value.trim()];
            }

            // 2.3 批量插入属性选项/预设值 (attributeValueTable)
            if (valuesToInsert.length > 0) {
              const valueData = valuesToInsert.map((v, index) => ({
                attributeId: newAttribute.id,
                value: v,
                sortOrder: index,
              }));
              await tx.insert(attributeValueTable).values(valueData);
            }
          }
        }
        return { id: templateId, success: true };
      });
    },
    {
      body: AttributeContract.Create,
      detail: {
        summary: "创建模板",
        description: "创建新的属性模板",
        tags: ["Templates"],
      },
    }
  );
