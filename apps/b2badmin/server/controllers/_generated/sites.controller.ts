/**
 * 🤖 【B2B Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { SitesContract } from "@repo/contract";
import { sitesService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { authGuardMid } from "~/middleware/auth";

export const sitesController = new Elysia({ prefix: "/sites" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => sitesService.findAll(query, { db, auth }), { query: SitesContract.ListQuery })
  .post("/", ({ body, auth, db }) => sitesService.create(body, { db, auth }), { body: SitesContract.Create })
  .delete("/:id", ({ params, auth, db }) => sitesService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });