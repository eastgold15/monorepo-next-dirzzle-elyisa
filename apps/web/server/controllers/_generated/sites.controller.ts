/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { SitesContract } from "@repo/contract";
import { sitesService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { siteMiddleware } from "~/middleware/site";

export const sitesController = new Elysia({ prefix: "/sites" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => sitesService.findAll(query, { db, siteId }), { query: SitesContract.ListQuery })
  .post("/", ({ body, db, siteId }) => sitesService.create(body, { db, siteId }), { body: SitesContract.Create })
  .put("/:id", ({ params, body, db, siteId }) => sitesService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: SitesContract.Update })
  .delete("/:id", ({ params, db, siteId }) => sitesService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });