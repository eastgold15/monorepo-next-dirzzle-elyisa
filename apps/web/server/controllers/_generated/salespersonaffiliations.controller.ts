/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { SalespersonAffiliationsContract } from "@repo/contract";
import { salespersonAffiliationsService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { siteMiddleware } from "~/middleware/site";

export const salespersonaffiliationsController = new Elysia({ prefix: "/salespersonaffiliations" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => salespersonAffiliationsService.findAll(query, { db, siteId }), { query: SalespersonAffiliationsContract.ListQuery })
  .post("/", ({ body, db, siteId }) => salespersonAffiliationsService.create(body, { db, siteId }), { body: SalespersonAffiliationsContract.Create })
  .put("/:id", ({ params, body, db, siteId }) => salespersonAffiliationsService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: SalespersonAffiliationsContract.Update })
  .delete("/:id", ({ params, db, siteId }) => salespersonAffiliationsService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });