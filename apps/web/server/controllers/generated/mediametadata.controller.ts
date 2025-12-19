import { Elysia, t } from "elysia";
import { MediaMetadataContract } from "@repo/contract";
import { mediaMetadataService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";

export const mediametadataController = new Elysia({ prefix: "/mediametadata" })
  .use(dbPlugin)
  .get("/", ({ query, db }) => {
    return mediaMetadataService.findAll(query, { db, user: null });
  }, {
    query: MediaMetadataContract.ListQuery,
    detail: {
      summary: "获取MediaMetadata列表",
      description: "获取所有MediaMetadata的列表信息",
      tags: ["MediaMetadata"]
    }
  })
  .post("/", ({ body, db }) => {
    return mediaMetadataService.create(body, { db, user: null });
  }, {
    body: MediaMetadataContract.Create,
    detail: {
      summary: "创建MediaMetadata",
      description: "创建新的MediaMetadata",
      tags: ["MediaMetadata"]
    }
  })
  .patch("/:id", ({ params, body, db }) => {
    return mediaMetadataService.update(params.id, body, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    body: MediaMetadataContract.Patch,
    detail: {
      summary: "更新MediaMetadata",
      description: "根据ID更新MediaMetadata信息",
      tags: ["MediaMetadata"]
    }
  })
  .delete("/:id", ({ params, db }) => {
    return mediaMetadataService.delete(params.id, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除MediaMetadata",
      description: "根据ID删除MediaMetadata",
      tags: ["MediaMetadata"]
    }
  });
