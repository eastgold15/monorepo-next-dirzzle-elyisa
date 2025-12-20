import { HeroCardsContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";
import { heroCardsService } from "~/modules/index";

export const herocardsController = new Elysia({
  prefix: "/herocards",
  tags: ["HeroCards"],
})
  .use(authGuardMid)
  .use(dbPlugin)

  // 获取首页展示卡片列表（包含媒体信息）
  .get(
    "/",
    async ({ query, db, auth, permissions }) => {
      if (!permissions.includes("HEROCARDS_VIEW")) throw new Error("Forbidden");
      return await heroCardsService.findAllWithMedia(query, { db, auth });
    },
    {
      query: HeroCardsContract.ListQuery,
      detail: {
        summary: "获取首页展示卡片列表",
        description: "获取当前站点的所有首页展示卡片，包含媒体信息",
        tags: ["HeroCards"],
      },
    }
  )

  // 创建首页展示卡片（支持关联媒体）
  .post(
    "/",
    async ({ body, db, auth, permissions }) => {
      if (!permissions.includes("HEROCARDS_CREATE"))
        throw new Error("Forbidden");

      const { mediaId, ...cardData } = body;
      return await heroCardsService.createHeroCard(cardData, mediaId ?? null, {
        db,
        auth,
      });
    },
    {
      body: t.Object({
        title: t.String(),
        subtitle: t.Optional(t.String()),
        description: t.Optional(t.String()),
        buttonUrl: t.Optional(t.String()),
        buttonLabel: t.Optional(t.String()),
        sortOrder: t.Optional(t.Number()),
        isActive: t.Optional(t.Boolean()),
        backgroundClass: t.Optional(t.String()),
        mediaId: t.Optional(t.String()),
      }),
      detail: {
        summary: "创建首页展示卡片",
        description: "创建新的首页展示卡片，可关联媒体文件",
        tags: ["HeroCards"],
      },
    }
  )

  // 批量更新排序
  .patch(
    "/sort",
    async ({ body, db, auth, permissions }) => {
      if (!permissions.includes("HEROCARDS_EDIT")) throw new Error("Forbidden");

      return await heroCardsService.updateSortOrder(body.items, { db, auth });
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
        summary: "批量更新卡片排序",
        description: "批量更新首页展示卡片的排序",
        tags: ["HeroCards"],
      },
    }
  )

  // 切换卡片激活状态
  .patch(
    "/:id/toggle",
    async ({ params, db, auth, permissions }) => {
      if (!permissions.includes("HEROCARDS_EDIT")) throw new Error("Forbidden");

      return await heroCardsService.toggleStatus(params.id, { db, auth });
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: "切换卡片状态",
        description: "启用或禁用指定的首页展示卡片",
        tags: ["HeroCards"],
      },
    }
  )

  // 标准的 CRUD 操作
  .get(
    "/",
    ({ query, permissions, auth, db }) => {
      if (!permissions.includes("HEROCARDS_VIEW")) throw new Error("Forbidden");
      return heroCardsService.findAll(query, { db, auth });
    },
    {
      query: HeroCardsContract.ListQuery,
      detail: {
        summary: "获取首页展示卡片列表",
        description: "分页获取首页展示卡片列表（需要权限）",
        tags: ["HeroCards"],
      },
    }
  )

  .get(
    "/:id",
    ({ params, permissions, auth, db }) => {
      if (!permissions.includes("HEROCARDS_VIEW")) throw new Error("Forbidden");
      return heroCardsService.findOne(params.id, { db, auth });
    },
    {
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "获取首页展示卡片详情",
        description: "获取指定首页展示卡片的详细信息（需要权限）",
        tags: ["HeroCards"],
      },
    }
  )

  .patch(
    "/:id",
    ({ params, body, permissions, auth, db }) => {
      if (!permissions.includes("HEROCARDS_EDIT")) throw new Error("Forbidden");
      return heroCardsService.update(params.id, body, { db, auth });
    },
    {
      params: t.Object({ id: t.String() }),
      body: HeroCardsContract.Patch,
      detail: {
        summary: "更新首页展示卡片",
        description: "更新指定首页展示卡片的信息（需要权限）",
        tags: ["HeroCards"],
      },
    }
  )

  .delete(
    "/:id",
    ({ params, permissions, auth, db }) => {
      if (!permissions.includes("HEROCARDS_DELETE"))
        throw new Error("Forbidden");
      return heroCardsService.delete(params.id, { db, auth });
    },
    {
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "删除首页展示卡片",
        description: "删除指定的首页展示卡片（需要权限）",
        tags: ["HeroCards"],
      },
    }
  );
