/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */

import { ProductTemplateContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";
import { productTemplateService } from "../../modules/index";

export const producttemplateController = new Elysia({
  prefix: "/producttemplate",
})
  .use(dbPlugin)
  .use(authGuardMid)
  .get(
    "/",
    ({ query, auth, db }) =>
      productTemplateService.findAll(query, { db, auth }),
    { query: ProductTemplateContract.ListQuery }
  )
  .post(
    "/",
    ({ body, auth, db }) => productTemplateService.create(body, { db, auth }),
    { body: ProductTemplateContract.Create }
  )
  .delete(
    "/:id",
    ({ params, auth, db }) =>
      productTemplateService.delete(params.id, { db, auth }),
    { params: t.Object({ id: t.String() }) }
  );
