import { HeroCardsTModel } from "@repo/contract";
import { heroCardsTable } from "@repo/contract/table";
import { and, desc, eq, inArray, or } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { db, dbPlugin } from "~/db/connection";
import { adminAuthPlugin } from "~/plugins/admin-auth.plugin";
import { localeMiddleware } from "~/plugins/locale";
import { commonRes } from "~/utils/Res";

/**
 * 首页展示卡片控制器
 * 处理首页展示卡片相关的HTTP请求
 */
export const HeroCardsController = new Elysia({
  prefix: "/hero-cards",
})
  .use(dbPlugin)
  .use(adminAuthPlugin)
  .use(localeMiddleware)

  // 获取首页展示卡片列表 - 支持分页、搜索和筛选
  .get(
    "/",
    async ({ query, currentSite }) => {
      const {
        page = 1,
        limit = 10,
        sort = "sortOrder",
        sortOrder = "asc",
        search,
        isActive,
      } = query;

      // 构建查询条件
      const whereCondition: any = {
        siteId: currentSite.id,
      };

      if (search || isActive !== undefined) {
        const conditions: any[] = [];

        if (search) {
          conditions.push(
            or(
              { title: { like: `%${search}%` } },
              { description: { like: `%${search}%` } }
            )
          );
        }
        if (isActive !== undefined) {
          conditions.push({ isActive });
        }

        if (conditions.length === 1) {
          Object.assign(whereCondition, conditions[0]);
        } else if (conditions.length > 1) {
          Object.assign(whereCondition, and(...conditions));
        }
      }

      // 使用关系查询
      const heroCards = await db.query.heroCardsTable.findMany({
        where:
          Object.keys(whereCondition).length > 0 ? whereCondition : undefined,
        with: {
          media: {
            columns: {
              id: true,
              fileName: true,
              url: true,
              alt: true,
            },
          },
        },
        orderBy: (table, { asc }) => {
          const orderColumn =
            table[sort as keyof typeof table] || table.sortOrder;
          return sortOrder === "desc" ? desc(orderColumn) : asc(orderColumn);
        },
        limit,
        offset: (page - 1) * limit,
      });

      // 获取总数
      const totalCountResult = await db
        .select({ count: heroCardsTable.id })
        .from(heroCardsTable)
        .where(
          Object.keys(whereCondition).length > 0 ? whereCondition : undefined
        );

      const total = totalCountResult.length;

      return commonRes({
        items: heroCards.map((item) => ({
          ...item,
          url: item.media?.url || null,
        })),
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    },
    {
      auth: true,
      query: HeroCardsTModel.ListQuery,
      detail: {
        summary: "获取首页展示卡片列表",
        description:
          "获取首页展示卡片列表，支持分页、搜索和筛选。可以搜索标题和描述内容",
        tags: ["Hero Cards"],
      },
    }
  )

  // 获取启用的首页展示卡片（用于前端展示）
  .get(
    "/active",
    async ({ currentSite }) => {
      const cards = await db.query.heroCardsTable.findMany({
        where: {
          siteId: currentSite.id,
          isActive: true,
        },
        with: {
          media: {
            columns: {
              id: true,
              fileName: true,
              url: true,
              alt: true,
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      });

      return commonRes(
        cards.map((item) => ({
          ...item,
          url: item.media?.url || null,
        }))
      );
    },
    {
      // 这个接口不需要认证，用于前端展示
      detail: {
        summary: "获取启用的首页展示卡片",
        description:
          "获取所有启用状态的首页展示卡片，按排序顺序排列，用于前端展示",
        tags: ["Hero Cards"],
      },
    }
  )

  // 创建首页展示卡片
  .post(
    "/",
    async ({ body, currentSite }) => {
      if (!body.imageId || (Array.isArray(body.imageId) && body.imageId.length === 0)) {
        throw new HttpError.BadRequest("请上传图片");
      }

      // 设置默认值
      const heroCardData = {
        ...body,
        siteId: currentSite.id,
        sortOrder: body.sortOrder ?? 0,
        isActive: body.isActive ?? true,
        backgroundClass: body.backgroundClass ?? "bg-blue-50",
        imageId: Array.isArray(body.imageId) ? body.imageId[0] : body.imageId,
      };

      const [newCard] = await db
        .insert(heroCardsTable)
        .values(heroCardData)
        .returning();

      if (!newCard) {
        throw new Error("创建首页展示卡片失败");
      }

      return commonRes(newCard, 201);
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
        imageId: body.imageId,
      };

      const result = await db
        .update(heroCardsTable)
        .set(updateData)
        .where(eq(heroCardsTable.id, id))
        .returning();

      if (result.length === 0) {
        throw new Error("首页展示卡片不存在");
      }

      return commonRes(result[0]);
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

      return commonRes(result[0]);
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
        return commonRes(null, 204, "没有选择要删除的卡片");
      }

      // 检查所有卡片是否属于当前站点
      const existingCards = await db.query.heroCardsTable.findMany({
        where: inArray(heroCardsTable.id, ids),
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

      return commonRes(null, 204, `成功删除 ${ids.length} 个首页展示卡片`);
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