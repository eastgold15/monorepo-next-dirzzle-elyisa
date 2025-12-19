import { Elysia, t } from "elysia";
import { SiteConfigContract } from "@repo/contract";
import { siteConfigService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const siteconfigController = new Elysia({ prefix: "/siteconfig" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return siteConfigService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: SiteConfigContract.ListQuery,
    detail: {
      summary: "获取SiteConfig列表",
      description: "获取所有SiteConfig的列表信息",
      tags: ["SiteConfig"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return siteConfigService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: SiteConfigContract.Create,
    detail: {
      summary: "创建SiteConfig",
      description: "创建新的SiteConfig",
      tags: ["SiteConfig"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return siteConfigService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: SiteConfigContract.Patch,
    detail: {
      summary: "更新SiteConfig",
      description: "根据ID更新SiteConfig信息",
      tags: ["SiteConfig"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return siteConfigService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除SiteConfig",
      description: "根据ID删除SiteConfig",
      tags: ["SiteConfig"]
    }
  });
