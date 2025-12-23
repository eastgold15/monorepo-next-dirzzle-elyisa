/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { SiteCategoriesContract } from "@repo/contract";
import { siteCategoriesService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { siteMiddleware } from "~/middleware/site";

export const sitecategoriesController = new Elysia({ prefix: "/sitecategories" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => siteCategoriesService.findAll(query, { db, siteId }), { query: SiteCategoriesContract.ListQuery })
  .post("/", ({ body, db, siteId }) => siteCategoriesService.create(body, { db, siteId }), { body: SiteCategoriesContract.Create })
  .patch("/:id", ({ params, body, db, siteId }) => siteCategoriesService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: SiteCategoriesContract.Patch })
  .delete("/:id", ({ params, db, siteId }) => siteCategoriesService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });