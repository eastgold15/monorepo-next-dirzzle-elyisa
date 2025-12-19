import { Elysia, t } from "elysia";
import { AttributeContract } from "@repo/contract";
import { attributeService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const attributeController = new Elysia({ prefix: "/attribute" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return attributeService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: AttributeContract.ListQuery,
    detail: {
      summary: "获取Attribute列表",
      description: "获取所有Attribute的列表信息",
      tags: ["Attribute"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return attributeService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: AttributeContract.Create,
    detail: {
      summary: "创建Attribute",
      description: "创建新的Attribute",
      tags: ["Attribute"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return attributeService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: AttributeContract.Patch,
    detail: {
      summary: "更新Attribute",
      description: "根据ID更新Attribute信息",
      tags: ["Attribute"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return attributeService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除Attribute",
      description: "根据ID删除Attribute",
      tags: ["Attribute"]
    }
  });
