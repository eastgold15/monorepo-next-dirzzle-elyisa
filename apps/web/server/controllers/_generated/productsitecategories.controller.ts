/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { ProductSiteCategoriesContract } from "@repo/contract";
import { productSiteCategoriesService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { siteMiddleware } from "~/middleware/site";

export const productsitecategoriesController = new Elysia({ prefix: "/productsitecategories" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => productSiteCategoriesService.findAll(query, { db, siteId }), { query: ProductSiteCategoriesContract.ListQuery })
  .post("/", ({ body, db, siteId }) => productSiteCategoriesService.create(body, { db, siteId }), { body: ProductSiteCategoriesContract.Create })
  .put("/:id", ({ params, body, db, siteId }) => productSiteCategoriesService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: ProductSiteCategoriesContract.Update })
  .delete("/:id", ({ params, db, siteId }) => productSiteCategoriesService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });