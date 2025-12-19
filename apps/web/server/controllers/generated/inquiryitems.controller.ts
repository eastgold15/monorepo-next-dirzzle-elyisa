import { Elysia, t } from "elysia";
import { InquiryItemsContract } from "@repo/contract";
import { inquiryItemsService } from "../modules/index";
import { dbPlugin } from "../db/connection";

export const inquiryitemsController = new Elysia({ prefix: "/inquiryitems" })
  .use(dbPlugin)
  .get("/", ({ query, db }) => {
    return inquiryItemsService.findAll(query, { db, user: null });
  }, {
    query: InquiryItemsContract.ListQuery,
    detail: {
      summary: "获取InquiryItems列表",
      description: "获取所有InquiryItems的列表信息",
      tags: ["InquiryItems"]
    }
  })
  .post("/", ({ body, db }) => {
    return inquiryItemsService.create(body, { db, user: null });
  }, {
    body: InquiryItemsContract.Create,
    detail: {
      summary: "创建InquiryItems",
      description: "创建新的InquiryItems",
      tags: ["InquiryItems"]
    }
  })
  .patch("/:id", ({ params, body, db }) => {
    return inquiryItemsService.update(params.id, body, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    body: InquiryItemsContract.Patch,
    detail: {
      summary: "更新InquiryItems",
      description: "根据ID更新InquiryItems信息",
      tags: ["InquiryItems"]
    }
  })
  .delete("/:id", ({ params, db }) => {
    return inquiryItemsService.delete(params.id, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除InquiryItems",
      description: "根据ID删除InquiryItems",
      tags: ["InquiryItems"]
    }
  });
