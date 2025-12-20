import { AdsContract, adsTable } from "@repo/contract";
import { eq, inArray } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";

export const adsController = new Elysia({ prefix: "/ads", tags: ["Ads"] })
  .use(authGuardMid)
  .use(dbPlugin)

  // 获取广告列表（包含业务逻辑）
  .get(
    "/",
    async ({ query, currentSite, db }) => {
      const { search, type, position, isActive } = query;

      // 使用关系查询
      const advertisements = await db.query.adsTable.findMany({
        where: {
          siteId: currentSite.id,
          ...(search && {
            title: { like: `%${search}%` },
          }),
          ...(type && {
            type,
          }),
          ...(position && {
            position,
          }),
          ...(isActive !== undefined &&
            isActive !== null && {
              isActive,
            }),
        },
        with: {
          media: {
            columns: {
              url: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
          sortOrder: "desc",
        },
      });

      // 格式化返回数据
      const formattedItems = advertisements.map((ad) => ({
        ...ad,
        imageUrl: ad.media?.url,
      }));

      return formattedItems;
    },
    {
      query: AdsContract.ListQuery,
      detail: {
        summary: "获取广告列表",
        description: "获取当前站点的广告列表，支持搜索、类型、位置等筛选条件",
        tags: ["Ads"],
      },
    }
  )

  // 创建广告（包含业务逻辑）
  .post(
    "/",
    async ({ body, currentSite, db }) => {
      // 设置默认值
      const advertisementData = {
        title: body.title.trim(),
        description: body.description.trim(),
        type: body.type || "banner",
        mediaId: body.mediaId,
        link: body.link || "#",
        position: body.position || "home-top",
        siteId: currentSite.id,
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        endDate: body.endDate ? new Date(body.endDate) : new Date(),
        sortOrder: body.sortOrder ?? 0,
        isActive: body.isActive ?? true,
      };

      const [newAd] = await db
        .insert(adsTable)
        .values(advertisementData)
        .returning();

      if (!newAd) {
        throw new HttpError.InternalServerError("创建广告失败");
      }

      return newAd;
    },
    {
      body: AdsContract.Create,
      detail: {
        summary: "创建广告",
        description: "创建新的广告，自动关联到当前站点",
        tags: ["Ads"],
      },
    }
  )

  // 更新广告（包含业务逻辑）
  .put(
    "/:id",
    async ({ params: { id }, body, currentSite, db }) => {
      // 先检查广告是否属于当前站点
      const existingAd = await db.query.adsTable.findFirst({
        where: { id },
      });

      if (!existingAd) {
        throw new HttpError.NotFound("广告不存在");
      }

      if (existingAd.siteId !== currentSite.id) {
        throw new HttpError.Forbidden("无权修改该广告");
      }

      const updateData: Partial<typeof adsTable.$inferInsert> = {
        ...body,
        mediaId: body.mediaId
          ? Array.isArray(body.mediaId)
            ? body.mediaId[0]
            : body.mediaId
          : undefined,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      };

      const result = await db
        .update(adsTable)
        .set(updateData)
        .where(eq(adsTable.id, id))
        .returning();

      if (result.length === 0) {
        throw new HttpError.NotFound("广告不存在");
      }

      return result[0];
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: AdsContract.Update,
      detail: {
        summary: "更新广告",
        description: "更新指定广告的信息，只能更新当前站点的广告",
        tags: ["Ads"],
      },
    }
  )

  // 批量删除广告（业务逻辑）
  .delete(
    "/batch",
    async ({ body: { ids }, currentSite, db }) => {
      // 检查所有广告是否属于当前站点
      const existingAds = await db.query.adsTable.findMany({
        where: {
          id: {
            in: ids,
          },
        },
        columns: { id: true, siteId: true },
      });

      const unauthorizedAds = existingAds.filter(
        (ad) => ad.siteId !== currentSite.id
      );
      if (unauthorizedAds.length > 0) {
        throw new HttpError.Forbidden("无权删除部分广告");
      }

      await db.delete(adsTable).where(inArray(adsTable.id, ids));
      return {
        message: `成功删除 ${ids.length} 个广告`,
        count: ids.length,
      };
    },
    {
      body: t.Object({
        ids: t.Array(t.String()),
      }),
      detail: {
        summary: "批量删除广告",
        description: "批量删除当前站点的广告",
        tags: ["Ads"],
      },
    }
  )

  // 批量更新排序
  .patch(
    "/sort",
    async ({ body, currentSite, db }) => {
      const { items } = body;

      // 检查所有广告是否属于当前站点
      const ads = await db.query.adsTable.findMany({
        where: {
          id: { in: items.map((item) => item.id) },
          siteId: currentSite.id,
        },
        columns: { id: true },
      });

      if (ads.length !== items.length) {
        throw new HttpError.Forbidden("部分广告不属于当前站点");
      }

      // 批量更新排序
      await db.transaction(async (tx) => {
        for (const item of items) {
          await tx
            .update(adsTable)
            .set({ sortOrder: item.sortOrder })
            .where(eq(adsTable.id, item.id));
        }
      });

      return { message: "排序更新成功" };
    },
    {
      body: t.Object({
        items: t.Array(
          t.Object({
            id: t.String(),
            sortOrder: t.Number(),
          })
        ),
      }),
      detail: {
        summary: "批量更新广告排序",
        description: "批量更新多个广告的排序值",
        tags: ["Ads"],
      },
    }
  )

  // 切换广告状态
  .patch(
    "/:id/toggle",
    async ({ params: { id }, currentSite, db }) => {
      const ad = await db.query.adsTable.findFirst({
        where: { id, siteId: currentSite.id },
      });

      if (!ad) {
        throw new HttpError.NotFound("广告不存在");
      }

      const [updatedAd] = await db
        .update(adsTable)
        .set({ isActive: !ad.isActive })
        .where(eq(adsTable.id, id))
        .returning();

      return {
        message: `广告已${updatedAd.isActive ? "启用" : "禁用"}`,
        isActive: updatedAd.isActive,
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: "切换广告状态",
        description: "启用或禁用指定的广告",
        tags: ["Ads"],
      },
    }
  )

  // 标准删除单个广告
  .delete(
    "/:id",
    async ({ params: { id }, currentSite, db, permissions }) => {
      if (!permissions.includes("ADS_DELETE")) {
        throw new HttpError.Forbidden("没有删除权限");
      }

      const existingAd = await db.query.adsTable.findFirst({
        where: { id },
      });

      if (!existingAd) {
        throw new HttpError.NotFound("广告不存在");
      }

      if (existingAd.siteId !== currentSite.id) {
        throw new HttpError.Forbidden("无权删除该广告");
      }

      const result = await db
        .delete(adsTable)
        .where(eq(adsTable.id, id))
        .returning();

      return { data: result[0] };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: "删除广告",
        description: "删除指定的广告（权限检查版）",
        tags: ["Ads"],
      },
    }
  );
