/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { SiteConfigContract } from "@repo/contract";
import { siteConfigService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { siteMiddleware } from "~/middleware/site";

export const siteconfigController = new Elysia({ prefix: "/siteconfig" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => siteConfigService.findAll(query, { db, siteId }), { query: SiteConfigContract.ListQuery })
  .post("/", ({ body, db, siteId }) => siteConfigService.create(body, { db, siteId }), { body: SiteConfigContract.Create })
  .patch("/:id", ({ params, body, db, siteId }) => siteConfigService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: SiteConfigContract.Patch })
  .delete("/:id", ({ params, db, siteId }) => siteConfigService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });