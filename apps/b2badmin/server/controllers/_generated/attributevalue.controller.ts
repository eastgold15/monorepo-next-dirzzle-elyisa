/**
 * 🤖 【B2B Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { AttributeValueContract } from "@repo/contract";
import { attributeValueService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { authGuardMid } from "~/middleware/auth";

export const attributevalueController = new Elysia({ prefix: "/attributevalue" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => attributeValueService.findAll(query, { db, auth }), { query: AttributeValueContract.ListQuery })
  .post("/", ({ body, auth, db }) => attributeValueService.create(body, { db, auth }), { body: AttributeValueContract.Create })
  .delete("/:id", ({ params, auth, db }) => attributeValueService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });