import { SiteConfigModel } from "@repo/contract";
import { siteConfigTable } from "@repo/contract/table";
import { and, asc, count, desc, eq, inArray, like, or } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { db, dbPlugin } from "@/server/db/connection";
import { localeMiddleware } from "@/server/plugins/locale";
import { commonRes } from "@/server/utils/Res";
import type { SupportedLocale } from "@/server/plugins/locale";
import { TranslateService } from "../translations/translate.service";

// 获取配置列表 - 使用原生 Drizzle 查询实现分页
async function getList({
  page = 1,
  limit = 10,
  sort = "createdAt",
  sortOrder = "desc",
  search,
  category,
  key,
  visible,
}: SiteConfigModel["ListQuery"]) {
  // 构建查询条件
  const conditions = [];

  // 处理搜索条件
  if (search) {
    conditions.push(
      or(
        { key: { like: `%${search}%` } },
        { description: { like: `%${search}%` } },
        { value: { like: `%${search}%` } }
      )
    );
  }

  // 处理分类过滤
  if (category) {
    conditions.push({ category });
  }

  // 处理键名过滤
  if (key) {
    conditions.push({ key: { like: `%${key}%` } });
  }

  // 处理可见性过滤
  if (visible !== undefined) {
    conditions.push({ visible: Boolean(visible) });
  }

  // 安全地处理排序字段
  const validSortKeys = [
    "id",
    "key",
    "category",
    "visible",
    "translatable",
    "createdAt",
    "updatedAt",
  ] as const;
  type SortKey = (typeof validSortKeys)[number];

  const safeSort = (
    validSortKeys.includes(sort as any) ? sort : "createdAt"
  ) as SortKey;

  // 组合所有条件
  const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

  // 执行查询
  const data = await db.query.siteConfigTable.findMany({
    where: whereCondition,
    orderBy: sortOrder === "desc"
      ? { [safeSort]: "desc" }
      : { [safeSort]: "asc" },
    limit,
    offset: (page - 1) * limit,
  });

  // 获取总数
  const totalResult = await db
    .select({ count: count() })
    .from(siteConfigTable)
    .where(whereCondition);

  const total = totalResult[0]?.count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    items: data,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

// 获取所有配置（不分页）
async function getAll({ category, visible }: SiteConfigModel["ListQuery"]) {
  // 构建条件
  const conditions = [];

  if (category) {
    conditions.push({ category });
  }

  if (visible !== undefined) {
    conditions.push({ visible: Boolean(visible) });
  }

  const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

  return await db.query.siteConfigTable.findMany({
    where: whereCondition,
    orderBy: [
      { category: "asc" },
      { key: "asc" }
    ],
  });
}

// 初始化翻译服务
let translateServiceInstance: TranslateService | null = null;
async function initTranslateService() {
  if (!translateServiceInstance) {
    translateServiceInstance = await TranslateService.create();
  }
}

// 根据分类获取配置
async function getByCategory(category: string, locale?: SupportedLocale) {
  // 初始化翻译服务
  await initTranslateService();

  const configs = await db.query.siteConfigTable.findMany({
    where: { category },
    orderBy: { key: "asc" },
  });

  // 如果需要翻译且翻译服务可用
  if (locale && locale !== "zh-CN" && translateServiceInstance) {
    const translatedConfigs = [];

    for (const config of configs) {
      // 只翻译标记为可翻译且可见的配置项
      if (config.translatable && config.visible) {
        const translatedValue = await translateServiceInstance.translate(
          config.value,
          "zh-CN",
          locale
        );

        translatedConfigs.push({
          ...config,
          value: translatedValue,
          originalValue: config.value, // 保留原文
        });
      } else {
        translatedConfigs.push(config);
      }
    }

    return translatedConfigs;
  }

  // 过滤掉不可见的配置项
  return configs.filter((config) => config.visible);
}

// 根据键名数组获取配置
async function getByKeys(keys: string[]) {
  if (keys.length === 0) {
    return [];
  }

  return await db.query.siteConfigTable.findMany({
    where: { key: { in: keys } },
    orderBy: { key: "asc" },
  });
}

// 根据 ID 获取单个配置
async function getById(id: string) {
  const result = await db.query.siteConfigTable.findFirst({
    where: { id },
  });

  if (!result) {
    throw new HttpError.NotFound(`配置 ID ${id} 不存在`);
  }

  return result;
}

// 创建新配置
async function create(data: SiteConfigModel["Create"]) {
  const result = await db.insert(siteConfigTable).values(data).returning();

  if (!result[0]) {
    throw new HttpError.BadRequest("创建配置失败");
  }
  return result[0];
}

// 根据 ID 更新配置
async function updateById(id: string, data: SiteConfigModel["Update"]) {
  const result = await db
    .update(siteConfigTable)
    .set(data)
    .where(eq(siteConfigTable.id, id))
    .returning();

  if (!result[0]) {
    throw new HttpError.NotFound(`配置 ID ${id} 不存在`);
  }

  return result[0];
}

// 批量更新配置（支持创建不存在的配置）
async function batchUpdate(updates: SiteConfigModel["BatchUpdate"]) {
  const results = [] as SiteConfigModel["Entity"][];

  // 使用事务处理批量更新
  await db.transaction(async (tx) => {
    for (const update of updates) {
      // 检查配置是否存在
      const existing = await tx.query.siteConfigTable.findFirst({
        where: { key: update.key },
        columns: { id: true },
      });

      if (existing) {
        // 更新现有配置
        const result = await tx
          .update(siteConfigTable)
          .set({
            value: update.value,
            updatedAt: new Date(),
          })
          .where(eq(siteConfigTable.key, update.key))
          .returning();

        if (result[0]) {
          results.push(result[0]);
        }
      } else {
        // 创建新配置
        const result = await tx
          .insert(siteConfigTable)
          .values({
            key: update.key,
            value: update.value,
            description: `自动创建的配置项: ${update.key}`,
            category: "site",
          })
          .returning();

        if (result[0]) {
          results.push(result[0]);
        }
      }
    }
  });

  return results;
}

// 根据ID删除配置
async function deleteById(id: string) {
  const result = await db
    .delete(siteConfigTable)
    .where(eq(siteConfigTable.id, id))
    .returning({ id: siteConfigTable.id });

  if (!result[0]) {
    throw new HttpError.NotFound(`配置 ID ${id} 不存在`);
  }

  return result[0];
}

// 批量删除配置
async function batchDelete(ids: string[]) {
  if (!ids || ids.length === 0) {
    return 0;
  }

  const result = await db
    .delete(siteConfigTable)
    .where(inArray(siteConfigTable.id, ids))
    .returning({ id: siteConfigTable.id });

  return result.length;
}

/**
 * 网站配置控制器
 * 处理网站配置相关的HTTP请求
 */
export const siteConfigsController = new Elysia({
  prefix: "/site-configs",
  tags: ["SiteConfigs"],
})
  .use(dbPlugin)
  .use(localeMiddleware)

  .get(
    "/list",
    async ({ query }) => {
      console.log("query:", query);
      const configs = await getList(query);
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
      const configs = await getAll(query);
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
      const config = await getById(id);
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
      const config = await getByKeys(keys);
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
      const config = await getByCategory(Category, locale);
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
      const config = await updateById(id, body);
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
      const config = await create(body);
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
      await deleteById(id);
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
      const result = await batchDelete(body.ids);
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