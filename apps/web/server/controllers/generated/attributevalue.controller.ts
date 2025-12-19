import { Elysia, t } from "elysia";
import { AttributeValueContract } from "@repo/contract";
import { attributeValueService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const attributevalueController = new Elysia({ prefix: "/attributevalue" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return attributeValueService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: AttributeValueContract.ListQuery,
    detail: {
      summary: "获取AttributeValue列表",
      description: "获取所有AttributeValue的列表信息",
      tags: ["AttributeValue"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return attributeValueService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: AttributeValueContract.Create,
    detail: {
      summary: "创建AttributeValue",
      description: "创建新的AttributeValue",
      tags: ["AttributeValue"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return attributeValueService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: AttributeValueContract.Patch,
    detail: {
      summary: "更新AttributeValue",
      description: "根据ID更新AttributeValue信息",
      tags: ["AttributeValue"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return attributeValueService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除AttributeValue",
      description: "根据ID删除AttributeValue",
      tags: ["AttributeValue"]
    }
  });
