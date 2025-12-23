/**
 * 🤖 【B2B Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { MediaContract } from "@repo/contract";
import { mediaService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { authGuardMid } from "~/middleware/auth";

export const mediaController = new Elysia({ prefix: "/media" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => mediaService.findAll(query, { db, auth }), { query: MediaContract.ListQuery })
  .post("/", ({ body, auth, db }) => mediaService.create(body, { db, auth }), { body: MediaContract.Create })
  .delete("/:id", ({ params, auth, db }) => mediaService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });