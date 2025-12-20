/**
 * 🤖 【Web Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { Elysia, t } from "elysia";
import { SalespersonsContract } from "@repo/contract";
import { salespersonsService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const salespersonsController = new Elysia({ prefix: "/salespersons" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => salespersonsService.findAll(query, { db, siteId }), { query: SalespersonsContract.ListQuery })
  .post("/", ({ body, db, siteId }) => salespersonsService.create(body, { db, siteId }), { body: SalespersonsContract.Create })
  .patch("/:id", ({ params, body, db, siteId }) => salespersonsService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: SalespersonsContract.Patch })
  .delete("/:id", ({ params, db, siteId }) => salespersonsService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });