import { Elysia, t } from "elysia";
import { ProductMasterCategoriesContract } from "@repo/contract";
import { productMasterCategoriesService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";

export const productmastercategoriesController = new Elysia({ prefix: "/productmastercategories" })
  .use(dbPlugin)
  .get("/", ({ query, db }) => {
    return productMasterCategoriesService.findAll(query, { db, user: null });
  }, {
    query: ProductMasterCategoriesContract.ListQuery,
    detail: {
      summary: "获取ProductMasterCategories列表",
      description: "获取所有ProductMasterCategories的列表信息",
      tags: ["ProductMasterCategories"]
    }
  })
  .post("/", ({ body, db }) => {
    return productMasterCategoriesService.create(body, { db, user: null });
  }, {
    body: ProductMasterCategoriesContract.Create,
    detail: {
      summary: "创建ProductMasterCategories",
      description: "创建新的ProductMasterCategories",
      tags: ["ProductMasterCategories"]
    }
  })
  .patch("/:id", ({ params, body, db }) => {
    return productMasterCategoriesService.update(params.id, body, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    body: ProductMasterCategoriesContract.Patch,
    detail: {
      summary: "更新ProductMasterCategories",
      description: "根据ID更新ProductMasterCategories信息",
      tags: ["ProductMasterCategories"]
    }
  })
  .delete("/:id", ({ params, db }) => {
    return productMasterCategoriesService.delete(params.id, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除ProductMasterCategories",
      description: "根据ID删除ProductMasterCategories",
      tags: ["ProductMasterCategories"]
    }
  });
