/**
 * 🤖 【B2B Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { QuotationsContract } from "@repo/contract";
import { quotationsService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { authGuardMid } from "~/middleware/auth";

export const quotationsController = new Elysia({ prefix: "/quotations" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => quotationsService.findAll(query, { db, auth }), { query: QuotationsContract.ListQuery })
  .post("/", ({ body, auth, db }) => quotationsService.create(body, { db, auth }), { body: QuotationsContract.Create })
  .delete("/:id", ({ params, auth, db }) => quotationsService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });