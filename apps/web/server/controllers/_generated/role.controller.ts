/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { RoleContract } from "@repo/contract";
import { roleService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { siteMiddleware } from "~/middleware/site";

export const roleController = new Elysia({ prefix: "/role" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => roleService.findAll(query, { db, siteId }), { query: RoleContract.ListQuery })
  .post("/", ({ body, db, siteId }) => roleService.create(body, { db, siteId }), { body: RoleContract.Create })
  .patch("/:id", ({ params, body, db, siteId }) => roleService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: RoleContract.Update })
  .delete("/:id", ({ params, db, siteId }) => roleService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });