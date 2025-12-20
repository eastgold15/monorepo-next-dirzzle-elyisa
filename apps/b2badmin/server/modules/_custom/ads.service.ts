/**
 * ✍️ 【B2B Service - 业务自定义】
 * --------------------------------------------------------
 * 💡 你可以在此重写基类方法或添加私有业务逻辑。
 * 🛡️ 自动化脚本永远不会覆盖此文件。
 * --------------------------------------------------------
 */

import { mediaTable } from "@repo/contract";
import { and, eq, inArray, like, sql } from "drizzle-orm";
import { HttpError } from "elysia-http-problem-json";
import { StorageFactory } from "~/lib/media/storage/StorageFactory";
import { AdsGeneratedService } from "../_generated/ads.service";
import type { ServiceContext } from "../_lib/base-service";

export class AdsService extends AdsGeneratedService {
  /**
   * 🛡️ 核心：获取所有广告（后台管理）
   * 包含媒体信息和筛选功能
   */
  async findAllWithMedia(query: any, ctx: ServiceContext) {
    const { page = 1, limit = 10, search, type, position, isActive } = query;
    const table = this.table as any;
    const filters: any[] = [];

    // 搜索条件
    if (search) {
      filters.push(like(table.title, `%${search}%`));
    }

    // 类型筛选
    if (type) {
      filters.push(eq(table.type, type));
    }

    // 位置筛选
    if (position) {
      filters.push(eq(table.position, position));
    }

    // 状态筛选
    if (isActive !== undefined) {
      filters.push(eq(table.isActive, isActive));
    }

    // 关联媒体数据查询
    const select = ctx.db
      .select({
        id: table.id,
        title: table.title,
        description: table.description,
        type: table.type,
        link: table.link,
        position: table.position,
        startDate: table.startDate,
        endDate: table.endDate,
        sortOrder: table.sortOrder,
        isActive: table.isActive,
        createdAt: table.createdAt,
        updatedAt: table.updatedAt,
        media: {
          id: (table as any).mediaTable.id,
          storageKey: (table as any).mediaTable.storageKey,
        },
      })
      .from(table)
      .leftJoin(
        (table as any).mediaTable,
        eq(table.mediaId, (table as any).mediaTable.id)
      )
      .$dynamic();

    // 获取数据
    const ads = await this.withScope(select, ctx, filters)
      .orderBy(sql`${table.sortOrder} asc, ${table.createdAt} desc`)
      .limit(limit)
      .offset((page - 1) * limit);

    // 获取总数
    const total = await ctx.db.$count(
      this.table,
      and(...this.getScopeFilters(ctx), ...filters)
    );

    // 格式化返回数据，包含媒体 URL
    const storage = StorageFactory.createStorageFromEnv();
    const data = ads.map((item: any) => ({
      ...item,
      imageUrl: item.media ? storage.getPublicUrl(item.media.storageKey) : null,
    }));

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  /**
   * 🛡️ 核心：创建广告
   * 自动关联媒体文件并处理日期
   */
  async createAd(data: any, mediaId: string, ctx: ServiceContext) {
    // 1. 创建基本的广告
    const ad = await this.create(
      {
        title: data.title.trim(),
        description: data.description?.trim() || "",
        type: data.type ?? "banner",
        link: data.link ?? "#",
        position: data.position ?? "home-top",
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : new Date(),
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
        mediaId,
        siteId: ctx.auth.siteId,
      },
      ctx
    );

    // 2. 如果有关联的媒体文件，返回带媒体 URL 的数据
    if (mediaId) {
      const storage = StorageFactory.createStorageFromEnv();

      const [media] = await ctx.db
        .select()
        .from(mediaTable)
        .where(eq(mediaTable.id, mediaId))
        .limit(1);

      if (media) {
        return {
          ...ad,
          imageUrl: storage.getPublicUrl(media.storageKey),
        };
      }
    }

    return ad;
  }

  /**
   * 🛡️ 核心：拖拽排序
   */
  async updateSortOrder(
    items: Array<{ id: string; sortOrder: number }>,
    ctx: ServiceContext
  ) {
    const table = this.table as any;

    // 使用事务处理批量排序更新
    await ctx.db.transaction(async (tx) => {
      for (const item of items) {
        // 使用 withScope 确保只能更新属于自己 Scope 的广告
        await this.withScope(
          tx.update(table).set({ sortOrder: item.sortOrder }),
          ctx,
          [eq(table.id, item.id)]
        );
      }
    });

    return { success: true, message: "排序更新成功" };
  }

  /**
   * 🛡️ 核心：切换激活状态
   */
  async toggleStatus(id: string, ctx: ServiceContext) {
    const table = this.table as any;
    const select = ctx.db.select().from(this.table).$dynamic();
    const [ad] = await this.withScope(select, ctx, [eq(table.id, id)]);

    if (!ad) {
      throw new HttpError.NotFound("广告不存在或无权访问");
    }

    const [updatedAd] = await this.withScope(
      ctx.db
        .update(table)
        .set({ isActive: !ad.isActive })
        .where(eq(table.id, id))
        .returning(),
      ctx
    );

    return {
      id: updatedAd.id,
      isActive: updatedAd.isActive,
      message: updatedAd.isActive ? "广告已激活" : "广告已停用",
    };
  }

  /**
   * 🛡️ 核心：批量删除
   */
  async batchDelete(ids: string[], ctx: ServiceContext) {
    const table = this.table as any;

    // 1. 查找所有属于当前 Scope 的广告
    const select = ctx.db.select().from(this.table).$dynamic();
    const ads = await this.withScope(select, ctx, [inArray(table.id, ids)]);

    if (ads.length === 0) {
      throw new HttpError.NotFound("未找到可删除的广告");
    }

    // 2. 批量删除
    await ctx.db.delete(this.table).where(
      and(
        inArray(
          table.id,
          ads.map((ad: any) => ad.id)
        ),
        ...this.getScopeFilters(ctx)
      )
    );

    return { count: ads.length, message: `成功删除 ${ads.length} 个广告` };
  }
}
