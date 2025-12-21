/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { Elysia, t } from "elysia";
import { MediaContract } from "@repo/contract";
import { mediaService } from "../../modules/index";
import { authGuardMid } from "~/middleware/auth";
import { dbPlugin } from "~/db/connection";

export const mediaController = new Elysia({ prefix: "/media" })
  .use(dbPlugin)
  .use(authGuardMid)
  .post("/", ({ body, auth, db }) => mediaService.create(body, { db, auth }), { body: MediaContract.Create })
  .delete("/:id", ({ params, auth, db }) => mediaService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });