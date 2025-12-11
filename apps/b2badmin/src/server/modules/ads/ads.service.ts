import type { AdsModel } from "@repo/contract";
import { and, eq, getTableColumns, inArray, like, or } from "drizzle-orm";
import { HttpError } from "elysia-http-problem-json";
import { db } from "@/server/db/connection";
import { adsTable, mediaTable } from "@/server/db/schema";
import type { PageData } from "@/server/utils/Res";
import { buildPageMeta, paginate } from "@/server/utils/services";

/**
 * 广告服务抽象类
 * 处理广告相关的业务逻辑，使用静态方法避免类实例化
 */
export const AdsService = {
  columns: getTableColumns(adsTable),
  /**
   * 获取广告列表（分页）- 使用统一的分页函数
   */

  async getAdvertisementList(
    params: AdsModel["ListQuery"]
  ): Promise<PageData<AdsModel["Entity"]>> {
    try {
      const {
        page = 1,
        limit = 10,
        sort = "sortOrder",
        sortOrder = "asc",
        search,
        type,
        position,
        isActive,
      } = params;

      const { image_id: _image_id, ...rest } = AdsService.columns;

      // 构建基础查询
      let baseQuery = db
        .select({
          image_id: adsTable.image_id,
          imageUrl: mediaTable.url,
          ...rest,
        })
        .from(adsTable)
        .leftJoin(mediaTable, eq(adsTable.image_id, mediaTable.id))
        .$dynamic();

      // 搜索条件：支持标题和链接搜索
      const conditions = [] as any[];
      if (search) {
        conditions.push(
          or(
            like(adsTable.title, `%${search}%`),
            like(adsTable.link, `%${search}%`)
          )
        );
      }
      if (type) {
        conditions.push(eq(adsTable.type, type));
      }
      if (position) {
        conditions.push(eq(adsTable.position, position));
      }
      if (isActive !== undefined && isActive !== null) {
        conditions.push(eq(adsTable.isActive, isActive));
      }

      // 应用查询条件
      if (conditions.length > 0) {
        baseQuery = baseQuery.where(and(...conditions));
      }

      // 允许的排序字段
      const allowedSortFields = {
        title: adsTable.title,
        sortOrder: adsTable.sortOrder,
        createdAt: adsTable.createdAt,
        updatedAt: adsTable.updatedAt,
      };

      // 确定排序字段和方向
      const orderBy =
        allowedSortFields[sort as keyof typeof allowedSortFields] ||
        adsTable.sortOrder;
      const orderDirection = sortOrder as "asc" | "desc";

      const res = await paginate(baseQuery, {
        page,
        limit,
        orderBy,
        orderDirection,
      });

      // 使用统一的分页函数
      return {
        items: res.items,
        meta: buildPageMeta(res.total, page, limit),
      };
    } catch (error) {
      console.error("获取广告列表失败:", error);
      throw new Error("获取广告列表失败");
    }
  },

  /**
   * 根据ID获取广告详情
   */

  async getAdvertisementById(id: string) {
    const [advertisement] = await db
      .select({
        ...AdsService.columns,
        image: mediaTable.url,
      })
      .from(adsTable)
      .leftJoin(mediaTable, eq(adsTable.image_id, mediaTable.id))
      .where(eq(adsTable.id, id))
      .limit(1);

    if (!advertisement) {
      throw new HttpError.NotFound("广告不存在");
    }
    return advertisement;
  },

  /**
   * 创建广告
   */

  async createAdvertisement(data: AdsModel["Create"]) {
    if (!data.image_id || data.image_id.length === 0) {
      throw new HttpError.BadRequest("请上传图片");
    }
    // 设置默认值
    const advertisementData = {
      ...data,
      startDate: data.startDate,
      endDate: data.endDate,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
      image_id: data.image_id[0]!,
    };
    const [newAd] = await db
      .insert(adsTable)
      .values(advertisementData)
      .returning();
    if (!newAd) {
      throw new Error("创建广告失败,");
    }
    return newAd;
  },

  /**
   * 更新广告
   */

  async updateAdvertisement(id: string, data: AdsModel["Update"]) {
    try {
      // 准备更新数据，添加更新时间
      const updateData: Partial<typeof adsTable.$inferInsert> = {
        ...data,
        image_id: data.image_id ? data.image_id[0] : undefined,
        startDate: data.startDate,
        endDate: data.endDate,
      };

      const result = await db
        .update(adsTable)
        .set(updateData)
        .where(eq(adsTable.id, id))
        .returning();

      if (result.length === 0) {
        throw new Error("广告不存在");
      }

      return result[0];
    } catch (error) {
      console.error("更新广告失败:", error);
      throw error;
    }
  },

  async batchDeleteAdvertisement(ids: string[]) {
    await db.delete(adsTable).where(inArray(adsTable.id, ids));
  },

  /**
   * 获取当前时间段的轮播图广告
   */
  async getCurrentCarouselAds(): Promise<AdsModel["Entity"][]> {
    try {
      const now = new Date();

      const advertisements = await db
        .select({
          imageUrl: mediaTable.url,
          ...AdsService.columns,
        })
        .from(adsTable)
        .leftJoin(mediaTable, eq(adsTable.image_id, mediaTable.id))
        .where(
          and(
            eq(adsTable.type, "carousel"),
            eq(adsTable.isActive, true)
            // 检查当前时间在广告的有效时间内
            // adsTable.startDate <= now AND adsTable.endDate >= now
          )
        )
        .orderBy(adsTable.sortOrder, adsTable.createdAt);

      // 过滤出在有效时间范围内的广告
      const validAds = advertisements.filter((ad) => {
        const startDate = new Date(ad.startDate);
        const endDate = new Date(ad.endDate);
        return startDate <= now && endDate >= now;
      });

      return validAds;
    } catch (error) {
      console.error("获取当前轮播图广告失败:", error);
      throw new Error("获取当前轮播图广告失败");
    }
  },

  /**
   * 删除广告
   */

  async deleteAdvertisement(id: string) {
    try {
      const result = await db
        .delete(adsTable)
        .where(eq(adsTable.id, id))
        .returning();

      if (result.length === 0) {
        throw new Error("广告不存在");
      }

      return result[0];
    } catch (error) {
      console.error("删除广告失败:", error);
      throw error;
    }
  },
};
