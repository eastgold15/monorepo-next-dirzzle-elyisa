/**
 * 🤖 【Web Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */

import { RolePermissionsContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";
import { rolePermissionsService } from "../../modules/index";

export const rolepermissionsController = new Elysia({
  prefix: "/rolepermissions",
})
  .use(dbPlugin)
  .use(siteMiddleware)
  .get(
    "/",
    ({ query, db, siteId }) =>
      rolePermissionsService.findAll(query, { db, siteId }),
    { query: RolePermissionsContract.ListQuery }
  )
  .post(
    "/",
    ({ body, db, siteId }) =>
      rolePermissionsService.create(body, { db, siteId }),
    { body: RolePermissionsContract.Create }
  )
  .patch(
    "/:id",
    ({ params, body, db, siteId }) =>
      rolePermissionsService.update(params.id, body, { db, siteId }),
    {
      params: t.Object({ id: t.String() }),
      body: RolePermissionsContract.Patch,
    }
  )
  .delete(
    "/:id",
    ({ params, db, siteId }) =>
      rolePermissionsService.delete(params.id, { db, siteId }),
    { params: t.Object({ id: t.String() }) }
  );
