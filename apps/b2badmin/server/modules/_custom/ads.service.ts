/**
 * ✍️ 【B2B Service - 业务自定义】
 * --------------------------------------------------------
 * 💡 你可以在此重写基类方法或添加私有业务逻辑。
 * 🛡️ 自动化脚本永远不会覆盖此文件。
 * --------------------------------------------------------
 */

import { mediaTable } from "@repo/contract";
import { and, eq, getColumns, inArray, like, sql } from "drizzle-orm";
import { HttpError } from "elysia-http-problem-json";
import { AdsGeneratedService } from "../_generated/ads.service";
import type { ServiceContext } from "../_lib/base-service";

export class AdsService extends AdsGeneratedService {
  findOne(): any {
    throw new Error("Method not implemented.");
  }
  /**
   * 🛡️ 核心：获取所有广告（后台管理）
   * 包含媒体信息和筛选功能
   */
  async findAllWithMedia(query: any, ctx: ServiceContext) {
    const { page = 1, limit = 10, search, type, position, isActive } = query;
    const table = this.table;
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
        ...getColumns(table),
        mediaUrl: mediaTable.url,
      })
      .from(table)
      .leftJoin(mediaTable, eq(table.mediaId, mediaTable.id))
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

    const data = ads.map((item) => ({
      ...item,
      mediaUrl: item.mediaUrl,
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
        startDate: (data.startDate
          ? new Date(data.startDate)
          : new Date()) as any,
        endDate: (data.endDate ? new Date(data.endDate) : new Date()) as any,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
        mediaId,
        // siteId: ctx.auth.siteId,
      },
      ctx
    );

    return ad;
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
