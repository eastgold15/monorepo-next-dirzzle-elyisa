/**
 * 🤖 【B2B Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { SalespersonCategoriesContract } from "@repo/contract";
import { salespersonCategoriesService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { authGuardMid } from "~/middleware/auth";

export const salespersoncategoriesController = new Elysia({ prefix: "/salespersoncategories" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => salespersonCategoriesService.findAll(query, { db, auth }), { query: SalespersonCategoriesContract.ListQuery })
  .post("/", ({ body, auth, db }) => salespersonCategoriesService.create(body, { db, auth }), { body: SalespersonCategoriesContract.Create })
  .delete("/:id", ({ params, auth, db }) => salespersonCategoriesService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });