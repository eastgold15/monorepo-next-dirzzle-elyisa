/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { AccountContract } from "@repo/contract";
import { accountService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { siteMiddleware } from "~/middleware/site";

export const accountController = new Elysia({ prefix: "/account" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => accountService.findAll(query, { db, siteId }), { query: AccountContract.ListQuery })
  .post("/", ({ body, db, siteId }) => accountService.create(body, { db, siteId }), { body: AccountContract.Create })
  .patch("/:id", ({ params, body, db, siteId }) => accountService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: AccountContract.Update })
  .delete("/:id", ({ params, db, siteId }) => accountService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });