import { Elysia, t } from "elysia";
import { DailyInquiryCounterContract } from "@repo/contract";
import { dailyInquiryCounterService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const dailyinquirycounterController = new Elysia({ prefix: "/dailyinquirycounter" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return dailyInquiryCounterService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: DailyInquiryCounterContract.ListQuery,
    detail: {
      summary: "获取DailyInquiryCounter列表",
      description: "获取所有DailyInquiryCounter的列表信息",
      tags: ["DailyInquiryCounter"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return dailyInquiryCounterService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: DailyInquiryCounterContract.Create,
    detail: {
      summary: "创建DailyInquiryCounter",
      description: "创建新的DailyInquiryCounter",
      tags: ["DailyInquiryCounter"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return dailyInquiryCounterService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: DailyInquiryCounterContract.Patch,
    detail: {
      summary: "更新DailyInquiryCounter",
      description: "根据ID更新DailyInquiryCounter信息",
      tags: ["DailyInquiryCounter"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return dailyInquiryCounterService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除DailyInquiryCounter",
      description: "根据ID删除DailyInquiryCounter",
      tags: ["DailyInquiryCounter"]
    }
  });
