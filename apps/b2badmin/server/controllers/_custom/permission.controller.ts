/**
 * 🤖 【B2B Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { PermissionContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";
import { permissionService } from "../../modules/index";

export const permissionController = new Elysia({ prefix: "/permission" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get(
    "/",
    ({ query, auth, db }) => permissionService.findAll(query, { db, auth }),
    {

      query: PermissionContract.ListQuery
    }
  )
  .post(
    "/",
    ({ body, auth, db }) => permissionService.create(body, { db, auth }),
    { body: PermissionContract.Create }
  )
  .delete(
    "/:id",
    ({ params, auth, db }) => permissionService.delete(params.id, { db, auth }),
    { params: t.Object({ id: t.String() }) }
  );
