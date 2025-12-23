/**
 * 🤖 【B2B Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { InquiryItemsContract } from "@repo/contract";
import { inquiryItemsService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { authGuardMid } from "~/middleware/auth";

export const inquiryitemsController = new Elysia({ prefix: "/inquiryitems" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => inquiryItemsService.findAll(query, { db, auth }), { query: InquiryItemsContract.ListQuery })
  .post("/", ({ body, auth, db }) => inquiryItemsService.create(body, { db, auth }), { body: InquiryItemsContract.Create })
  .delete("/:id", ({ params, auth, db }) => inquiryItemsService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });