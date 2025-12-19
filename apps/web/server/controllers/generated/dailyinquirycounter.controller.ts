import { Elysia, t } from "elysia";
import { DailyInquiryCounterContract } from "@repo/contract";
import { dailyInquiryCounterService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";

export const dailyinquirycounterController = new Elysia({ prefix: "/dailyinquirycounter" })
  .use(dbPlugin)
  .get("/", ({ query, db }) => {
    return dailyInquiryCounterService.findAll(query, { db, user: null });
  }, {
    query: DailyInquiryCounterContract.ListQuery,
    detail: {
      summary: "获取DailyInquiryCounter列表",
      description: "获取所有DailyInquiryCounter的列表信息",
      tags: ["DailyInquiryCounter"]
    }
  })
  .post("/", ({ body, db }) => {
    return dailyInquiryCounterService.create(body, { db, user: null });
  }, {
    body: DailyInquiryCounterContract.Create,
    detail: {
      summary: "创建DailyInquiryCounter",
      description: "创建新的DailyInquiryCounter",
      tags: ["DailyInquiryCounter"]
    }
  })
  .patch("/:id", ({ params, body, db }) => {
    return dailyInquiryCounterService.update(params.id, body, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    body: DailyInquiryCounterContract.Patch,
    detail: {
      summary: "更新DailyInquiryCounter",
      description: "根据ID更新DailyInquiryCounter信息",
      tags: ["DailyInquiryCounter"]
    }
  })
  .delete("/:id", ({ params, db }) => {
    return dailyInquiryCounterService.delete(params.id, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除DailyInquiryCounter",
      description: "根据ID删除DailyInquiryCounter",
      tags: ["DailyInquiryCounter"]
    }
  });
