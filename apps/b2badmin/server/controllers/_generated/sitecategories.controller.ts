/**
 * 🤖 【B2B Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { SiteCategoriesContract } from "@repo/contract";
import { siteCategoriesService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { authGuardMid } from "~/middleware/auth";

export const sitecategoriesController = new Elysia({ prefix: "/sitecategories" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => siteCategoriesService.findAll(query, { db, auth }), { query: SiteCategoriesContract.ListQuery })
  .post("/", ({ body, auth, db }) => siteCategoriesService.create(body, { db, auth }), { body: SiteCategoriesContract.Create })
  .delete("/:id", ({ params, auth, db }) => siteCategoriesService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });