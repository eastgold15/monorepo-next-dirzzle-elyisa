/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { SalespersonCategoriesContract } from "@repo/contract";
import { salespersonCategoriesService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { siteMiddleware } from "~/middleware/site";

export const salespersoncategoriesController = new Elysia({ prefix: "/salespersoncategories" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => salespersonCategoriesService.findAll(query, { db, siteId }), { query: SalespersonCategoriesContract.ListQuery })
  .post("/", ({ body, db, siteId }) => salespersonCategoriesService.create(body, { db, siteId }), { body: SalespersonCategoriesContract.Create })
  .patch("/:id", ({ params, body, db, siteId }) => salespersonCategoriesService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: SalespersonCategoriesContract.Update })
  .delete("/:id", ({ params, db, siteId }) => salespersonCategoriesService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });