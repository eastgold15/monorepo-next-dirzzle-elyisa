/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { Elysia, t } from "elysia";
import { QuotationsContract } from "@repo/contract";
import { quotationsService } from "../../modules/index";
import { authGuardMid } from "~/middleware/auth";
import { dbPlugin } from "~/db/connection";

export const quotationsController = new Elysia({ prefix: "/quotations" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => quotationsService.findAll(query, { db, auth }), { query: QuotationsContract.ListQuery })
  .post("/", ({ body, auth, db }) => quotationsService.create(body, { db, auth }), { body: QuotationsContract.Create })
  .delete("/:id", ({ params, auth, db }) => quotationsService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });