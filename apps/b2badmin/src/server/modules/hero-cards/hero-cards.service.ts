import { and, eq, getColumns, inArray, like, or } from "drizzle-orm";
import { HttpError } from "elysia-http-problem-json";
import { db } from "@/server/db/connection";

import type { SupportedLocale } from "@/server/plugins/locale";
import type { PageData } from "@/server/utils/Res";
import { translateService } from "../translations/translate.service";
import { heroCardsTable } from "@repo/contract/table";

/**
 * 首页展示卡片服务对象
 * 处理首页展示卡片相关的业务逻辑
 */
export const HeroCardsService = {
  /**
   * 根据ID获取卡卡片详情
   */
  async getById(id: string) {
    const [result] = await db
      .select()
      .from(heroCardsTable)
      .where(eq(heroCardsTable.id, id))
      .limit(1);
    return result;
  },

  async deleteBatchWithIds(ids: string[]) {
    if (ids.length === 0) {
      return;
    }
    // 直接批量删除，无需先查
    await db.delete(heroCardsTable).where(inArray(heroCardsTable.id, ids));
  },

  columns: getColumns(heroCardsTable),

  /**
   * 获取首页展示卡片列表（分页）- 使用统一的分页函数
   */
  async getHeroCardsList(
    params: HeroCardsModel["ListQuery"]
  ): Promise<PageData<HeroCardsModel["Entity"]>> {
    try {
      const {
        page = 1,
        limit = 10,
        sort = "sortOrder",
        sortOrder = "asc",
        search,
        isActive,
      } = params;

      const { imageId: _image_id, ...rest } = HeroCardsService.columns;

      // 构建基础查询
      let baseQuery = db
        .select({
          url: mediaTable.url,
          media: {
            id: mediaTable.id,
            fileName: mediaTable.fileName,
            url: mediaTable.url,
            alt: mediaTable.alt,
          },
          ...rest,
        })
        .from(heroCardsTable)
        .leftJoin(mediaTable, eq(heroCardsTable.imageId, mediaTable.id))
        .$dynamic();

      // 搜索条件：支持标题和描述搜索
      const conditions = [];
      if (search) {
        conditions.push(
          or(
            like(heroCardsTable.title, `%${search}%`),
            like(heroCardsTable.description, `%${search}%`)
          )
        );
      }
      if (isActive !== undefined) {
        conditions.push(eq(heroCardsTable.isActive, isActive));
      }

      // 应用查询条件
      if (conditions.length > 0) {
        baseQuery = baseQuery.where(and(...conditions));
      }

      // 允许的排序字段
      const allowedSortFields = {
        title: heroCardsTable.title,
        sortOrder: heroCardsTable.sortOrder,
        createdAt: heroCardsTable.createdAt,
        updatedAt: heroCardsTable.updatedAt,
      };

      // 确定排序字段和方向
      const orderBy =
        allowedSortFields[sort as keyof typeof allowedSortFields] ||
        heroCardsTable.sortOrder;
      const orderDirection = sortOrder as "asc" | "desc";

      // ✅ 传入 transformItem 函数
      const result = await paginate(baseQuery, {
        page,
        limit,
        orderBy,
        orderDirection,
      });

      return {
        // @ts-expect-error
        items: result.items.map((item) => ({
          ...item,
          url: item.url || null,
          media: item.media || null,
        })),
        meta: buildPageMeta(result.total, page, limit),
      };
    } catch (error) {
      console.error("获取首页展示卡片列表失败:", error);
      throw new Error("获取首页展示卡片列表失败");
    }
  },

  /**
   * 获取启用的首页展示卡片列表（用于前端展示）
   */
  async getActiveHeroCards(locale: SupportedLocale = "zh-CN") {
    try {
      const cards = await db
        .select({
          id: heroCardsTable.id,
          title: heroCardsTable.title,
          description: heroCardsTable.description,
          buttonText: heroCardsTable.buttonText,
          buttonUrl: heroCardsTable.buttonUrl,
          backgroundClass: heroCardsTable.backgroundClass,
          url: mediaTable.url,
          media: {
            id: mediaTable.id,
            fileName: mediaTable.fileName,
            url: mediaTable.url,
            alt: mediaTable.alt,
          },
        })
        .from(heroCardsTable)
        .leftJoin(mediaTable, eq(heroCardsTable.imageId, mediaTable.id))
        .where(eq(heroCardsTable.isActive, true))
        .orderBy(heroCardsTable.sortOrder);

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
  },

  /**
   * 根据ID获取首页展示卡片详情
   */
  async getHeroCardById(id: string, locale: SupportedLocale = "zh-CN") {
    const [heroCard] = await db
      .select({
        ...HeroCardsService.columns,
        url: mediaTable.url,
        media: {
          id: mediaTable.id,
          fileName: mediaTable.fileName,
          url: mediaTable.url,
          alt: mediaTable.alt,
        },
      })
      .from(heroCardsTable)
      .leftJoin(mediaTable, eq(heroCardsTable.imageId, mediaTable.id))
      .where(eq(heroCardsTable.id, id))
      .limit(1);

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
  },

  /**
   * 创建首页展示卡片
   */
  async createHeroCard(data: HeroCardsModel["Create"]) {
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
  },

  /**
   * 更新首页展示卡片
   */
  async updateHeroCard(id: string, data: HeroCardsModel["Update"]) {
    try {
      // 准备更新数据，添加更新时间
      const updateData = {
        ...data,
        updatedAt: new Date(),
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
  },

  /**
   * 删除首页展示卡片
   */
  async deleteHeroCard(id: string) {
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
  },
};
