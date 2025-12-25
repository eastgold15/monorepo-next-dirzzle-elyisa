import { MediaContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";
import { mediaService } from "~/modules/index";

export const mediaController = new Elysia({ prefix: "/media", tags: ["Media"] })
  .use(authGuardMid)
  .use(dbPlugin)

  // 1. 上传
  .post(
    "/upload",
    async ({ body, db, auth }) => {
      // 这里的 auth 已经包含了 siteId, factoryId 等
      return await mediaService.upload(body.file, { db, auth }, body.category);
    },
    {
      allPermission: "MEDIA_CREATE",
      body: t.Object({ file: t.File(), category: t.Optional(t.String()) }),
    }
  )

  // 2. 列表
  .get(
    "/list",
    async ({ query, db, auth }) =>
      await mediaService.getMediaList(query, { db, auth }),
    {
      allPermission: "MEDIA_VIEW",
      query: t.Object({
        category: t.Optional(t.String()),
        search: t.Optional(t.String()),
        ids: t.Optional(t.Array(t.String())),
      }),
    }
  )
  // 4. 更新
  .put(
    "/:id",
    ({ params, body, permissions, auth, db }) =>
      mediaService.update(params.id, body, { db, auth }),
    {
      allPermission: "MEDIA_EDIT",
      params: t.Object({ id: t.String() }),
      body: MediaContract.Update,
    }
  )

  // 5. 单个物理删除
  .delete(
    "/:id",
    async ({ params, db, auth, permissions }) => {
      if (!permissions.includes("MEDIA_DELETE")) throw new Error("Forbidden");
      return await mediaService.deletePhysical(params.id, { db, auth });
    },
    {
      allPermission: "MEDIA_DELETE",
      params: t.Object({ id: t.String() }),
    }
  )

  // 6. 批量删除
  .delete(
    "/batch",
    async ({ body, db, auth, permissions }) => {
      if (!permissions.includes("MEDIA_DELETE")) throw new Error("Forbidden");
      return await mediaService.batchDeletePhysical(body.ids, { db, auth });
    },
    {
      allPermission: "MEDIA_DELETE",
      body: t.Object({ ids: t.Array(t.String()) }),
    }
  );
