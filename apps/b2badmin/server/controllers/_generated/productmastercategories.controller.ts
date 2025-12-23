/**
 * 🤖 【B2B Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { ProductMasterCategoriesContract } from "@repo/contract";
import { productMasterCategoriesService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { authGuardMid } from "~/middleware/auth";

export const productmastercategoriesController = new Elysia({ prefix: "/productmastercategories" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => productMasterCategoriesService.findAll(query, { db, auth }), { query: ProductMasterCategoriesContract.ListQuery })
  .post("/", ({ body, auth, db }) => productMasterCategoriesService.create(body, { db, auth }), { body: ProductMasterCategoriesContract.Create })
  .delete("/:id", ({ params, auth, db }) => productMasterCategoriesService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });