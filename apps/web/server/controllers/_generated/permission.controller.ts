/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { PermissionContract } from "@repo/contract";
import { permissionService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { siteMiddleware } from "~/middleware/site";

export const permissionController = new Elysia({ prefix: "/permission" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => permissionService.findAll(query, { db, siteId }), { query: PermissionContract.ListQuery })
  .post("/", ({ body, db, siteId }) => permissionService.create(body, { db, siteId }), { body: PermissionContract.Create })
  .patch("/:id", ({ params, body, db, siteId }) => permissionService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: PermissionContract.Update })
  .delete("/:id", ({ params, db, siteId }) => permissionService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });