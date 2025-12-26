/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { SalespersonsContract } from "@repo/contract";
import { salespersonsService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { siteMiddleware } from "~/middleware/site";

export const salespersonsController = new Elysia({ prefix: "/salespersons" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => salespersonsService.findAll(query, { db, siteId }), { query: SalespersonsContract.ListQuery })
  .post("/", ({ body, db, siteId }) => salespersonsService.create(body, { db, siteId }), { body: SalespersonsContract.Create })
  .put("/:id", ({ params, body, db, siteId }) => salespersonsService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: SalespersonsContract.Update })
  .delete("/:id", ({ params, db, siteId }) => salespersonsService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });