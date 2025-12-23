/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { InquiryContract } from "@repo/contract";
import { inquiryService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { siteMiddleware } from "~/middleware/site";

export const inquiryController = new Elysia({ prefix: "/inquiry" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => inquiryService.findAll(query, { db, siteId }), { query: InquiryContract.ListQuery })
  .post("/", ({ body, db, siteId }) => inquiryService.create(body, { db, siteId }), { body: InquiryContract.Create })
  .patch("/:id", ({ params, body, db, siteId }) => inquiryService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: InquiryContract.Patch })
  .delete("/:id", ({ params, db, siteId }) => inquiryService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });