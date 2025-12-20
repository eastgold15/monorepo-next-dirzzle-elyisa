/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { Elysia, t } from "elysia";
import { UsersContract } from "@repo/contract";
import { usersService } from "../../modules/index";
import { authGuardMid } from "~/middleware/auth";
import { dbPlugin } from "~/db/connection";

export const usersController = new Elysia({ prefix: "/users" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => usersService.findAll(query, { db, auth }), { query: UsersContract.ListQuery })
  .post("/", ({ body, auth, db }) => usersService.create(body, { db, auth }), { body: UsersContract.Create })
  .delete("/:id", ({ params, auth, db }) => usersService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });