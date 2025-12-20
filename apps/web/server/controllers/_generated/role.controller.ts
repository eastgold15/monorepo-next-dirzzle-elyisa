/**
 * 🤖 【Web Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */

import { RoleContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";
import { roleService } from "../../modules/index";

export const roleController = new Elysia({ prefix: "/role" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get(
    "/",
    ({ query, db, siteId }) => roleService.findAll(query, { db, siteId }),
    { query: RoleContract.ListQuery }
  )
  .post(
    "/",
    ({ body, db, siteId }) => roleService.create(body, { db, siteId }),
    { body: RoleContract.Create }
  )
  .patch(
    "/:id",
    ({ params, body, db, siteId }) =>
      roleService.update(params.id, body, { db, siteId }),
    { params: t.Object({ id: t.String() }), body: RoleContract.Patch }
  )
  .delete(
    "/:id",
    ({ params, db, siteId }) => roleService.delete(params.id, { db, siteId }),
    { params: t.Object({ id: t.String() }) }
  );
