/**
 * 🤖 【Web Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */

import { DailyInquiryCounterContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";
import { dailyInquiryCounterService } from "../../modules/index";

export const dailyinquirycounterController = new Elysia({
  prefix: "/dailyinquirycounter",
})
  .use(dbPlugin)
  .use(siteMiddleware)
  .get(
    "/",
    ({ query, db, siteId }) =>
      dailyInquiryCounterService.findAll(query, { db, siteId }),
    { query: DailyInquiryCounterContract.ListQuery }
  )
  .post(
    "/",
    ({ body, db, siteId }) =>
      dailyInquiryCounterService.create(body, { db, siteId }),
    { body: DailyInquiryCounterContract.Create }
  )
  .patch(
    "/:id",
    ({ params, body, db, siteId }) =>
      dailyInquiryCounterService.update(params.id, body, { db, siteId }),
    {
      params: t.Object({ id: t.String() }),
      body: DailyInquiryCounterContract.Patch,
    }
  )
  .delete(
    "/:id",
    ({ params, db, siteId }) =>
      dailyInquiryCounterService.delete(params.id, { db, siteId }),
    { params: t.Object({ id: t.String() }) }
  );
