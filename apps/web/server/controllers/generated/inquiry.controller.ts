import { Elysia, t } from "elysia";
import { InquiryContract } from "@repo/contract";
import { inquiryService } from "../modules/index";
import { dbPlugin } from "../db/connection";

export const inquiryController = new Elysia({ prefix: "/inquiry" })
  .use(dbPlugin)
  .get("/", ({ query, db }) => {
    return inquiryService.findAll(query, { db, user: null });
  }, {
    query: InquiryContract.ListQuery,
    detail: {
      summary: "获取Inquiry列表",
      description: "获取所有Inquiry的列表信息",
      tags: ["Inquiry"]
    }
  })
  .post("/", ({ body, db }) => {
    return inquiryService.create(body, { db, user: null });
  }, {
    body: InquiryContract.Create,
    detail: {
      summary: "创建Inquiry",
      description: "创建新的Inquiry",
      tags: ["Inquiry"]
    }
  })
  .patch("/:id", ({ params, body, db }) => {
    return inquiryService.update(params.id, body, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    body: InquiryContract.Patch,
    detail: {
      summary: "更新Inquiry",
      description: "根据ID更新Inquiry信息",
      tags: ["Inquiry"]
    }
  })
  .delete("/:id", ({ params, db }) => {
    return inquiryService.delete(params.id, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除Inquiry",
      description: "根据ID删除Inquiry",
      tags: ["Inquiry"]
    }
  });
