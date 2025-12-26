import { AdsContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";
import { adsService } from "~/modules/index";

export const adsController = new Elysia({
  prefix: "/ads",
  tags: ["Ads"],
})
  .use(authGuardMid)
  .use(dbPlugin)

  // 获取广告列表（包含媒体信息
  .get(
    "/",
    async ({ query, db, auth }) =>
      await adsService.findAllWithMedia(query, { db, auth }),
    {
      allPermission: "ADVERTISEMENTS_VIEW",
      query: AdsContract.ListQuery,
      detail: {
        operationId: "getAdsList",
        summary: "获取广告列表",
        description: "获取当前站点的所有广告，包含媒体信息",
        tags: ["Ads"],
      },
    }
  )

  // 创建广告（支持关联媒体）
  .post(
    "/",
    async ({ body, db, auth }) => {
      const { mediaId, ...adData } = body;
      return await adsService.createAd(adData, mediaId, { db, auth });
    },
    {
      allPermission: "ADVERTISEMENTS_CREATE",
      body: AdsContract.Create,
      detail: {
        summary: "创建广告",
        description: "创建新的广告，可关联媒体文件",
        tags: ["Ads"],
      },
    }
  )

  .put(
    "/:id",
    ({ params, body, auth, db }) =>
      adsService.update(params.id, body, { db, auth }),
    {
      allPermission: "ADVERTISEMENTS_EDIT",
      params: t.Object({ id: t.String() }),
      body: AdsContract.Update,
      detail: {
        summary: "更新广告",
        description: "更新指定广告的信息（需要权限）",
        tags: ["Ads"],
      },
    }
  )

  .delete(
    "/:id",
    ({ params, auth, db }) => adsService.delete(params.id, { db, auth }),
    {
      allPermission: "ADVERTISEMENTS_DELETE",
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "删除广告",
        description: "删除指定的广告（需要权限）",
        tags: ["Ads"],
      },
    }
  )

  // 批量删除
  .delete(
    "/batch",
    async ({ body, db, auth }) =>
      await adsService.batchDelete(body.ids, { db, auth }),
    {
      allPermission: "ADVERTISEMENTS_DELETE",
      body: t.Object({
        ids: t.Array(t.String()),
      }),
      detail: {
        summary: "批量删除广告",
        description: "批量删除广告",
        tags: ["Ads"],
      },
    }
  );
