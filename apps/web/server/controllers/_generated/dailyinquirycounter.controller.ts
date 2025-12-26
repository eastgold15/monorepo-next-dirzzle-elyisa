/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { DailyInquiryCounterContract } from "@repo/contract";
import { dailyInquiryCounterService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { siteMiddleware } from "~/middleware/site";

export const dailyinquirycounterController = new Elysia({ prefix: "/dailyinquirycounter" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => dailyInquiryCounterService.findAll(query, { db, siteId }), { query: DailyInquiryCounterContract.ListQuery })
  .post("/", ({ body, db, siteId }) => dailyInquiryCounterService.create(body, { db, siteId }), { body: DailyInquiryCounterContract.Create })
  .put("/:id", ({ params, body, db, siteId }) => dailyInquiryCounterService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: DailyInquiryCounterContract.Update })
  .delete("/:id", ({ params, db, siteId }) => dailyInquiryCounterService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });