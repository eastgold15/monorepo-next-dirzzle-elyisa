/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */

import { UserSiteRolesContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";
import { userSiteRolesService } from "../../modules/index";

export const usersiterolesController = new Elysia({ prefix: "/usersiteroles" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get(
    "/",
    ({ query, auth, db }) => userSiteRolesService.findAll(query, { db, auth }),
    { query: UserSiteRolesContract.ListQuery }
  )
  .post(
    "/",
    ({ body, auth, db }) => userSiteRolesService.create(body, { db, auth }),
    { body: UserSiteRolesContract.Create }
  )
  .delete(
    "/:id",
    ({ params, auth, db }) =>
      userSiteRolesService.delete(params.id, { db, auth }),
    { params: t.Object({ id: t.String() }) }
  );
