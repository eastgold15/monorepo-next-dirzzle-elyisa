import { Elysia, t } from "elysia";
import { QuotationsContract } from "@repo/contract";
import { quotationsService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";

export const quotationsController = new Elysia({ prefix: "/quotations" })
  .use(dbPlugin)
  .get("/", ({ query, db }) => {
    return quotationsService.findAll(query, { db, user: null });
  }, {
    query: QuotationsContract.ListQuery,
    detail: {
      summary: "获取Quotations列表",
      description: "获取所有Quotations的列表信息",
      tags: ["Quotations"]
    }
  })
  .post("/", ({ body, db }) => {
    return quotationsService.create(body, { db, user: null });
  }, {
    body: QuotationsContract.Create,
    detail: {
      summary: "创建Quotations",
      description: "创建新的Quotations",
      tags: ["Quotations"]
    }
  })
  .patch("/:id", ({ params, body, db }) => {
    return quotationsService.update(params.id, body, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    body: QuotationsContract.Patch,
    detail: {
      summary: "更新Quotations",
      description: "根据ID更新Quotations信息",
      tags: ["Quotations"]
    }
  })
  .delete("/:id", ({ params, db }) => {
    return quotationsService.delete(params.id, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除Quotations",
      description: "根据ID删除Quotations",
      tags: ["Quotations"]
    }
  });
