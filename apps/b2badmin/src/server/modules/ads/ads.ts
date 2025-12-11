import { AdsModel } from "@repo/contract";
import { Elysia, t } from "elysia";
import { commonRes } from "@/server/utils/Res";
import { AdsService } from "./ads.service";

/**
 * 广告控制器
 * 处理广告相关的HTTP请求
 */
export const AdsController = new Elysia({
  prefix: "/advertisements",
})
  // 获取广告列表 - RESTful标准设计，支持类型筛选
  .get(
    "/",
    async ({ query }) => {
      // 默认返回分页广告列表
      const result = await AdsService.getAdvertisementList(query);
      return commonRes(result);
    },
    {
      query: AdsModel.ListQuery,
      detail: {
        summary: "获取广告列表",
        description:
          "获取广告列表，支持分页、搜索和筛选。使用type=banner获取Banner广告，type=carousel获取轮播图广告",
        tags: ["Advertisements"],
      },
    }
  )

  // 根据ID获取广告详情
  .get(
    "/:id",
    async ({ params: { id } }) => {
      const advertisement = await AdsService.getAdvertisementById(id);
      return commonRes(advertisement);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: "获取广告详情",
        description: "根据ID获取广告详细信息",
        tags: ["Advertisements"],
      },
    }
  )

  // 创建广告
  .post(
    "/",
    async ({ body }) => {
      const advertisement = await AdsService.createAdvertisement(body);
      return commonRes(advertisement, 201);
    },
    {
      body: AdsModel.Create,
      detail: {
        summary: "创建广告",
        description: "创建新的广告",
        tags: ["Advertisements"],
      },
    }
  )

  // 更新广告
  .put(
    "/:id",
    async ({ params: { id }, body }) => {
      const advertisement = await AdsService.updateAdvertisement(id, body);
      return commonRes(advertisement);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: AdsModel.Update,
      detail: {
        summary: "更新广告",
        description: "更新指定ID的广告信息",
        tags: ["Advertisements"],
      },
    }
  )

  // 删除广告
  .delete(
    "/:id",
    async ({ params: { id } }) => {
      const advertisement = await AdsService.deleteAdvertisement(id);
      return commonRes(advertisement);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: "删除广告",
        description: "删除指定ID的广告",
        tags: ["Advertisements"],
      },
    }
  )

  .delete(
    "/batchDel",
    async ({ body }) => {
      const advertisement = await AdsService.batchDeleteAdvertisement(body.ids);
      return commonRes(advertisement);
    },
    {
      body: t.Object({
        ids: t.Array(t.String()),
      }),
      detail: {
        summary: "批量删除广告",
        description: "批量删除指定ID的广告",
        tags: ["Advertisements"],
      },
    }
  )

  // 获取当前时间段的轮播图广告
  .get(
    "/carousel/current",
    async () => {
      const advertisements = await AdsService.getCurrentCarouselAds();
      return commonRes(advertisements);
    },
    {
      detail: {
        summary: "获取当前轮播图广告",
        description: "获取当前时间段内有效的轮播图广告，用于首页展示",
        tags: ["Advertisements"],
      },
    }
  );
