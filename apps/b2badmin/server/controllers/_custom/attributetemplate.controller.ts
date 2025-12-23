/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */

import { AttributeTemplateContract } from "@repo/contract";
import { Elysia, t } from "elysia";
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

  .put(
    "/:id",
    async ({ params, body, db, auth }) =>
      await attributeTemplateService.update(params.id, body, { db, auth }),
    {
      params: t.Object({ id: t.String() }),
      body: AttributeTemplateContract.Update,
      detail: {
        summary: "更新模板",
        description: "更新指定属性模板的信息",
        tags: ["Templates"],
      },
    }
  )
  .post(
    "/",
    ({ body, auth, db }) => attributeTemplateService.create(body, { db, auth }),
    {
      body: AttributeTemplateContract.Create,
      detail: {
        summary: "创建模板",
        description: "创建新的属性模板",
        tags: ["Templates"],
      },
    }
  );
