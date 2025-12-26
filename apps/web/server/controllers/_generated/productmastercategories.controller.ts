/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { ProductMasterCategoriesContract } from "@repo/contract";
import { productMasterCategoriesService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { siteMiddleware } from "~/middleware/site";

export const productmastercategoriesController = new Elysia({ prefix: "/productmastercategories" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => productMasterCategoriesService.findAll(query, { db, siteId }), { query: ProductMasterCategoriesContract.ListQuery })
  .post("/", ({ body, db, siteId }) => productMasterCategoriesService.create(body, { db, siteId }), { body: ProductMasterCategoriesContract.Create })
  .put("/:id", ({ params, body, db, siteId }) => productMasterCategoriesService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: ProductMasterCategoriesContract.Update })
  .delete("/:id", ({ params, db, siteId }) => productMasterCategoriesService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });