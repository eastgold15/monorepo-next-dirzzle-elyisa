import { Elysia, t } from "elysia";
import { SiteCategoriesContract } from "@repo/contract";
import { siteCategoriesService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const sitecategoriesController = new Elysia({ prefix: "/sitecategories" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return siteCategoriesService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: SiteCategoriesContract.ListQuery,
    detail: {
      summary: "获取SiteCategories列表",
      description: "获取所有SiteCategories的列表信息",
      tags: ["SiteCategories"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return siteCategoriesService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: SiteCategoriesContract.Create,
    detail: {
      summary: "创建SiteCategories",
      description: "创建新的SiteCategories",
      tags: ["SiteCategories"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return siteCategoriesService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: SiteCategoriesContract.Patch,
    detail: {
      summary: "更新SiteCategories",
      description: "根据ID更新SiteCategories信息",
      tags: ["SiteCategories"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return siteCategoriesService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除SiteCategories",
      description: "根据ID删除SiteCategories",
      tags: ["SiteCategories"]
    }
  });
