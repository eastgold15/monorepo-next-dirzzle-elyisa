/**
 * 🤖 【Web Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { Elysia, t } from "elysia";
import { QuotationsContract } from "@repo/contract";
import { quotationsService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const quotationsController = new Elysia({ prefix: "/quotations" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => quotationsService.findAll(query, { db, siteId }), { query: QuotationsContract.ListQuery })
  .post("/", ({ body, db, siteId }) => quotationsService.create(body, { db, siteId }), { body: QuotationsContract.Create })
  .patch("/:id", ({ params, body, db, siteId }) => quotationsService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: QuotationsContract.Patch })
  .delete("/:id", ({ params, db, siteId }) => quotationsService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });