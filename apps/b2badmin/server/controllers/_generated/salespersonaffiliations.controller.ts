/**
 * 🤖 【B2B Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { SalespersonAffiliationsContract } from "@repo/contract";
import { salespersonAffiliationsService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { authGuardMid } from "~/middleware/auth";

export const salespersonaffiliationsController = new Elysia({ prefix: "/salespersonaffiliations" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => salespersonAffiliationsService.findAll(query, { db, auth }), { query: SalespersonAffiliationsContract.ListQuery })
  .post("/", ({ body, auth, db }) => salespersonAffiliationsService.create(body, { db, auth }), { body: SalespersonAffiliationsContract.Create })
  .delete("/:id", ({ params, auth, db }) => salespersonAffiliationsService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });