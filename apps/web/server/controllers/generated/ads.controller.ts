import { Elysia, t } from "elysia";
import { AdsContract } from "@repo/contract";
import { adsService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";

export const adsController = new Elysia({ prefix: "/ads" })
  .use(dbPlugin)
  .get("/", ({ query, db }) => {
    return adsService.findAll(query, { db, user: null });
  }, {
    query: AdsContract.ListQuery,
    detail: {
      summary: "获取Ads列表",
      description: "获取所有Ads的列表信息",
      tags: ["Ads"]
    }
  })
  .post("/", ({ body, db }) => {
    return adsService.create(body, { db, user: null });
  }, {
    body: AdsContract.Create,
    detail: {
      summary: "创建Ads",
      description: "创建新的Ads",
      tags: ["Ads"]
    }
  })
  .patch("/:id", ({ params, body, db }) => {
    return adsService.update(params.id, body, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    body: AdsContract.Patch,
    detail: {
      summary: "更新Ads",
      description: "根据ID更新Ads信息",
      tags: ["Ads"]
    }
  })
  .delete("/:id", ({ params, db }) => {
    return adsService.delete(params.id, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除Ads",
      description: "根据ID删除Ads",
      tags: ["Ads"]
    }
  });
