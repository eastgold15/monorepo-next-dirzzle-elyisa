import { Elysia, t } from "elysia";
import { SkuMediaContract } from "@repo/contract";
import { skuMediaService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const skumediaController = new Elysia({ prefix: "/skumedia" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return skuMediaService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: SkuMediaContract.ListQuery,
    detail: {
      summary: "获取SkuMedia列表",
      description: "获取所有SkuMedia的列表信息",
      tags: ["SkuMedia"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return skuMediaService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: SkuMediaContract.Create,
    detail: {
      summary: "创建SkuMedia",
      description: "创建新的SkuMedia",
      tags: ["SkuMedia"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return skuMediaService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: SkuMediaContract.Patch,
    detail: {
      summary: "更新SkuMedia",
      description: "根据ID更新SkuMedia信息",
      tags: ["SkuMedia"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return skuMediaService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除SkuMedia",
      description: "根据ID删除SkuMedia",
      tags: ["SkuMedia"]
    }
  });
