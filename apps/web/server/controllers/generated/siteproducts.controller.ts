import { Elysia, t } from "elysia";
import { SiteProductsContract } from "@repo/contract";
import { siteProductsService } from "../modules/index";
import { dbPlugin } from "../db/connection";

export const siteproductsController = new Elysia({ prefix: "/siteproducts" })
  .use(dbPlugin)
  .get("/", ({ query, db }) => {
    return siteProductsService.findAll(query, { db, user: null });
  }, {
    query: SiteProductsContract.ListQuery,
    detail: {
      summary: "获取SiteProducts列表",
      description: "获取所有SiteProducts的列表信息",
      tags: ["SiteProducts"]
    }
  })
  .post("/", ({ body, db }) => {
    return siteProductsService.create(body, { db, user: null });
  }, {
    body: SiteProductsContract.Create,
    detail: {
      summary: "创建SiteProducts",
      description: "创建新的SiteProducts",
      tags: ["SiteProducts"]
    }
  })
  .patch("/:id", ({ params, body, db }) => {
    return siteProductsService.update(params.id, body, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    body: SiteProductsContract.Patch,
    detail: {
      summary: "更新SiteProducts",
      description: "根据ID更新SiteProducts信息",
      tags: ["SiteProducts"]
    }
  })
  .delete("/:id", ({ params, db }) => {
    return siteProductsService.delete(params.id, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除SiteProducts",
      description: "根据ID删除SiteProducts",
      tags: ["SiteProducts"]
    }
  });
