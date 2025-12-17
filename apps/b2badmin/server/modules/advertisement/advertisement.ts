import { AdsTModel } from "@repo/contract";
import { adsTable } from "@repo/contract/table";
import { and, count, eq, inArray, like } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { db, dbPlugin } from "~/db/connection";
import { adminAuthPlugin } from "~/plugins/admin-auth.plugin";
import { commonRes } from "~/utils/Res";

/**
 * 广告控制器
 * 处理广告相关的HTTP请求
 */
export const AdsController = new Elysia({
  prefix: "/advertisements",
})
  .use(dbPlugin)
  .use(adminAuthPlugin)

  // 获取广告列表 - RESTful标准设计，支持类型筛选
  .get(
    "/",
    async ({ query, currentSite }) => {
      const {
        page = 1,
        limit = 10,
        sort = "sortOrder",
        sortOrder = "asc",
        search,
        type,
        position,
        isActive,
      } = query;

      // 使用关系查询
      const advertisements = await db.query.adsTable.findMany({
        where: {
          siteId: currentSite.id,
          ...(search && {
            title: { like: `%${search}%` }
          }),
          ...(type && {
            type
          }),
          ...(position && {
            position
          }),
          ...(isActive !== undefined && isActive !== null && {
            isActive
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
          createdAt: 'desc',
          sortOrder: 'desc'
        },
        limit,
        offset: (page - 1) * limit,
      });

      // 获取总数
      const totalCountResult = await db
        .select({ count: count() })
        .from(adsTable)
        .where(
          and(
            eq(adsTable.siteId, currentSite.id),
            ...(search ? [like(adsTable.title, `%${search}%`)] : []),
            ...(type ? [eq(adsTable.type, type)] : []),
            ...(position ? [eq(adsTable.position, position)] : []),
            ...(isActive !== undefined && isActive !== null
              ? [eq(adsTable.isActive, isActive)]
              : [])
          )
        );

      const total = totalCountResult[0]?.count || 0;

      // 格式化返回数据
      const formattedItems = advertisements.map((ad) => ({
        ...ad,
        imageUrl: ad.media?.url,
      }));

      return commonRes({
        items: formattedItems,
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
      query: AdsTModel.ListQuery,
      detail: {
        summary: "获取广告列表",
        description:
          "获取广告列表，支持分页、搜索和筛选。使用type=banner获取Banner广告，type=carousel获取轮播图广告",
        tags: ["Advertisements"],
      },
    }
  )

  // 创建广告
  .post(
    "/",
    async ({ body, currentSite }) => {
      if (!body.mediaId) {
        throw new HttpError.BadRequest("请上传图片");
      }

      if (!body.title || body.title.trim() === "") {
        throw new HttpError.BadRequest("广告标题不能为空");
      }

      if (!body.description || body.description.trim() === "") {
        throw new HttpError.BadRequest("广告描述不能为空");
      }

      // 设置默认值
      const advertisementData = {
        title: body.title.trim(),
        description: body.description.trim(),
        type: body.type || "banner",
        mediaId: body.mediaId,
        link: body.link || "#",
        position: body.position || "home-top",
        siteId: currentSite.id,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        sortOrder: body.sortOrder ?? 0,
        isActive: body.isActive ?? true,
      };

      const [newAd] = await db
        .insert(adsTable)
        .values(advertisementData)
        .returning();

      if (!newAd) {
        throw new Error("创建广告失败");
      }

      return commonRes(newAd, 201);
    },
    {
      auth: true,
      body: AdsTModel.Create,
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
    async ({ params: { id }, body, currentSite }) => {
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
        mediaId: body.mediaId ? (Array.isArray(body.mediaId) ? body.mediaId[0] : body.mediaId) : undefined,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      };

      const result = await db
        .update(adsTable)
        .set(updateData)
        .where(eq(adsTable.id, id))
        .returning();

      if (result.length === 0) {
        throw new Error("广告不存在");
      }

      return commonRes(result[0])
    },
    {
      auth: true,
      params: t.Object({
        id: t.String(),
      }),
      body: AdsTModel.Update,
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
    async ({ params: { id }, currentSite }) => {
      // 先检查广告是否属于当前站点
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

      if (result.length === 0) {
        throw new Error("广告不存在");
      }

      return commonRes(result[0]);
    },
    {
      auth: true,
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
    async ({ body: { ids }, currentSite }) => {
      // 检查所有广告是否属于当前站点
      const existingAds = await db.query.adsTable.findMany({
        where: {
          id: {
            in: ids,
          },
        },
        columns: { id: true, siteId: true },
      });

      const unauthorizedAds = existingAds.filter(ad => ad.siteId !== currentSite.id);
      if (unauthorizedAds.length > 0) {
        throw new HttpError.Forbidden("无权删除部分广告");
      }

      await db.delete(adsTable).where(inArray(adsTable.id, ids));
      return commonRes({ message: "批量删除成功" });
    },
    {
      auth: true,
      body: t.Object({
        ids: t.Array(t.String()),
      }),
      detail: {
        summary: "批量删除广告",
        description: "批量删除指定ID的广告",
        tags: ["Advertisements"],
      },
    }
  );