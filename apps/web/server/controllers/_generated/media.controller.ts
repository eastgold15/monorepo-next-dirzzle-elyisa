/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { MediaContract } from "@repo/contract";
import { mediaService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { siteMiddleware } from "~/middleware/site";

export const mediaController = new Elysia({ prefix: "/media" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => mediaService.findAll(query, { db, siteId }), { query: MediaContract.ListQuery })
  .post("/", ({ body, db, siteId }) => mediaService.create(body, { db, siteId }), { body: MediaContract.Create })
  .put("/:id", ({ params, body, db, siteId }) => mediaService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: MediaContract.Update })
  .delete("/:id", ({ params, db, siteId }) => mediaService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });