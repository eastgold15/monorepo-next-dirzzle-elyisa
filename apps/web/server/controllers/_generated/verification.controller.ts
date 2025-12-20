/**
 * 🤖 【Web Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { Elysia, t } from "elysia";
import { VerificationContract } from "@repo/contract";
import { verificationService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const verificationController = new Elysia({ prefix: "/verification" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => verificationService.findAll(query, { db, siteId }), { query: VerificationContract.ListQuery })
  .post("/", ({ body, db, siteId }) => verificationService.create(body, { db, siteId }), { body: VerificationContract.Create })
  .patch("/:id", ({ params, body, db, siteId }) => verificationService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: VerificationContract.Patch })
  .delete("/:id", ({ params, db, siteId }) => verificationService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });