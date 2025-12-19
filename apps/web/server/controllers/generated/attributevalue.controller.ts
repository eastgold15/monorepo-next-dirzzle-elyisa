import { Elysia, t } from "elysia";
import { AttributeValueContract } from "@repo/contract";
import { attributeValueService } from "../modules/index";
import { dbPlugin } from "../db/connection";

export const attributevalueController = new Elysia({ prefix: "/attributevalue" })
  .use(dbPlugin)
  .get("/", ({ query, db }) => {
    return attributeValueService.findAll(query, { db, user: null });
  }, {
    query: AttributeValueContract.ListQuery,
    detail: {
      summary: "获取AttributeValue列表",
      description: "获取所有AttributeValue的列表信息",
      tags: ["AttributeValue"]
    }
  })
  .post("/", ({ body, db }) => {
    return attributeValueService.create(body, { db, user: null });
  }, {
    body: AttributeValueContract.Create,
    detail: {
      summary: "创建AttributeValue",
      description: "创建新的AttributeValue",
      tags: ["AttributeValue"]
    }
  })
  .patch("/:id", ({ params, body, db }) => {
    return attributeValueService.update(params.id, body, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    body: AttributeValueContract.Patch,
    detail: {
      summary: "更新AttributeValue",
      description: "根据ID更新AttributeValue信息",
      tags: ["AttributeValue"]
    }
  })
  .delete("/:id", ({ params, db }) => {
    return attributeValueService.delete(params.id, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除AttributeValue",
      description: "根据ID删除AttributeValue",
      tags: ["AttributeValue"]
    }
  });
