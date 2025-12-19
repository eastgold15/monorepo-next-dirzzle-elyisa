import { Elysia, t } from "elysia";
import { QuotationsContract } from "@repo/contract";
import { quotationsService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const quotationsController = new Elysia({ prefix: "/quotations" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return quotationsService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: QuotationsContract.ListQuery,
    detail: {
      summary: "获取Quotations列表",
      description: "获取所有Quotations的列表信息",
      tags: ["Quotations"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return quotationsService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: QuotationsContract.Create,
    detail: {
      summary: "创建Quotations",
      description: "创建新的Quotations",
      tags: ["Quotations"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return quotationsService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: QuotationsContract.Patch,
    detail: {
      summary: "更新Quotations",
      description: "根据ID更新Quotations信息",
      tags: ["Quotations"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return quotationsService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除Quotations",
      description: "根据ID删除Quotations",
      tags: ["Quotations"]
    }
  });
