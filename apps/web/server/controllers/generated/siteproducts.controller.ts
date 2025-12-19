import { Elysia, t } from "elysia";
import { SiteProductsContract } from "@repo/contract";
import { siteProductsService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const siteproductsController = new Elysia({ prefix: "/siteproducts" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return siteProductsService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: SiteProductsContract.ListQuery,
    detail: {
      summary: "获取SiteProducts列表",
      description: "获取所有SiteProducts的列表信息",
      tags: ["SiteProducts"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return siteProductsService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: SiteProductsContract.Create,
    detail: {
      summary: "创建SiteProducts",
      description: "创建新的SiteProducts",
      tags: ["SiteProducts"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return siteProductsService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: SiteProductsContract.Patch,
    detail: {
      summary: "更新SiteProducts",
      description: "根据ID更新SiteProducts信息",
      tags: ["SiteProducts"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return siteProductsService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除SiteProducts",
      description: "根据ID删除SiteProducts",
      tags: ["SiteProducts"]
    }
  });
