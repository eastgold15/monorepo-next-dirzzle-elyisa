import { Elysia, t } from "elysia";
import { SkusContract } from "@repo/contract";
import { skusService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const skusController = new Elysia({ prefix: "/skus" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return skusService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: SkusContract.ListQuery,
    detail: {
      summary: "获取Skus列表",
      description: "获取所有Skus的列表信息",
      tags: ["Skus"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return skusService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: SkusContract.Create,
    detail: {
      summary: "创建Skus",
      description: "创建新的Skus",
      tags: ["Skus"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return skusService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: SkusContract.Patch,
    detail: {
      summary: "更新Skus",
      description: "根据ID更新Skus信息",
      tags: ["Skus"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return skusService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除Skus",
      description: "根据ID删除Skus",
      tags: ["Skus"]
    }
  });
