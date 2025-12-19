import { Elysia, t } from "elysia";
import { MediaContract } from "@repo/contract";
import { mediaService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const mediaController = new Elysia({ prefix: "/media" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return mediaService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: MediaContract.ListQuery,
    detail: {
      summary: "获取Media列表",
      description: "获取所有Media的列表信息",
      tags: ["Media"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return mediaService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: MediaContract.Create,
    detail: {
      summary: "创建Media",
      description: "创建新的Media",
      tags: ["Media"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return mediaService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: MediaContract.Patch,
    detail: {
      summary: "更新Media",
      description: "根据ID更新Media信息",
      tags: ["Media"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return mediaService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除Media",
      description: "根据ID删除Media",
      tags: ["Media"]
    }
  });
