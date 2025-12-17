import { HeroCardsTModel } from "@repo/contract";
import { heroCardsTable } from "@repo/contract/table";
import { eq, inArray } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { db, dbPlugin } from "~/db/connection";
import { adminAuthPlugin } from "~/plugins/admin-auth.plugin";

/**
 * 首页展示卡片控制器
 * 处理首页展示卡片相关的HTTP请求
 */
export const HeroCardsController = new Elysia({
  prefix: "/hero-cards",
})
  .use(dbPlugin)
  .use(adminAuthPlugin)

  // 获取首页展示卡片列表 - 支持搜索和筛选
  .get(
    "/",
    async ({ query, currentSite }) => {
      const {
        sort = "sortOrder",
        sortOrder = "asc",
        isActive,
      } = query;

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
        orderBy: { sortOrder: sortOrder === "desc" ? "desc" : "asc" },
      });

      return heroCards.map((item) => ({
        ...item,
        url: item.media?.url || null,
      }));
    },
    {
      auth: true,
      query: HeroCardsTModel.ListQuery,
      detail: {
        summary: "获取首页展示卡片列表",
        description:
          "获取首页展示卡片列表，支持搜索和筛选。可以搜索标题和描述内容",
        tags: ["Hero Cards"],
      },
    }
  )

  // 创建首页展示卡片
  .post(
    "/",
    async ({ body, currentSite }) => {
      if (
        !body.mediaId ||
        (Array.isArray(body.mediaId) && body.mediaId.length === 0)
      ) {
        throw new HttpError.BadRequest("请上传图片");
      }

      // 设置默认值
      const heroCardData = {
        ...body,
        siteId: currentSite.id,
        sortOrder: body.sortOrder ?? 0,
        isActive: body.isActive ?? true,
        backgroundClass: body.backgroundClass ?? "bg-blue-50",
        mediaId: Array.isArray(body.mediaId) ? body.mediaId[0] : body.mediaId,
      };

      const [newCard] = await db
        .insert(heroCardsTable)
        .values(heroCardData)
        .returning();

      if (!newCard) {
        throw new Error("创建首页展示卡片失败");
      }

      return newCard;
    },
    {
      auth: true,
      body: HeroCardsTModel.Create,
      detail: {
        summary: "创建首页展示卡片",
        description: "创建新的首页展示卡片",
        tags: ["Hero Cards"],
      },
    }
  )

  // 更新首页展示卡片
  .put(
    "/:id",
    async ({ params: { id }, body, currentSite }) => {
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
        throw new Error("首页展示卡片不存在");
      }

      return result[0];
    },
    {
      auth: true,
      params: t.Object({
        id: t.String(),
      }),
      body: HeroCardsTModel.Update,
      detail: {
        summary: "更新首页展示卡片",
        description: "更新指定ID的首页展示卡片信息",
        tags: ["Hero Cards"],
      },
    }
  )

  // 删除首页展示卡片
  .delete(
    "/:id",
    async ({ params: { id }, currentSite }) => {
      // 先检查卡片是否属于当前站点
      const existingCard = await db.query.heroCardsTable.findFirst({
        where: { id },
      });

      if (!existingCard) {
        throw new HttpError.NotFound("首页展示卡片不存在");
      }

      if (existingCard.siteId !== currentSite.id) {
        throw new HttpError.Forbidden("无权删除该首页展示卡片");
      }

      const result = await db
        .delete(heroCardsTable)
        .where(eq(heroCardsTable.id, id))
        .returning();

      if (result.length === 0) {
        throw new Error("首页展示卡片不存在");
      }

      return result[0];
    },
    {
      auth: true,
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: "删除首页展示卡片",
        description: "删除指定ID的首页展示卡片",
        tags: ["Hero Cards"],
      },
    }
  )

  // 批量删除首页展示卡片
  .delete(
    "/batch",
    async ({ body: { ids }, currentSite }) => {
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
      };
    },
    {
      auth: true,
      body: HeroCardsTModel.BatchDelete,
      detail: {
        summary: "批量删除首页展示卡片",
        description: "批量删除多个首页展示卡片",
      },
    }
  );
