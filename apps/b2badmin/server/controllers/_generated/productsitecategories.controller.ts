/**
 * 🤖 【B2B Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { ProductSiteCategoriesContract } from "@repo/contract";
import { productSiteCategoriesService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { authGuardMid } from "~/middleware/auth";

export const productsitecategoriesController = new Elysia({ prefix: "/productsitecategories" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => productSiteCategoriesService.findAll(query, { db, auth }), { query: ProductSiteCategoriesContract.ListQuery })
  .post("/", ({ body, auth, db }) => productSiteCategoriesService.create(body, { db, auth }), { body: ProductSiteCategoriesContract.Create })
  .delete("/:id", ({ params, auth, db }) => productSiteCategoriesService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });