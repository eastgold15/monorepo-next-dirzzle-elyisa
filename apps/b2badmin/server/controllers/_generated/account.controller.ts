/**
 * 🤖 【B2B Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { AccountContract } from "@repo/contract";
import { accountService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { authGuardMid } from "~/middleware/auth";

export const accountController = new Elysia({ prefix: "/account" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => accountService.findAll(query, { db, auth }), { query: AccountContract.ListQuery })
  .post("/", ({ body, auth, db }) => accountService.create(body, { db, auth }), { body: AccountContract.Create })
  .delete("/:id", ({ params, auth, db }) => accountService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });