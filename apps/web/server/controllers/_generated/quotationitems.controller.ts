/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { QuotationItemsContract } from "@repo/contract";
import { quotationItemsService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { siteMiddleware } from "~/middleware/site";

export const quotationitemsController = new Elysia({ prefix: "/quotationitems" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => quotationItemsService.findAll(query, { db, siteId }), { query: QuotationItemsContract.ListQuery })
  .post("/", ({ body, db, siteId }) => quotationItemsService.create(body, { db, siteId }), { body: QuotationItemsContract.Create })
  .put("/:id", ({ params, body, db, siteId }) => quotationItemsService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: QuotationItemsContract.Update })
  .delete("/:id", ({ params, db, siteId }) => quotationItemsService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });