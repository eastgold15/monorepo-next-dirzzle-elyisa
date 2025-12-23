/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { RolePermissionsContract } from "@repo/contract";
import { rolePermissionsService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { siteMiddleware } from "~/middleware/site";

export const rolepermissionsController = new Elysia({ prefix: "/rolepermissions" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => rolePermissionsService.findAll(query, { db, siteId }), { query: RolePermissionsContract.ListQuery })
  .post("/", ({ body, db, siteId }) => rolePermissionsService.create(body, { db, siteId }), { body: RolePermissionsContract.Create })
  .patch("/:id", ({ params, body, db, siteId }) => rolePermissionsService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: RolePermissionsContract.Patch })
  .delete("/:id", ({ params, db, siteId }) => rolePermissionsService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });