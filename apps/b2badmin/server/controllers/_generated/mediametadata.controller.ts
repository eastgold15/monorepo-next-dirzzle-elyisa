/**
 * 🤖 【B2B Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { MediaMetadataContract } from "@repo/contract";
import { mediaMetadataService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { authGuardMid } from "~/middleware/auth";

export const mediametadataController = new Elysia({ prefix: "/mediametadata" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => mediaMetadataService.findAll(query, { db, auth }), { query: MediaMetadataContract.ListQuery })
  .post("/", ({ body, auth, db }) => mediaMetadataService.create(body, { db, auth }), { body: MediaMetadataContract.Create })
  .delete("/:id", ({ params, auth, db }) => mediaMetadataService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });