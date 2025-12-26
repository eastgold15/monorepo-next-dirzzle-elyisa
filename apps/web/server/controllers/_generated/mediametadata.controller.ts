/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { MediaMetadataContract } from "@repo/contract";
import { mediaMetadataService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { siteMiddleware } from "~/middleware/site";

export const mediametadataController = new Elysia({ prefix: "/mediametadata" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => mediaMetadataService.findAll(query, { db, siteId }), { query: MediaMetadataContract.ListQuery })
  .post("/", ({ body, db, siteId }) => mediaMetadataService.create(body, { db, siteId }), { body: MediaMetadataContract.Create })
  .patch("/:id", ({ params, body, db, siteId }) => mediaMetadataService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: MediaMetadataContract.Update })
  .delete("/:id", ({ params, db, siteId }) => mediaMetadataService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });