/**
 * 🤖 【Web Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { Elysia, t } from "elysia";
import { CustomerContract } from "@repo/contract";
import { customerService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const customerController = new Elysia({ prefix: "/customer" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => customerService.findAll(query, { db, siteId }), { query: CustomerContract.ListQuery })
  .post("/", ({ body, db, siteId }) => customerService.create(body, { db, siteId }), { body: CustomerContract.Create })
  .patch("/:id", ({ params, body, db, siteId }) => customerService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: CustomerContract.Patch })
  .delete("/:id", ({ params, db, siteId }) => customerService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });