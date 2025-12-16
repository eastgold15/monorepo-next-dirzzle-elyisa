import { HeroCardsModel } from "@repo/contract";
import { heroCardsTable, mediaTable } from "@repo/contract/table";
import { and, desc, eq, inArray, like, or } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { db, dbPlugin } from "@/server/db/connection";
import { localeMiddleware } from "@/server/plugins/locale";
import { commonRes } from "@/server/utils/Res";
import type { SupportedLocale } from "@/server/plugins/locale";
import { translateService } from "../translations/translate.service";

// 根据ID获取卡卡片详情
async function getById(id: string) {
  const result = await db.query.heroCardsTable.findFirst({
    where: { id },
  });
  return result;
}

// 批量删除卡片
async function deleteBatchWithIds(ids: string[]) {
  if (ids.length === 0) {
    return;
  }
  // 直接批量删除，无需先查
  await db.delete(heroCardsTable).where(inArray(heroCardsTable.id, ids));
}

// 获取首页展示卡片列表（分页）
async function getHeroCardsList(
  params: HeroCardsModel["ListQuery"]
) {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "sortOrder",
      sortOrder = "asc",
      search,
      isActive,
    } = params;

    // 构建查询条件 - 使用新的对象语法
    const whereCondition: any = {};

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
      where: Object.keys(whereCondition).length > 0 ? whereCondition : undefined,
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
        const orderColumn = table[sort as keyof typeof table] || table.sortOrder;
        return sortOrder === "desc" ? desc(orderColumn) : asc(orderColumn);
      },
      limit,
      offset: (page - 1) * limit,
    });

    // 获取总数
    const totalCountResult = await db
      .select({ count: heroCardsTable.id })
      .from(heroCardsTable)
      .where(Object.keys(whereCondition).length > 0 ? whereCondition : undefined);

    const total = totalCountResult.length;

    return {
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
    };
  } catch (error) {
    console.error("获取首页展示卡片列表失败:", error);
    throw new Error("获取首页展示卡片列表失败");
  }
}

// 获取启用的首页展示卡片列表（用于前端展示）
async function getActiveHeroCards(locale: SupportedLocale = "zh-CN") {
  try {
    const cards = await db.query.heroCardsTable.findMany({
      where: { isActive: true },
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

    // 翻译卡片内容
    const translatedCards = await Promise.all(
      cards.map(async (card) => {
        const [translatedTitle, translatedDescription, translatedButtonText] =
          await Promise.all([
            card.title
              ? translateService.translate(
                  card.title,
                  "zh-CN",
                  locale === "en-US" ? "en-US" : "zh-CN"
                )
              : Promise.resolve(card.title),
            card.description
              ? translateService.translate(
                  card.description,
                  "zh-CN",
                  locale === "en-US" ? "en-US" : "zh-CN"
                )
              : Promise.resolve(card.description),
            card.buttonText
              ? translateService.translate(
                  card.buttonText,
                  "zh-CN",
                  locale === "en-US" ? "en-US" : "zh-CN"
                )
              : Promise.resolve(card.buttonText),
          ]);

        return {
          ...card,
          title: translatedTitle,
          description: translatedDescription,
          buttonText: translatedButtonText,
        };
      })
    );

    return translatedCards;
  } catch (error) {
    console.error("获取启用的首页展示卡片失败:", error);
    throw new Error("获取启用的首页展示卡片失败");
  }
}

// 根据ID获取首页展示卡片详情
async function getHeroCardById(id: string, locale: SupportedLocale = "zh-CN") {
  const heroCard = await db.query.heroCardsTable.findFirst({
    where: { id },
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
  });

  if (!heroCard) {
    throw new HttpError.NotFound("首页展示卡片不存在");
  }

  // 翻译卡片内容（仅在英文环境下翻译）
  if (locale === "en-US") {
    const [translatedTitle, translatedDescription, translatedButtonText] =
      await Promise.all([
        heroCard.title
          ? translateService.translate(heroCard.title, "zh-CN", "en-US")
          : Promise.resolve(heroCard.title),
        heroCard.description
          ? translateService.translate(heroCard.description, "zh-CN", "en-US")
          : Promise.resolve(heroCard.description),
        heroCard.buttonText
          ? translateService.translate(heroCard.buttonText, "zh-CN", "en-US")
          : Promise.resolve(heroCard.buttonText),
      ]);

    return {
      ...heroCard,
      title: translatedTitle,
      description: translatedDescription,
      buttonText: translatedButtonText,
    };
  }

  return heroCard;
}

// 创建首页展示卡片
async function createHeroCard(data: HeroCardsModel["Create"]) {
  // 设置默认值
  const heroCardData = {
    ...data,
    sortOrder: data.sortOrder ?? 0,
    isActive: data.isActive ?? true,
    backgroundClass: data.backgroundClass ?? "bg-blue-50",
    imageId: Array.isArray(data.imageId) ? data.imageId[0] : data.imageId,
  };

  const [newCard] = await db
    .insert(heroCardsTable)
    .values(heroCardData)
    .returning();

  if (!newCard) {
    throw new Error("创建首页展示卡片失败");
  }
  return newCard;
}

// 更新首页展示卡片
async function updateHeroCard(id: string, data: HeroCardsModel["Update"]) {
  try {
    // 准备更新数据
    const updateData = {
      ...data,
      imageId: data.imageId,
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
  } catch (error) {
    console.error("更新首页展示卡片失败:", error);
    throw error;
  }
}

// 删除首页展示卡片
async function deleteHeroCard(id: string) {
  try {
    const result = await db
      .delete(heroCardsTable)
      .where(eq(heroCardsTable.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error("首页展示卡片不存在");
    }

    return result[0];
  } catch (error) {
    console.error("删除首页展示卡片失败:", error);
    throw error;
  }
}

/**
 * 首页展示卡片控制器
 * 处理首页展示卡片相关的HTTP请求
 */
export const HeroCardsController = new Elysia({
  prefix: "/hero-cards",
})
  .use(dbPlugin)
  .use(localeMiddleware)
  // 获取首页展示卡片列表 - RESTful标准设计，支持搜索和筛选
  .get(
    "/",
    async ({ query }) => {
      // 默认返回分页首页展示卡片列表
      const result = await getHeroCardsList(query);
      return commonRes(result);
    },
    {
      query: HeroCardsModel.ListQuery,
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
    async ({ locale }) => {
      const result = await getActiveHeroCards(locale);
      return commonRes(result);
    },
    {
      detail: {
        summary: "获取启用的首页展示卡片",
        description:
          "获取所有启用状态的首页展示卡片，按排序顺序排列，用于前端展示。支持多语言翻译",
        tags: ["Hero Cards"],
      },
    }
  )

  // 根据ID获取首页展示卡片详情
  .get(
    "/:id",
    async ({ params: { id }, locale }) => {
      const heroCard = await getHeroCardById(id, locale);
      return commonRes(heroCard);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: "获取首页展示卡片详情",
        description: "根据ID获取首页展示卡片详细信息，支持多语言翻译",
        tags: ["Hero Cards"],
      },
    }
  )

  // 创建首页展示卡片
  .post(
    "/",
    async ({ body }) => {
      const heroCard = await createHeroCard(body);
      return commonRes(heroCard, 201);
    },
    {
      body: HeroCardsModel.Create,
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
    async ({ params: { id }, body }) => {
      const heroCard = await updateHeroCard(id, body);
      return commonRes(heroCard);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: HeroCardsModel.Update,
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
    async ({ params: { id } }) => {
      const heroCard = await deleteHeroCard(id);
      return commonRes(heroCard);
    },
    {
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

  // 批量删除图片
  .delete(
    "/batch",
    async ({ body: { ids } }) => {
      await deleteBatchWithIds(ids);
      return commonRes(null, 204, `成功删除 ${ids.length} 张图片`);
    },
    {
      body: HeroCardsModel.BatchDelete,
      detail: {
        summary: "批量删除图片",
        description: "批量删除多个图片记录和文件",
      },
    }
  );