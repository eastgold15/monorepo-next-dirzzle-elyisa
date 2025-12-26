import { SiteConfigContract, siteConfigTable } from "@repo/contract";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";
import { siteConfigService } from "~/modules/index";

export const siteconfigController = new Elysia({
  prefix: "/siteconfig",
  tags: ["Site Config"],
})
  .use(authGuardMid)
  .use(dbPlugin)

  // 获取配置列表（包含业务逻辑）
  .get(
    "/list",
    async ({ query, auth, db }) => {
      const { data, total } = await siteConfigService.findAll(query, {
        db,
        auth,
      });
      return { data, total };
    },
    {
      query: SiteConfigContract.ListQuery,
      detail: {
        summary: "获取配置列表",
        description: "分页获取网站配置列表，支持搜索、分类筛选和排序",
        tags: ["Site Config"],
      },
    }
  )

  // 获取所有配置（不分页）
  .get(
    "/all",
    async ({ query, db }) => {
      const { category, visible } = query;

      // 构建条件
      const conditions = [];

      if (category) {
        conditions.push(eq(siteConfigTable.category, category));
      }

      if (visible !== undefined) {
        conditions.push(eq(siteConfigTable.visible, Boolean(visible)));
      }

      const whereCondition =
        conditions.length > 0 ? and(...conditions) : undefined;

      return await db
        .select()
        .from(siteConfigTable)
        .$dynamic()
        .where(whereCondition)
        .orderBy(desc(siteConfigTable.category), desc(siteConfigTable.key));
    },
    {
      query: SiteConfigContract.ListQuery,
      detail: {
        summary: "获取所有配置",
        description: "获取所有网站配置，支持按分类筛选",
        tags: ["Site Config"],
      },
    }
  )

  // 根据分类获取配置
  .get(
    "/category/:category",
    async ({ params: { category }, db }) => {
      const configs = await db
        .select()
        .from(siteConfigTable)
        .where(eq(siteConfigTable.category, category))
        .orderBy(sql`${siteConfigTable.key} asc`);

      // 过滤掉不可见的配置项（公开访问时）
      return configs.filter((config) => config.visible);
    },
    {
      params: t.Object({
        category: t.String(),
      }),
      detail: {
        summary: "获取分类配置",
        description: "根据分类获取网站配置",
        tags: ["Site Config"],
      },
    }
  )

  // 根据键名数组获取配置
  .get(
    "/keys",
    async ({ query: { keys }, db }) => {
      if (!keys || keys.length === 0) {
        return [];
      }

      return await db
        .select()
        .from(siteConfigTable)
        .where(inArray(siteConfigTable.key, keys))
        .orderBy(sql`${siteConfigTable.key} asc`);
    },
    {
      query: t.Object({
        keys: t.Array(t.String()),
      }),
      detail: {
        summary: "根据键名获取配置",
        description: "根据键名数组批量获取网站配置",
        tags: ["Site Config"],
      },
    }
  )

  // 批量更新配置
  .post(
    "/batch/update",
    async ({ body, db, currentSite }) => {
      const results: (typeof siteConfigTable.$inferSelect)[] = [];

      // 使用事务处理批量更新
      await db.transaction(async (tx) => {
        for (const update of body.items) {
          // 检查配置是否存在
          const [existing] = await tx
            .select({ id: siteConfigTable.id })
            .from(siteConfigTable)
            .where(eq(siteConfigTable.key, update.key));

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
                siteId: currentSite.id,
                visible: true,
              })
              .returning();

            if (result[0]) {
              results.push(result[0]);
            }
          }
        }
      });

      return {
        data: results,
        message: `成功更新 ${results.length} 个配置项`,
      };
    },
    {
      body: t.Object({
        items: t.Array(
          t.Object({
            key: t.String(),
            value: t.String(),
          })
        ),
      }),
      detail: {
        summary: "批量更新配置",
        description: "批量更新多个配置项，支持自动创建不存在的配置",
        tags: ["Site Config"],
      },
    }
  )

  // 获取配置详情
  .get(
    "/:id",
    async ({ params: { id }, db }) => {
      const [config] = await db
        .select()
        .from(siteConfigTable)
        .where(eq(siteConfigTable.id, id));

      if (!config) {
        throw new HttpError.NotFound("配置不存在");
      }

      return { data: config };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: "获取配置详情",
        description: "根据ID获取网站配置的详细信息",
        tags: ["Site Config"],
      },
    }
  )

  .put(
    "/:id",
    ({ params, body, auth, db }) =>
      siteConfigService.update(params.id, body, { db, auth }),
    {
      allPermission: "SITECONFIG_EDIT",
      params: t.Object({ id: t.String() }),
      body: SiteConfigContract.Update,
      detail: {
        summary: "更新配置",
        description: "更新网站配置信息",
        tags: ["Site Config"],
      },
    }
  )

  // 批量删除配置
  .delete(
    "/batch",
    async ({ body, db, permissions }) => {
      if (!permissions.includes("SITECONFIG_DELETE")) {
        throw new HttpError.Forbidden("没有删除权限");
      }

      if (!body.ids || body.ids.length === 0) {
        return { count: 0 };
      }

      const result = await db
        .delete(siteConfigTable)
        .where(inArray(siteConfigTable.id, body.ids))
        .returning({ id: siteConfigTable.id });

      return {
        count: result.length,
        message: `成功删除 ${result.length} 个配置项`,
      };
    },
    {
      body: t.Object({
        ids: t.Array(t.String()),
      }),
      detail: {
        summary: "批量删除配置",
        description: "根据ID列表批量删除网站配置",
        tags: ["Site Config"],
      },
    }
  )

  .delete(
    "/:id",
    ({ params, permissions, auth, db }) =>
      siteConfigService.delete(params.id, { db, auth }),
    {
      allPermission: "SITECONFIG_DELETE",
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "删除配置",
        description: "删除指定的网站配置",
        tags: ["Site Config"],
      },
    }
  );
