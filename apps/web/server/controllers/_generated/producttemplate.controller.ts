/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { ProductTemplateContract } from "@repo/contract";
import { productTemplateService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { siteMiddleware } from "~/middleware/site";

export const producttemplateController = new Elysia({ prefix: "/producttemplate" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => productTemplateService.findAll(query, { db, siteId }), { query: ProductTemplateContract.ListQuery })
  .post("/", ({ body, db, siteId }) => productTemplateService.create(body, { db, siteId }), { body: ProductTemplateContract.Create })
  .patch("/:id", ({ params, body, db, siteId }) => productTemplateService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: ProductTemplateContract.Patch })
  .delete("/:id", ({ params, db, siteId }) => productTemplateService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });