import { Elysia, t } from "elysia";
import { QuotationItemsContract } from "@repo/contract";
import { quotationItemsService } from "../modules/index";
import { dbPlugin } from "../db/connection";

export const quotationitemsController = new Elysia({ prefix: "/quotationitems" })
  .use(dbPlugin)
  .get("/", ({ query, db }) => {
    return quotationItemsService.findAll(query, { db, user: null });
  }, {
    query: QuotationItemsContract.ListQuery,
    detail: {
      summary: "获取QuotationItems列表",
      description: "获取所有QuotationItems的列表信息",
      tags: ["QuotationItems"]
    }
  })
  .post("/", ({ body, db }) => {
    return quotationItemsService.create(body, { db, user: null });
  }, {
    body: QuotationItemsContract.Create,
    detail: {
      summary: "创建QuotationItems",
      description: "创建新的QuotationItems",
      tags: ["QuotationItems"]
    }
  })
  .patch("/:id", ({ params, body, db }) => {
    return quotationItemsService.update(params.id, body, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    body: QuotationItemsContract.Patch,
    detail: {
      summary: "更新QuotationItems",
      description: "根据ID更新QuotationItems信息",
      tags: ["QuotationItems"]
    }
  })
  .delete("/:id", ({ params, db }) => {
    return quotationItemsService.delete(params.id, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除QuotationItems",
      description: "根据ID删除QuotationItems",
      tags: ["QuotationItems"]
    }
  });
