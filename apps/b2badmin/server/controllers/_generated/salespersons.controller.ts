/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { Elysia, t } from "elysia";
import { SalespersonsContract } from "@repo/contract";
import { salespersonsService } from "../../modules/index";
import { authGuardMid } from "~/middleware/auth";
import { dbPlugin } from "~/db/connection";

export const salespersonsController = new Elysia({ prefix: "/salespersons" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => salespersonsService.findAll(query, { db, auth }), { query: SalespersonsContract.ListQuery })
  .post("/", ({ body, auth, db }) => salespersonsService.create(body, { db, auth }), { body: SalespersonsContract.Create })
  .delete("/:id", ({ params, auth, db }) => salespersonsService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });