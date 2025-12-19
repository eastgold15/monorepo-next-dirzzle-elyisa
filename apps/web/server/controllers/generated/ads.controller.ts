import { Elysia, t } from "elysia";
import { AdsContract } from "@repo/contract";
import { adsService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const adsController = new Elysia({ prefix: "/ads" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return adsService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: AdsContract.ListQuery,
    detail: {
      summary: "获取Ads列表",
      description: "获取所有Ads的列表信息",
      tags: ["Ads"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return adsService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: AdsContract.Create,
    detail: {
      summary: "创建Ads",
      description: "创建新的Ads",
      tags: ["Ads"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return adsService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: AdsContract.Patch,
    detail: {
      summary: "更新Ads",
      description: "根据ID更新Ads信息",
      tags: ["Ads"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return adsService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除Ads",
      description: "根据ID删除Ads",
      tags: ["Ads"]
    }
  });
