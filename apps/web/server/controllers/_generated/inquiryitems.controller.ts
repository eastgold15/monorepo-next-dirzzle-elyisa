/**
 * 🤖 【Web Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { Elysia, t } from "elysia";
import { InquiryItemsContract } from "@repo/contract";
import { inquiryItemsService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const inquiryitemsController = new Elysia({ prefix: "/inquiryitems" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => inquiryItemsService.findAll(query, { db, siteId }), { query: InquiryItemsContract.ListQuery })
  .post("/", ({ body, db, siteId }) => inquiryItemsService.create(body, { db, siteId }), { body: InquiryItemsContract.Create })
  .patch("/:id", ({ params, body, db, siteId }) => inquiryItemsService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: InquiryItemsContract.Patch })
  .delete("/:id", ({ params, db, siteId }) => inquiryItemsService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });