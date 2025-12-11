import { HeroCardsModel } from "@repo/contract";
import { Elysia } from "elysia";
import { z } from "zod/v4";
import { localeMiddleware } from "@/server/plugins/locale";
import { commonRes } from "@/server/utils/Res";
import { HeroCardsService } from "./hero-cards.service";
/**
 * 首页展示卡片控制器
 * 处理首页展示卡片相关的HTTP请求
 */
export const HeroCardsController = new Elysia({
  prefix: "/hero-cards",
})
  .use(localeMiddleware)
  // 获取首页展示卡片列表 - RESTful标准设计，支持搜索和筛选
  .get(
    "/",
    async ({ query }) => {
      // 默认返回分页首页展示卡片列表
      const result = await HeroCardsService.getHeroCardsList(query);
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
      const result = await HeroCardsService.getActiveHeroCards(locale);
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
      const heroCard = await HeroCardsService.getHeroCardById(id, locale);
      return commonRes(heroCard);
    },
    {
      params: z.object({
        id: z.string(),
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
      const heroCard = await HeroCardsService.createHeroCard(body);
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
      const heroCard = await HeroCardsService.updateHeroCard(id, body);
      return commonRes(heroCard);
    },
    {
      params: z.object({
        id: z.string(),
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
      const heroCard = await HeroCardsService.deleteHeroCard(id);
      return commonRes(heroCard);
    },
    {
      params: z.object({
        id: z.string(),
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
      const result = await HeroCardsService.deleteBatchWithIds(ids);
      return commonRes(null, 204, `成功删除 ${result} 张图片`);
    },
    {
      body: HeroCardsModel.BatchDelete,
      detail: {
        summary: "批量删除图片",
        description: "批量删除多个图片记录和文件",
      },
    }
  );
