/**
 * 🤖 【B2B Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { SalespersonsContract } from "@repo/contract";
import { salespersonsService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { authGuardMid } from "~/middleware/auth";

export const salespersonsController = new Elysia({ prefix: "/salespersons" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => salespersonsService.findAll(query, { db, auth }), { query: SalespersonsContract.ListQuery })
  .post("/", ({ body, auth, db }) => salespersonsService.create(body, { db, auth }), { body: SalespersonsContract.Create })
  .delete("/:id", ({ params, auth, db }) => salespersonsService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });