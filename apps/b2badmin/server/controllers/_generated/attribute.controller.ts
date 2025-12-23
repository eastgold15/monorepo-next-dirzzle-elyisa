/**
 * 🤖 【B2B Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { AttributeContract } from "@repo/contract";
import { attributeService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { authGuardMid } from "~/middleware/auth";

export const attributeController = new Elysia({ prefix: "/attribute" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => attributeService.findAll(query, { db, auth }), { query: AttributeContract.ListQuery })
  .post("/", ({ body, auth, db }) => attributeService.create(body, { db, auth }), { body: AttributeContract.Create })
  .delete("/:id", ({ params, auth, db }) => attributeService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });