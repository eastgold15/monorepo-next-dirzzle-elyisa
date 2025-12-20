/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { Elysia, t } from "elysia";
import { SalespersonAffiliationsContract } from "@repo/contract";
import { salespersonAffiliationsService } from "../../modules/index";
import { authGuardMid } from "~/middleware/auth";
import { dbPlugin } from "~/db/connection";

export const salespersonaffiliationsController = new Elysia({ prefix: "/salespersonaffiliations" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => salespersonAffiliationsService.findAll(query, { db, auth }), { query: SalespersonAffiliationsContract.ListQuery })
  .post("/", ({ body, auth, db }) => salespersonAffiliationsService.create(body, { db, auth }), { body: SalespersonAffiliationsContract.Create })
  .delete("/:id", ({ params, auth, db }) => salespersonAffiliationsService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });