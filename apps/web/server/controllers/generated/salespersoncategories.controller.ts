import { Elysia, t } from "elysia";
import { SalespersonCategoriesContract } from "@repo/contract";
import { salespersonCategoriesService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";

export const salespersoncategoriesController = new Elysia({ prefix: "/salespersoncategories" })
  .use(dbPlugin)
  .get("/", ({ query, db }) => {
    return salespersonCategoriesService.findAll(query, { db, user: null });
  }, {
    query: SalespersonCategoriesContract.ListQuery,
    detail: {
      summary: "获取SalespersonCategories列表",
      description: "获取所有SalespersonCategories的列表信息",
      tags: ["SalespersonCategories"]
    }
  })
  .post("/", ({ body, db }) => {
    return salespersonCategoriesService.create(body, { db, user: null });
  }, {
    body: SalespersonCategoriesContract.Create,
    detail: {
      summary: "创建SalespersonCategories",
      description: "创建新的SalespersonCategories",
      tags: ["SalespersonCategories"]
    }
  })
  .patch("/:id", ({ params, body, db }) => {
    return salespersonCategoriesService.update(params.id, body, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    body: SalespersonCategoriesContract.Patch,
    detail: {
      summary: "更新SalespersonCategories",
      description: "根据ID更新SalespersonCategories信息",
      tags: ["SalespersonCategories"]
    }
  })
  .delete("/:id", ({ params, db }) => {
    return salespersonCategoriesService.delete(params.id, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除SalespersonCategories",
      description: "根据ID删除SalespersonCategories",
      tags: ["SalespersonCategories"]
    }
  });
