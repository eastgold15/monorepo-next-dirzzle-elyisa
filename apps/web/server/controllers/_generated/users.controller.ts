/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { UsersContract } from "@repo/contract";
import { usersService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { siteMiddleware } from "~/middleware/site";

export const usersController = new Elysia({ prefix: "/users" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => usersService.findAll(query, { db, siteId }), { query: UsersContract.ListQuery })
  .post("/", ({ body, db, siteId }) => usersService.create(body, { db, siteId }), { body: UsersContract.Create })
  .patch("/:id", ({ params, body, db, siteId }) => usersService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: UsersContract.Patch })
  .delete("/:id", ({ params, db, siteId }) => usersService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });