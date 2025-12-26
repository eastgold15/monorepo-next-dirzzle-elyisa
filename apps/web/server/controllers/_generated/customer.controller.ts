/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { CustomerContract } from "@repo/contract";
import { customerService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { siteMiddleware } from "~/middleware/site";

export const customerController = new Elysia({ prefix: "/customer" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => customerService.findAll(query, { db, siteId }), { query: CustomerContract.ListQuery })
  .post("/", ({ body, db, siteId }) => customerService.create(body, { db, siteId }), { body: CustomerContract.Create })
  .patch("/:id", ({ params, body, db, siteId }) => customerService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: CustomerContract.Update })
  .delete("/:id", ({ params, db, siteId }) => customerService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });