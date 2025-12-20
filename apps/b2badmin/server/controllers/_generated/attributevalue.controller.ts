/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */

import { AttributeValueContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";
import { attributeValueService } from "../../modules/index";

export const attributevalueController = new Elysia({
  prefix: "/attributevalue",
})
  .use(dbPlugin)
  .use(authGuardMid)
  .get(
    "/",
    ({ query, auth, db }) => attributeValueService.findAll(query, { db, auth }),
    { query: AttributeValueContract.ListQuery }
  )
  .post(
    "/",
    ({ body, auth, db }) => attributeValueService.create(body, { db, auth }),
    { body: AttributeValueContract.Create }
  )
  .delete(
    "/:id",
    ({ params, auth, db }) =>
      attributeValueService.delete(params.id, { db, auth }),
    { params: t.Object({ id: t.String() }) }
  );
