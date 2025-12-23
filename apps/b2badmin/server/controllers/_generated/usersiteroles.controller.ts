/**
 * 🤖 【B2B Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { UserSiteRolesContract } from "@repo/contract";
import { userSiteRolesService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { authGuardMid } from "~/middleware/auth";

export const usersiterolesController = new Elysia({ prefix: "/usersiteroles" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => userSiteRolesService.findAll(query, { db, auth }), { query: UserSiteRolesContract.ListQuery })
  .post("/", ({ body, auth, db }) => userSiteRolesService.create(body, { db, auth }), { body: UserSiteRolesContract.Create })
  .delete("/:id", ({ params, auth, db }) => userSiteRolesService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });