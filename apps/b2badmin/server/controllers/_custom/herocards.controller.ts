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
    async ({ query, db, auth }) =>
      await heroCardsService.findAllWithMedia(query, { db, auth }),
    {
      allPermission: "HERO_CARDS_VIEW",
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
    async ({ body, db, auth }) => {
      const { mediaId, ...cardData } = body;
      return await heroCardsService.createHeroCard(cardData, mediaId ?? null, {
        db,
        auth,
      });
    },
    {
      allPermission: "HERO_CARDS_CREATE",
      body: HeroCardsContract.Create,
      detail: {
        summary: "创建首页展示卡片",
        description: "创建新的首页展示卡片，可关联媒体文件",
        tags: ["HeroCards"],
      },
    }
  )

  .put(
    "/:id",
    ({ params, body, auth, db }) =>
      heroCardsService.update(params.id, body, { db, auth }),
    {
      allPermission: "HERO_CARDS_EDIT",
      params: t.Object({ id: t.String() }),
      body: HeroCardsContract.Update,
      detail: {
        summary: "更新首页展示卡片",
        description: "更新指定首页展示卡片的信息（需要权限）",
        tags: ["HeroCards"],
      },
    }
  )

  .delete(
    "/:id",
    ({ params, auth, db }) => heroCardsService.delete(params.id, { db, auth }),
    {
      allPermission: "HERO_CARDS_DELETE",
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "删除首页展示卡片",
        description: "删除指定的首页展示卡片（需要权限）",
        tags: ["HeroCards"],
      },
    }
  )

  // 批量更新排序
  .patch(
    "/sort",
    async ({ body, db, auth }) =>
      await heroCardsService.updateSortOrder(body.items, { db, auth }),
    {
      allPermission: "HERO_CARDS_EDIT",
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
    "/toggle/:id/",
    async ({ params, db, auth }) =>
      await heroCardsService.toggleStatus(params.id, { db, auth }),
    {
      allPermission: "HERO_CARDS_EDIT",
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: "切换卡片状态",
        description: "启用或禁用指定的首页展示卡片",
        tags: ["HeroCards"],
      },
    }
  );
