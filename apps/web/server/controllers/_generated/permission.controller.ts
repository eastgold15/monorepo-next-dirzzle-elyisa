/**
 * 🤖 【Web Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */

import { PermissionContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";
import { permissionService } from "../../modules/index";

export const permissionController = new Elysia({ prefix: "/permission" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get(
    "/",
    ({ query, db, siteId }) => permissionService.findAll(query, { db, siteId }),
    { query: PermissionContract.ListQuery }
  )
  .post(
    "/",
    ({ body, db, siteId }) => permissionService.create(body, { db, siteId }),
    { body: PermissionContract.Create }
  )
  .patch(
    "/:id",
    ({ params, body, db, siteId }) =>
      permissionService.update(params.id, body, { db, siteId }),
    { params: t.Object({ id: t.String() }), body: PermissionContract.Patch }
  )
  .delete(
    "/:id",
    ({ params, db, siteId }) =>
      permissionService.delete(params.id, { db, siteId }),
    { params: t.Object({ id: t.String() }) }
  );
