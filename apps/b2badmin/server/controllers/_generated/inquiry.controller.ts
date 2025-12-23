/**
 * 🤖 【B2B Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { InquiryContract } from "@repo/contract";
import { inquiryService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { authGuardMid } from "~/middleware/auth";

export const inquiryController = new Elysia({ prefix: "/inquiry" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => inquiryService.findAll(query, { db, auth }), { query: InquiryContract.ListQuery })
  .post("/", ({ body, auth, db }) => inquiryService.create(body, { db, auth }), { body: InquiryContract.Create })
  .delete("/:id", ({ params, auth, db }) => inquiryService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });