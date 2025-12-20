/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { Elysia, t } from "elysia";
import { MediaMetadataContract } from "@repo/contract";
import { mediaMetadataService } from "../../modules/index";
import { authGuardMid } from "~/middleware/auth";
import { dbPlugin } from "~/db/connection";

export const mediametadataController = new Elysia({ prefix: "/mediametadata" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => mediaMetadataService.findAll(query, { db, auth }), { query: MediaMetadataContract.ListQuery })
  .post("/", ({ body, auth, db }) => mediaMetadataService.create(body, { db, auth }), { body: MediaMetadataContract.Create })
  .delete("/:id", ({ params, auth, db }) => mediaMetadataService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });