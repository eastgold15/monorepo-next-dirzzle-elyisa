import type { SiteConfigModel } from "@repo/contract";
import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  inArray,
  like,
  or,
} from "drizzle-orm";
import { HttpError } from "elysia-http-problem-json";
import { db } from "@/server/db/connection";
import { siteConfigTable } from "@/server/db/schema";
import type { SupportedLocale } from "@/server/plugins/locale";
import { TranslateService } from "../translations/translate.service";

/**
 * 网站配置服务对象
 * 处理网站配置相关的业务逻辑
 */
export const SiteConfigsService = {
  columns: getTableColumns(siteConfigTable),
  translateService: null as TranslateService | null,

  // 初始化翻译服务
  async initTranslateService() {
    if (!this.translateService) {
      this.translateService = await TranslateService.create();
    }
  },

  /**
   * 获取配置列表 - 使用原生 Drizzle 查询实现分页
   * @param params 查询参数
   * @returns 分页的配置列表
   */
  async getList({
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
          like(siteConfigTable.key, `%${search}%`),
          like(siteConfigTable.description, `%${search}%`),
          like(siteConfigTable.value, `%${search}%`)
        )
      );
    }

    // 处理分类过滤 - 现在是字符串
    if (category) {
      conditions.push(eq(siteConfigTable.category, category));
    }

    // 处理键名过滤
    if (key) {
      conditions.push(like(siteConfigTable.key, `%${key}%`));
    }

    // 处理可见性过滤
    if (visible !== undefined) {
      console.log(" Boolean(visible):", Boolean(visible));
      conditions.push(eq(siteConfigTable.visible, Boolean(visible)));
    }

    // 构建排序、
    // 安全地处理排序字段（防止注入或无效字段）
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
    const query = db.select().from(siteConfigTable).$dynamic();

    // 应用所有条件
    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    query
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy(
        sortOrder === "desc"
          ? desc(siteConfigTable[safeSort])
          : asc(siteConfigTable[safeSort])
      );

    // 执行查询
    const [data, totalResult] = await Promise.all([
      query,
      db
        .select({ count: count() })
        .from(siteConfigTable)
        .where(conditions.length > 0 ? conditions[0] : undefined),
    ]);

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
  },

  /**
   * 获取所有配置（不分页）
   * @param params 查询参数
   * @returns 配置列表
   */
  async getAll({ category, visible }: SiteConfigModel["ListQuery"]) {
    const query = db
      .select(this.columns)
      .from(siteConfigTable)
      .orderBy(asc(siteConfigTable.category), asc(siteConfigTable.key));

    // 构建条件
    const conditions = [];

    if (category) {
      conditions.push(eq(siteConfigTable.category, category));
    }

    if (visible !== undefined) {
      conditions.push(eq(siteConfigTable.visible, Boolean(visible)));
    }

    // 应用条件
    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    return await query;
  },

  /**
   * 根据分类获取配置
   * @param category 分类名称
   * @param locale 语言代码（可选）
   * @returns 该分类下的所有配置
   */
  async getByCategory(category: string, locale?: SupportedLocale) {
    // 初始化翻译服务
    await this.initTranslateService();

    const configs = await db
      .select(this.columns)
      .from(siteConfigTable)
      .where(eq(siteConfigTable.category, category))
      .orderBy(asc(siteConfigTable.key));

    // 如果需要翻译且翻译服务可用
    if (locale && locale !== "zh-CN" && this.translateService) {
      const translatedConfigs = [];

      for (const config of configs) {
        // 只翻译标记为可翻译且可见的配置项
        if (config.translatable && config.visible) {
          const translatedValue = await this.translateService.translate(
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
  },

  /**
   * 根据键名数组获取配置
   * @param keys 键名数组
   * @returns 对应的配置列表
   */
  async getByKeys(keys: string[]) {
    if (keys.length === 0) {
      return [];
    }
    return await db
      .select(this.columns)
      .from(siteConfigTable)
      .where(inArray(siteConfigTable.key, keys))
      .orderBy(asc(siteConfigTable.key));
  },

  /**
   * 根据 ID 获取单个配置
   * @param id 配置 ID
   * @returns 配置对象
   * @throws NotFoundError 当配置不存在时
   */
  async getById(id: string) {
    const result = await db
      .select(this.columns)
      .from(siteConfigTable)
      .where(eq(siteConfigTable.id, id))
      .limit(1);

    if (!result[0]) {
      throw new HttpError.NotFound(`配置 ID ${id} 不存在`);
    }

    return result[0];
  },

  /**
   * 创建新配置
   * @param data 配置数据
   * @returns 创建的配置对象
   */
  async create(data: SiteConfigModel["Create"]) {
    const result = await db
      .insert(siteConfigTable)
      .values(data)
      .returning(this.columns);

    if (!result[0]) {
      throw new HttpError.BadRequest("创建配置失败");
    }
    return result[0];
  },
  /**
   * 根据 ID 更新配置
   * @param id 配置 ID
   * @param data 更新数据
   * @returns 更新后的配置对象
   * @throws NotFoundError 当配置不存在时
   */
  async updateById(id: string, data: SiteConfigModel["Update"]) {
    const result = await db
      .update(siteConfigTable)
      .set(data)
      .where(eq(siteConfigTable.id, id))
      .returning(this.columns);

    if (!result[0]) {
      throw new HttpError.NotFound(`配置 ID ${id} 不存在`);
    }

    return result[0];
  },

  /**
   * 批量更新配置（支持创建不存在的配置）
   * @param updates 批量更新数据
   * @returns 更新后的配置列表
   */
  async batchUpdate(updates: SiteConfigModel["BatchUpdate"]) {
    const results = [] as SiteConfigModel["Entity"][];

    // 使用事务处理批量更新
    await db.transaction(async (tx) => {
      for (const update of updates) {
        // 检查配置是否存在
        const existing = await tx
          .select({ id: siteConfigTable.id })
          .from(siteConfigTable)
          .where(eq(siteConfigTable.key, update.key))
          .limit(1);

        if (existing[0]) {
          // 更新现有配置
          const [result] = await tx
            .update(siteConfigTable)
            .set({
              value: update.value,
              updatedAt: new Date(),
            })
            .where(eq(siteConfigTable.key, update.key))
            .returning(this.columns);

          if (result) {
            results.push(result);
          }
        } else {
          // 创建新配置
          const [result] = await tx
            .insert(siteConfigTable)
            .values({
              key: update.key,
              value: update.value,
              description: `自动创建的配置项: ${update.key}`,
              category: "site",
            })
            .returning(this.columns);

          if (result) {
            results.push(result);
          }
        }
      }
    });

    return results;
  },

  /**
   * 根据ID删除配置
   * @param id 配置ID
   */
  async deleteById(id: string) {
    const result = await db
      .delete(siteConfigTable)
      .where(eq(siteConfigTable.id, id))
      .returning({ id: siteConfigTable.id });

    if (!result[0]) {
      throw new HttpError.NotFound(`配置 ID ${id} 不存在`);
    }

    return result[0];
  },

  /**
   * 批量删除配置
   * @param ids 配置ID数组
   * @returns 删除的数量
   */
  async batchDelete(ids: string[]) {
    if (!ids || ids.length === 0) {
      return 0;
    }
    const result = await db
      .delete(siteConfigTable)
      .where(inArray(siteConfigTable.id, ids))
      .returning({ id: siteConfigTable.id });

    return result.length;
  },
};
