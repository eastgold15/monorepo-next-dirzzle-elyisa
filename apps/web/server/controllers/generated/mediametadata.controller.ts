import { Elysia, t } from "elysia";
import { MediaMetadataContract } from "@repo/contract";
import { mediaMetadataService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const mediametadataController = new Elysia({ prefix: "/mediametadata" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return mediaMetadataService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: MediaMetadataContract.ListQuery,
    detail: {
      summary: "获取MediaMetadata列表",
      description: "获取所有MediaMetadata的列表信息",
      tags: ["MediaMetadata"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return mediaMetadataService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: MediaMetadataContract.Create,
    detail: {
      summary: "创建MediaMetadata",
      description: "创建新的MediaMetadata",
      tags: ["MediaMetadata"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return mediaMetadataService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: MediaMetadataContract.Patch,
    detail: {
      summary: "更新MediaMetadata",
      description: "根据ID更新MediaMetadata信息",
      tags: ["MediaMetadata"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return mediaMetadataService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除MediaMetadata",
      description: "根据ID删除MediaMetadata",
      tags: ["MediaMetadata"]
    }
  });
