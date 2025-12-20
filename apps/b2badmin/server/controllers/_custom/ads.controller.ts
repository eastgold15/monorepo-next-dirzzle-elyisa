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

  // 获取广告列表（包含媒体信息）
  .get(
    "/",
    async ({ query, db, auth, permissions }) => {
      if (!permissions.includes("ADS_VIEW")) throw new Error("Forbidden");
      return await adsService.findAllWithMedia(query, { db, auth });
    },
    {
      query: t.Object({
        page: t.Optional(t.Number()),
        limit: t.Optional(t.Number()),
        search: t.Optional(t.String()),
        type: t.Optional(t.String()),
        position: t.Optional(t.String()),
        isActive: t.Optional(t.Boolean()),
      }),
      detail: {
        summary: "获取广告列表",
        description: "获取当前站点的所有广告，包含媒体信息",
        tags: ["Ads"],
      },
    }
  )

  // 创建广告（支持关联媒体）
  .post(
    "/",
    async ({ body, db, auth, permissions }) => {
      if (!permissions.includes("ADS_CREATE")) throw new Error("Forbidden");

      const { mediaId, ...adData } = body;
      return await adsService.createAd(adData, mediaId, { db, auth });
    },
    {
      body: t.Object({
        title: t.String(),
        description: t.Optional(t.String()),
        type: t.Optional(t.String()),
        link: t.Optional(t.String()),
        position: t.Optional(t.String()),
        startDate: t.Optional(t.String()),
        endDate: t.Optional(t.String()),
        sortOrder: t.Optional(t.Number()),
        isActive: t.Optional(t.Boolean()),
        mediaId: t.Optional(t.String()),
      }),
      detail: {
        summary: "创建广告",
        description: "创建新的广告，可关联媒体文件",
        tags: ["Ads"],
      },
    }
  )

  // 批量更新排序
  .patch(
    "/sort",
    async ({ body, db, auth, permissions }) => {
      if (!permissions.includes("ADS_EDIT")) throw new Error("Forbidden");

      return await adsService.updateSortOrder(body.items, { db, auth });
    },
    {
      body: t.Object({
        items: t.Array(
          t.Object({
            id: t.String(),
            sortOrder: t.Number(),
          })
        ),
      }),
      detail: {
        summary: "批量更新广告排序",
        description: "批量更新广告的排序",
        tags: ["Ads"],
      },
    }
  )

  // 切换广告激活状态
  .patch(
    "/:id/toggle",
    async ({ params, db, auth, permissions }) => {
      if (!permissions.includes("ADS_EDIT")) throw new Error("Forbidden");

      return await adsService.toggleStatus(params.id, { db, auth });
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: "切换广告状态",
        description: "启用或禁用指定的广告",
        tags: ["Ads"],
      },
    }
  )

  // 批量删除
  .delete(
    "/batch",
    async ({ body, db, auth, permissions }) => {
      if (!permissions.includes("ADS_DELETE")) throw new Error("Forbidden");

      return await adsService.batchDelete(body.ids, { db, auth });
    },
    {
      body: t.Object({
        ids: t.Array(t.String()),
      }),
      detail: {
        summary: "批量删除广告",
        description: "批量删除广告",
        tags: ["Ads"],
      },
    }
  )

  // 标准的 CRUD 操作
  .get(
    "/",
    ({ query, permissions, auth, db }) => {
      if (!permissions.includes("ADS_VIEW")) throw new Error("Forbidden");
      return adsService.findAll(query, { db, auth });
    },
    {
      query: AdsContract.ListQuery,
      detail: {
        summary: "获取广告列表",
        description: "分页获取广告列表（需要权限）",
        tags: ["Ads"],
      },
    }
  )

  .get(
    "/:id",
    ({ params, permissions, auth, db }) => {
      if (!permissions.includes("ADS_VIEW")) throw new Error("Forbidden");
      return adsService.findOne(params.id, { db, auth });
    },
    {
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "获取广告详情",
        description: "获取指定广告的详细信息（需要权限）",
        tags: ["Ads"],
      },
    }
  )

  .patch(
    "/:id",
    ({ params, body, permissions, auth, db }) => {
      if (!permissions.includes("ADS_EDIT")) throw new Error("Forbidden");
      return adsService.update(params.id, body, { db, auth });
    },
    {
      params: t.Object({ id: t.String() }),
      body: AdsContract.Patch,
      detail: {
        summary: "更新广告",
        description: "更新指定广告的信息（需要权限）",
        tags: ["Ads"],
      },
    }
  )

  .delete(
    "/:id",
    ({ params, permissions, auth, db }) => {
      if (!permissions.includes("ADS_DELETE")) throw new Error("Forbidden");
      return adsService.delete(params.id, { db, auth });
    },
    {
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "删除广告",
        description: "删除指定的广告（需要权限）",
        tags: ["Ads"],
      },
    }
  );
