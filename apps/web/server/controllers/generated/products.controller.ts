import { Elysia, t } from "elysia";
import { ProductsContract } from "@repo/contract";
import { productsService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const productsController = new Elysia({ prefix: "/products" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return productsService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: ProductsContract.ListQuery,
    detail: {
      summary: "获取Products列表",
      description: "获取所有Products的列表信息",
      tags: ["Products"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return productsService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: ProductsContract.Create,
    detail: {
      summary: "创建Products",
      description: "创建新的Products",
      tags: ["Products"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return productsService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: ProductsContract.Patch,
    detail: {
      summary: "更新Products",
      description: "根据ID更新Products信息",
      tags: ["Products"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return productsService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除Products",
      description: "根据ID删除Products",
      tags: ["Products"]
    }
  });
