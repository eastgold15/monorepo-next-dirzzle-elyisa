import { SiteConfigModel } from "@repo/contract";
import { Elysia, t } from "elysia";
import { localeMiddleware } from "@/server/plugins/locale";
import { commonRes } from "@/server/utils/Res";
import { SiteConfigsService } from "./site-config.service";

/**
 * 网站配置控制器
 * 处理网站配置相关的HTTP请求
 */
export const siteConfigsController = new Elysia({
  prefix: "/site-configs",
  tags: ["SiteConfigs"],
})
  .use(localeMiddleware)

  .get(
    "/list",
    async ({ query }) => {
      console.log("query:", query);
      const configs = await SiteConfigsService.getList(query);
      return commonRes(configs, 200, "获取配置成功");
    },
    {
      query: SiteConfigModel.ListQuery,
      detail: {
        summary: "获取配置列表",
        description: "分页获取网站配置列表，支持搜索、分类筛选和排序",
        tags: ["网站配置管理"],
      },
    }
  )
  .get(
    "/all",
    async ({ query }) => {
      const configs = await SiteConfigsService.getAll(query);
      return commonRes(configs, 200, "获取配置成功");
    },
    {
      query: SiteConfigModel.ListQuery,
      detail: {
        summary: "获取所有配置",
        description: "获取所有网站配置，支持按分类筛选",
        tags: ["网站配置管理"],
      },
    }
  )
  .get(
    "/:id",
    async ({ params: { id } }) => {
      const config = await SiteConfigsService.getById(id);
      return commonRes(config, 200, "获取详细配置成功");
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: "获取配置详情",
        description: "根据ID获取网站配置的详细信息",
        tags: ["网站配置管理"],
      },
    }
  )

  .get(
    "/keys",
    async ({ query: { keys } }) => {
      const config = await SiteConfigsService.getByKeys(keys);
      return commonRes(config, 200, "获取分类配置成功");
    },
    {
      query: t.Object({
        keys: t.Array(t.String()),
      }),
      detail: {
        summary: "根据键名获取配置",
        description: "根据键名数组批量获取网站配置",
        tags: ["网站配置管理"],
      },
    }
  )

  // 获取分类配置
  .get(
    "/Category/:Category",
    async ({ params: { Category }, locale }) => {
      const config = await SiteConfigsService.getByCategory(Category, locale);
      return commonRes(config, 200, "获取分类配置成功");
    },
    {
      params: t.Object({
        Category: t.String(),
      }),
      detail: {
        summary: "获取分类配置",
        description: "根据分类获取网站配置",
        tags: ["网站配置管理"],
      },
    }
  )

  .put(
    "/:id",
    async ({ params: { id }, body }) => {
      const config = await SiteConfigsService.updateById(id, body);
      return commonRes(config, 200, "更新配置成功");
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: SiteConfigModel.Update,
      detail: {
        summary: "更新配置",
        description: "根据ID更新网站配置信息",
        tags: ["网站配置管理"],
      },
    }
  )

  .post(
    "/",
    async ({ body }) => {
      const config = await SiteConfigsService.create(body);
      return commonRes(config, 201, "创建配置成功");
    },
    {
      body: SiteConfigModel.Create,
      detail: {
        summary: "创建配置",
        description: "创建新的网站配置",
        tags: ["网站配置管理"],
      },
    }
  )

  .delete(
    "/:id",
    async ({ params: { id } }) => {
      await SiteConfigsService.deleteById(id);
      return commonRes(null, 204, "删除配置成功");
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: "删除配置",
        description: "根据ID删除网站配置",
        tags: ["网站配置管理"],
      },
    }
  )

  .delete(
    "/batch",
    async ({ body }) => {
      const result = await SiteConfigsService.batchDelete(body.ids);
      return commonRes(null, 204, `成功删除 ${result} 个配置项`);
    },
    {
      body: t.Object({
        ids: t.Array(t.String()),
      }),
      detail: {
        summary: "批量删除配置",
        description: "根据ID列表批量删除网站配置",
        tags: ["网站配置管理"],
      },
    }
  );
