import { Elysia, t } from "elysia";
import { InquiryItemsContract } from "@repo/contract";
import { inquiryItemsService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const inquiryitemsController = new Elysia({ prefix: "/inquiryitems" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return inquiryItemsService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: InquiryItemsContract.ListQuery,
    detail: {
      summary: "获取InquiryItems列表",
      description: "获取所有InquiryItems的列表信息",
      tags: ["InquiryItems"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return inquiryItemsService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: InquiryItemsContract.Create,
    detail: {
      summary: "创建InquiryItems",
      description: "创建新的InquiryItems",
      tags: ["InquiryItems"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return inquiryItemsService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: InquiryItemsContract.Patch,
    detail: {
      summary: "更新InquiryItems",
      description: "根据ID更新InquiryItems信息",
      tags: ["InquiryItems"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return inquiryItemsService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除InquiryItems",
      description: "根据ID删除InquiryItems",
      tags: ["InquiryItems"]
    }
  });
