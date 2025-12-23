/**
 * 🤖 【B2B Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { SkusContract } from "@repo/contract";
import { skusService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { authGuardMid } from "~/middleware/auth";

export const skusController = new Elysia({ prefix: "/skus" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => skusService.findAll(query, { db, auth }), { query: SkusContract.ListQuery })
  .post("/", ({ body, auth, db }) => skusService.create(body, { db, auth }), { body: SkusContract.Create })
  .delete("/:id", ({ params, auth, db }) => skusService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });