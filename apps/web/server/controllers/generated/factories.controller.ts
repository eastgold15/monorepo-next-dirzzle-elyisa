import { Elysia, t } from "elysia";
import { FactoriesContract } from "@repo/contract";
import { factoriesService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const factoriesController = new Elysia({ prefix: "/factories" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return factoriesService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: FactoriesContract.ListQuery,
    detail: {
      summary: "获取Factories列表",
      description: "获取所有Factories的列表信息",
      tags: ["Factories"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return factoriesService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: FactoriesContract.Create,
    detail: {
      summary: "创建Factories",
      description: "创建新的Factories",
      tags: ["Factories"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return factoriesService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: FactoriesContract.Patch,
    detail: {
      summary: "更新Factories",
      description: "根据ID更新Factories信息",
      tags: ["Factories"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return factoriesService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除Factories",
      description: "根据ID删除Factories",
      tags: ["Factories"]
    }
  });
