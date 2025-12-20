/**
 * 🤖 【Web Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
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