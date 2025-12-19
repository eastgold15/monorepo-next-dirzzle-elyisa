import { Elysia, t } from "elysia";
import { ProductMediaContract } from "@repo/contract";
import { productMediaService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const productmediaController = new Elysia({ prefix: "/productmedia" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return productMediaService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: ProductMediaContract.ListQuery,
    detail: {
      summary: "获取ProductMedia列表",
      description: "获取所有ProductMedia的列表信息",
      tags: ["ProductMedia"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return productMediaService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: ProductMediaContract.Create,
    detail: {
      summary: "创建ProductMedia",
      description: "创建新的ProductMedia",
      tags: ["ProductMedia"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return productMediaService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: ProductMediaContract.Patch,
    detail: {
      summary: "更新ProductMedia",
      description: "根据ID更新ProductMedia信息",
      tags: ["ProductMedia"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return productMediaService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除ProductMedia",
      description: "根据ID删除ProductMedia",
      tags: ["ProductMedia"]
    }
  });
