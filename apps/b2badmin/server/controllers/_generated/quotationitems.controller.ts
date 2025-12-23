/**
 * 🤖 【B2B Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { QuotationItemsContract } from "@repo/contract";
import { quotationItemsService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { authGuardMid } from "~/middleware/auth";

export const quotationitemsController = new Elysia({ prefix: "/quotationitems" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => quotationItemsService.findAll(query, { db, auth }), { query: QuotationItemsContract.ListQuery })
  .post("/", ({ body, auth, db }) => quotationItemsService.create(body, { db, auth }), { body: QuotationItemsContract.Create })
  .delete("/:id", ({ params, auth, db }) => quotationItemsService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });