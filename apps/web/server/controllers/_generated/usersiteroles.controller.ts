/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { UserSiteRolesContract } from "@repo/contract";
import { userSiteRolesService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { siteMiddleware } from "~/middleware/site";

export const usersiterolesController = new Elysia({ prefix: "/usersiteroles" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => userSiteRolesService.findAll(query, { db, siteId }), { query: UserSiteRolesContract.ListQuery })
  .post("/", ({ body, db, siteId }) => userSiteRolesService.create(body, { db, siteId }), { body: UserSiteRolesContract.Create })
  .patch("/:id", ({ params, body, db, siteId }) => userSiteRolesService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: UserSiteRolesContract.Patch })
  .delete("/:id", ({ params, db, siteId }) => userSiteRolesService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });