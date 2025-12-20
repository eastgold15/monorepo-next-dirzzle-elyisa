/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { Elysia, t } from "elysia";
import { SessionContract } from "@repo/contract";
import { sessionService } from "../../modules/index";
import { authGuardMid } from "~/middleware/auth";
import { dbPlugin } from "~/db/connection";

export const sessionController = new Elysia({ prefix: "/session" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => sessionService.findAll(query, { db, auth }), { query: SessionContract.ListQuery })
  .post("/", ({ body, auth, db }) => sessionService.create(body, { db, auth }), { body: SessionContract.Create })
  .delete("/:id", ({ params, auth, db }) => sessionService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });