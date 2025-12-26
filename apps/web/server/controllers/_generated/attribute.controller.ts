/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { AttributeContract } from "@repo/contract";
import { attributeService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { siteMiddleware } from "~/middleware/site";

export const attributeController = new Elysia({ prefix: "/attribute" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => attributeService.findAll(query, { db, siteId }), { query: AttributeContract.ListQuery })
  .post("/", ({ body, db, siteId }) => attributeService.create(body, { db, siteId }), { body: AttributeContract.Create })
  .put("/:id", ({ params, body, db, siteId }) => attributeService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: AttributeContract.Update })
  .delete("/:id", ({ params, db, siteId }) => attributeService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });