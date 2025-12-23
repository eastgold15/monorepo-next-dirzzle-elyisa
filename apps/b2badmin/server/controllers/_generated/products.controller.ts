/**
 * 🤖 【B2B Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { ProductsContract } from "@repo/contract";
import { productsService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { authGuardMid } from "~/middleware/auth";

export const productsController = new Elysia({ prefix: "/products" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => productsService.findAll(query, { db, auth }), { query: ProductsContract.ListQuery })
  .post("/", ({ body, auth, db }) => productsService.create(body, { db, auth }), { body: ProductsContract.Create })
  .delete("/:id", ({ params, auth, db }) => productsService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });