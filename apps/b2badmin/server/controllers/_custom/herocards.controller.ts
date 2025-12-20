import { HeroCardsContract, heroCardsTable } from "@repo/contract";
import { eq, inArray } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";
import { heroCardsService } from "~/modules/index";

export const heroCardsController = new Elysia({
  prefix: "/herocards",
  tags: ["HeroCards"],
})
  .use(authGuardMid)
  .use(dbPlugin)

  // 获取首页展示卡片列表（包含业务逻辑）
  .get(
    "/",
    async ({ query, currentSite, db }) => {
      const { sort = "sortOrder", sortOrder = "asc", isActive } = query;

      // 构建查询条件
      const whereCondition: any = {
        siteId: currentSite.id,
      };

      if (isActive !== undefined) {
        whereCondition.isActive = isActive;
      }

      // 使用关系查询
      const heroCards = await db.query.heroCardsTable.findMany({
        where: whereCondition,
        with: {
          media: {
            columns: {
              id: true,
              url: true,
            },
          },
        },
        orderBy: {
          [sort]: sortOrder === "desc" ? "desc" : "asc",
          sortOrder: sortOrder === "desc" ? "desc" : "asc",
        },
      });

      return heroCards.map((item) => ({
        ...item,
        url: item.media?.url || null,
      }));
    },
    {
      query: HeroCardsContract.ListQuery,
      detail: {
        summary: "获取首页展示卡片列表",
        description: "获取当前站点的首页展示卡片列表，支持排序和状态筛选",
        tags: ["HeroCards"],
      },
    }
  )

  // 创建首页展示卡片（包含业务逻辑）
  .post(
    "/",
    async ({ body, currentSite, db }) => {
      // 设置默认值
      const heroCardData = {
        ...body,
        siteId: currentSite.id,
        sortOrder: body.sortOrder ?? 0,
        isActive: body.isActive ?? true,
        backgroundClass: body.backgroundClass ?? "bg-blue-50",
      };

      const [newCard] = await db
        .insert(heroCardsTable)
        .values(heroCardData)
        .returning();

      if (!newCard) {
        throw new HttpError.InternalServerError("创建首页展示卡片失败");
      }

      return newCard;
    },
    {
      body: HeroCardsContract.Create,
      detail: {
        summary: "创建首页展示卡片",
        description: "创建新的首页展示卡片，自动关联到当前站点",
        tags: ["HeroCards"],
      },
    }
  )

  // 更新首页展示卡片（包含业务逻辑）
  .put(
    "/:id",
    async ({ params: { id }, body, currentSite, db }) => {
      // 先检查卡片是否属于当前站点
      const existingCard = await db.query.heroCardsTable.findFirst({
        where: { id },
      });

      if (!existingCard) {
        throw new HttpError.NotFound("首页展示卡片不存在");
      }

      if (existingCard.siteId !== currentSite.id) {
        throw new HttpError.Forbidden("无权修改该首页展示卡片");
      }

      // 准备更新数据
      const updateData = {
        ...body,
        mediaId: body.mediaId
          ? Array.isArray(body.mediaId)
            ? body.mediaId[0]
            : body.mediaId
          : undefined,
      };

      const result = await db
        .update(heroCardsTable)
        .set(updateData)
        .where(eq(heroCardsTable.id, id))
        .returning();

      if (result.length === 0) {
        throw new HttpError.NotFound("首页展示卡片不存在");
      }

      return result[0];
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: HeroCardsContract.Update,
      detail: {
        summary: "更新首页展示卡片",
        description: "更新指定首页展示卡片的信息",
        tags: ["HeroCards"],
      },
    }
  )

  // 批量删除首页展示卡片（业务逻辑）
  .delete(
    "/batch",
    async ({ body: { ids }, currentSite, db }) => {
      if (ids.length === 0) {
        return { message: "没有选择要删除的卡片" };
      }

      // 检查所有卡片是否属于当前站点
      const existingCards = await db.query.heroCardsTable.findMany({
        where: { id: { in: ids } },
        columns: { id: true, siteId: true },
      });

      const unauthorizedCards = existingCards.filter(
        (card) => card.siteId !== currentSite.id
      );
      if (unauthorizedCards.length > 0) {
        throw new HttpError.Forbidden("无权删除部分首页展示卡片");
      }

      // 批量删除
      await db.delete(heroCardsTable).where(inArray(heroCardsTable.id, ids));

      return {
        message: `成功删除 ${ids.length} 个首页展示卡片`,
        count: ids.length,
      };
    },
    {
      body: t.Object({
        ids: t.Array(t.String()),
      }),
      detail: {
        summary: "批量删除首页展示卡片",
        description: "批量删除当前站点的首页展示卡片",
        tags: ["HeroCards"],
      },
    }
  )

  // 批量更新排序
  .patch(
    "/sort",
    async ({ body, currentSite, db }) => {
      const { items } = body;

      // 检查所有卡片是否属于当前站点
      const cards = await db.query.heroCardsTable.findMany({
        where: {
          id: { in: items.map((item) => item.id) },
          siteId: currentSite.id,
        },
        columns: { id: true },
      });

      if (cards.length !== items.length) {
        throw new HttpError.Forbidden("部分卡片不属于当前站点");
      }

      // 批量更新排序
      await db.transaction(async (tx) => {
        for (const item of items) {
          await tx
            .update(heroCardsTable)
            .set({ sortOrder: item.sortOrder })
            .where(eq(heroCardsTable.id, item.id));
        }
      });

      return { message: "排序更新成功" };
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

  // 切换卡片状态
  .patch(
    "/:id/toggle",
    async ({ params: { id }, currentSite, db }) => {
      const card = await db.query.heroCardsTable.findFirst({
        where: { id, siteId: currentSite.id },
      });

      if (!card) {
        throw new HttpError.NotFound("首页展示卡片不存在");
      }

      const [updatedCard] = await db
        .update(heroCardsTable)
        .set({ isActive: !card.isActive })
        .where(eq(heroCardsTable.id, id))
        .returning();

      return {
        message: `卡片已${updatedCard.isActive ? "启用" : "禁用"}`,
        isActive: updatedCard.isActive,
      };
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
    "/:id",
    ({ params, permissions, auth }) => {
      if (!permissions.includes("HEROCARDS_VIEW")) throw new Error("Forbidden");
      return heroCardsService.findOne(params.id, auth);
    },
    {
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "获取首页展示卡片详情",
        description: "获取指定首页展示卡片的详细信息",
        tags: ["HeroCards"],
      },
    }
  )

  .delete(
    "/:id",
    ({ params, permissions, auth }) => {
      if (!permissions.includes("HEROCARDS_DELETE"))
        throw new Error("Forbidden");
      return heroCardsService.delete(params.id, auth);
    },
    {
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "删除首页展示卡片",
        description: "删除指定的首页展示卡片（权限检查版）",
        tags: ["HeroCards"],
      },
    }
  );
