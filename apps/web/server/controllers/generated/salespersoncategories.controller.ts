import { Elysia, t } from "elysia";
import { SalespersonCategoriesContract } from "@repo/contract";
import { salespersonCategoriesService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const salespersoncategoriesController = new Elysia({ prefix: "/salespersoncategories" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return salespersonCategoriesService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: SalespersonCategoriesContract.ListQuery,
    detail: {
      summary: "获取SalespersonCategories列表",
      description: "获取所有SalespersonCategories的列表信息",
      tags: ["SalespersonCategories"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return salespersonCategoriesService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: SalespersonCategoriesContract.Create,
    detail: {
      summary: "创建SalespersonCategories",
      description: "创建新的SalespersonCategories",
      tags: ["SalespersonCategories"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return salespersonCategoriesService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: SalespersonCategoriesContract.Patch,
    detail: {
      summary: "更新SalespersonCategories",
      description: "根据ID更新SalespersonCategories信息",
      tags: ["SalespersonCategories"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return salespersonCategoriesService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除SalespersonCategories",
      description: "根据ID删除SalespersonCategories",
      tags: ["SalespersonCategories"]
    }
  });
