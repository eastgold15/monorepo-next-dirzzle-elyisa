/**
 * 🤖 【B2B Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { DailyInquiryCounterContract } from "@repo/contract";
import { dailyInquiryCounterService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { authGuardMid } from "~/middleware/auth";

export const dailyinquirycounterController = new Elysia({ prefix: "/dailyinquirycounter" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => dailyInquiryCounterService.findAll(query, { db, auth }), { query: DailyInquiryCounterContract.ListQuery })
  .post("/", ({ body, auth, db }) => dailyInquiryCounterService.create(body, { db, auth }), { body: DailyInquiryCounterContract.Create })
  .delete("/:id", ({ params, auth, db }) => dailyInquiryCounterService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });