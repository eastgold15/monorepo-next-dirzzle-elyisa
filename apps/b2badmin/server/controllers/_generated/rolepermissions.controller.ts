/**
 * 🤖 【B2B Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { RolePermissionsContract } from "@repo/contract";
import { rolePermissionsService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { authGuardMid } from "~/middleware/auth";

export const rolepermissionsController = new Elysia({ prefix: "/rolepermissions" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => rolePermissionsService.findAll(query, { db, auth }), { query: RolePermissionsContract.ListQuery })
  .post("/", ({ body, auth, db }) => rolePermissionsService.create(body, { db, auth }), { body: RolePermissionsContract.Create })
  .delete("/:id", ({ params, auth, db }) => rolePermissionsService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });