/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { Elysia, t } from "elysia";
import { ExportersContract } from "@repo/contract";
import { exportersService } from "../../modules/index";
import { authGuardMid } from "~/middleware/auth";
import { dbPlugin } from "~/db/connection";

export const exportersController = new Elysia({ prefix: "/exporters" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => exportersService.findAll(query, { db, auth }), { query: ExportersContract.ListQuery })
  .post("/", ({ body, auth, db }) => exportersService.create(body, { db, auth }), { body: ExportersContract.Create })
  .delete("/:id", ({ params, auth, db }) => exportersService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });