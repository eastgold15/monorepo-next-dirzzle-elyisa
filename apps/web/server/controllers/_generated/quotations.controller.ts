/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { QuotationsContract } from "@repo/contract";
import { quotationsService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { siteMiddleware } from "~/middleware/site";

export const quotationsController = new Elysia({ prefix: "/quotations" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => quotationsService.findAll(query, { db, siteId }), { query: QuotationsContract.ListQuery })
  .post("/", ({ body, db, siteId }) => quotationsService.create(body, { db, siteId }), { body: QuotationsContract.Create })
  .put("/:id", ({ params, body, db, siteId }) => quotationsService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: QuotationsContract.Update })
  .delete("/:id", ({ params, db, siteId }) => quotationsService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });