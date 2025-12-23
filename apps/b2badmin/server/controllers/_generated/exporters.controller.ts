/**
 * 🤖 【B2B Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { ExportersContract } from "@repo/contract";
import { exportersService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { authGuardMid } from "~/middleware/auth";

export const exportersController = new Elysia({ prefix: "/exporters" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => exportersService.findAll(query, { db, auth }), { query: ExportersContract.ListQuery })
  .post("/", ({ body, auth, db }) => exportersService.create(body, { db, auth }), { body: ExportersContract.Create })
  .delete("/:id", ({ params, auth, db }) => exportersService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });