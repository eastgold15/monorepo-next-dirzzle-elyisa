import { Elysia, t } from "elysia";
import { SitesContract } from "@repo/contract";
import { sitesService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const sitesController = new Elysia({ prefix: "/sites" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return sitesService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: SitesContract.ListQuery,
    detail: {
      summary: "获取Sites列表",
      description: "获取所有Sites的列表信息",
      tags: ["Sites"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return sitesService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: SitesContract.Create,
    detail: {
      summary: "创建Sites",
      description: "创建新的Sites",
      tags: ["Sites"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return sitesService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: SitesContract.Patch,
    detail: {
      summary: "更新Sites",
      description: "根据ID更新Sites信息",
      tags: ["Sites"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return sitesService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除Sites",
      description: "根据ID删除Sites",
      tags: ["Sites"]
    }
  });
