/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { Elysia, t } from "elysia";
import { VerificationContract } from "@repo/contract";
import { verificationService } from "../../modules/index";
import { authGuardMid } from "~/middleware/auth";
import { dbPlugin } from "~/db/connection";

export const verificationController = new Elysia({ prefix: "/verification" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => verificationService.findAll(query, { db, auth }), { query: VerificationContract.ListQuery })
  .post("/", ({ body, auth, db }) => verificationService.create(body, { db, auth }), { body: VerificationContract.Create })
  .delete("/:id", ({ params, auth, db }) => verificationService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });