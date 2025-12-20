/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */

import { DailyInquiryCounterContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";
import { dailyInquiryCounterService } from "../../modules/index";

export const dailyinquirycounterController = new Elysia({
  prefix: "/dailyinquirycounter",
})
  .use(dbPlugin)
  .use(authGuardMid)
  .get(
    "/",
    ({ query, auth, db }) =>
      dailyInquiryCounterService.findAll(query, { db, auth }),
    { query: DailyInquiryCounterContract.ListQuery }
  )
  .post(
    "/",
    ({ body, auth, db }) =>
      dailyInquiryCounterService.create(body, { db, auth }),
    { body: DailyInquiryCounterContract.Create }
  )
  .delete(
    "/:id",
    ({ params, auth, db }) =>
      dailyInquiryCounterService.delete(params.id, { db, auth }),
    { params: t.Object({ id: t.String() }) }
  );
