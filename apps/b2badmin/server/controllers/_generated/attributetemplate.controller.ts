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
import { attributeTemplateService } from "../../modules/index";

export const attributetemplateController = new Elysia({
  prefix: "/attributetemplate",
})
  .use(dbPlugin)
  .use(authGuardMid)
  .get(
    "/",
    ({ query, auth, db }) =>
      attributeTemplateService.findAll(query, { db, auth }),
    { query: AttributeTemplateContract.ListQuery }
  )
  .post(
    "/",
    ({ body, auth, db }) => attributeTemplateService.create(body, { db, auth }),
    { body: AttributeTemplateContract.Create }
  )
  .delete(
    "/:id",
    ({ params, auth, db }) =>
      attributeTemplateService.delete(params.id, { db, auth }),
    { params: t.Object({ id: t.String() }) }
  );
