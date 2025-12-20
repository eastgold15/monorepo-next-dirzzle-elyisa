/**
 * 🤖 【Web Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { Elysia, t } from "elysia";
import { AttributeContract } from "@repo/contract";
import { attributeService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const attributeController = new Elysia({ prefix: "/attribute" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => attributeService.findAll(query, { db, siteId }), { query: AttributeContract.ListQuery })
  .post("/", ({ body, db, siteId }) => attributeService.create(body, { db, siteId }), { body: AttributeContract.Create })
  .patch("/:id", ({ params, body, db, siteId }) => attributeService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: AttributeContract.Patch })
  .delete("/:id", ({ params, db, siteId }) => attributeService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });