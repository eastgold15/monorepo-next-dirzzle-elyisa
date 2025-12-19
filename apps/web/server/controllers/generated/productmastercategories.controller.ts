import { Elysia, t } from "elysia";
import { ProductMasterCategoriesContract } from "@repo/contract";
import { productMasterCategoriesService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const productmastercategoriesController = new Elysia({ prefix: "/productmastercategories" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return productMasterCategoriesService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: ProductMasterCategoriesContract.ListQuery,
    detail: {
      summary: "获取ProductMasterCategories列表",
      description: "获取所有ProductMasterCategories的列表信息",
      tags: ["ProductMasterCategories"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return productMasterCategoriesService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: ProductMasterCategoriesContract.Create,
    detail: {
      summary: "创建ProductMasterCategories",
      description: "创建新的ProductMasterCategories",
      tags: ["ProductMasterCategories"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return productMasterCategoriesService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: ProductMasterCategoriesContract.Patch,
    detail: {
      summary: "更新ProductMasterCategories",
      description: "根据ID更新ProductMasterCategories信息",
      tags: ["ProductMasterCategories"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return productMasterCategoriesService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除ProductMasterCategories",
      description: "根据ID删除ProductMasterCategories",
      tags: ["ProductMasterCategories"]
    }
  });
