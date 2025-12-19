import { Elysia, t } from "elysia";
import { QuotationItemsContract } from "@repo/contract";
import { quotationItemsService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const quotationitemsController = new Elysia({ prefix: "/quotationitems" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return quotationItemsService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: QuotationItemsContract.ListQuery,
    detail: {
      summary: "获取QuotationItems列表",
      description: "获取所有QuotationItems的列表信息",
      tags: ["QuotationItems"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return quotationItemsService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: QuotationItemsContract.Create,
    detail: {
      summary: "创建QuotationItems",
      description: "创建新的QuotationItems",
      tags: ["QuotationItems"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return quotationItemsService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: QuotationItemsContract.Patch,
    detail: {
      summary: "更新QuotationItems",
      description: "根据ID更新QuotationItems信息",
      tags: ["QuotationItems"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return quotationItemsService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除QuotationItems",
      description: "根据ID删除QuotationItems",
      tags: ["QuotationItems"]
    }
  });
