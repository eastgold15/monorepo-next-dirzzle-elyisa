/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { SessionContract } from "@repo/contract";
import { sessionService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { siteMiddleware } from "~/middleware/site";

export const sessionController = new Elysia({ prefix: "/session" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => sessionService.findAll(query, { db, siteId }), { query: SessionContract.ListQuery })
  .post("/", ({ body, db, siteId }) => sessionService.create(body, { db, siteId }), { body: SessionContract.Create })
  .put("/:id", ({ params, body, db, siteId }) => sessionService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: SessionContract.Update })
  .delete("/:id", ({ params, db, siteId }) => sessionService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });