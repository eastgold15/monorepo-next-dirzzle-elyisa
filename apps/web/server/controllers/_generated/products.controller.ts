/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { ProductsContract } from "@repo/contract";
import { productsService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { siteMiddleware } from "~/middleware/site";

export const productsController = new Elysia({ prefix: "/products" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => productsService.findAll(query, { db, siteId }), { query: ProductsContract.ListQuery })
  .post("/", ({ body, db, siteId }) => productsService.create(body, { db, siteId }), { body: ProductsContract.Create })
  .patch("/:id", ({ params, body, db, siteId }) => productsService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: ProductsContract.Patch })
  .delete("/:id", ({ params, db, siteId }) => productsService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });