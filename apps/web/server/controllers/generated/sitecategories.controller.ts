import { Elysia, t } from "elysia";
import { SiteCategoriesContract } from "@repo/contract";
import { siteCategoriesService } from "../modules/index";
import { dbPlugin } from "../db/connection";

export const sitecategoriesController = new Elysia({ prefix: "/sitecategories" })
  .use(dbPlugin)
  .get("/", ({ query, db }) => {
    return siteCategoriesService.findAll(query, { db, user: null });
  }, {
    query: SiteCategoriesContract.ListQuery,
    detail: {
      summary: "获取SiteCategories列表",
      description: "获取所有SiteCategories的列表信息",
      tags: ["SiteCategories"]
    }
  })
  .post("/", ({ body, db }) => {
    return siteCategoriesService.create(body, { db, user: null });
  }, {
    body: SiteCategoriesContract.Create,
    detail: {
      summary: "创建SiteCategories",
      description: "创建新的SiteCategories",
      tags: ["SiteCategories"]
    }
  })
  .patch("/:id", ({ params, body, db }) => {
    return siteCategoriesService.update(params.id, body, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    body: SiteCategoriesContract.Patch,
    detail: {
      summary: "更新SiteCategories",
      description: "根据ID更新SiteCategories信息",
      tags: ["SiteCategories"]
    }
  })
  .delete("/:id", ({ params, db }) => {
    return siteCategoriesService.delete(params.id, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除SiteCategories",
      description: "根据ID删除SiteCategories",
      tags: ["SiteCategories"]
    }
  });
