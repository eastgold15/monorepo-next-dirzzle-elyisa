/**
 * 🤖 【B2B Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { UsersContract } from "@repo/contract";
import { usersService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { authGuardMid } from "~/middleware/auth";

export const usersController = new Elysia({ prefix: "/users" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => usersService.findAll(query, { db, auth }), { query: UsersContract.ListQuery })
  .post("/", ({ body, auth, db }) => usersService.create(body, { db, auth }), { body: UsersContract.Create })
  .delete("/:id", ({ params, auth, db }) => usersService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });