/**
 * ✍️ 【B2B Service - 业务自定义】
 * --------------------------------------------------------
 * 💡 你可以在此重写基类方法或添加私有业务逻辑。
 * 🛡️ 自动化脚本永远不会覆盖此文件。
 * --------------------------------------------------------
 */

import { mediaTable } from "@repo/contract";
import { and, eq, sql } from "drizzle-orm";
import { HttpError } from "elysia-http-problem-json";
import { StorageFactory } from "~/lib/media/storage/StorageFactory";
import { HeroCardsGeneratedService } from "../_generated/herocards.service";
import type { ServiceContext } from "../_lib/base-service";

export class HeroCardsService extends HeroCardsGeneratedService {
  /**
   * 🛡️ 核心：获取所有首页展示卡片（后台管理）
   * 包含媒体信息
   */
  async findAllWithMedia(query: any, ctx: ServiceContext) {
    const { page = 1, limit = 10, search } = query;
    const table = this.table as any;
    const filters: any[] = [];

    // 搜索条件
    if (search) {
      filters.push(
        sql`(${table.title} ILIKE ${`%${search}%`} OR ${table.subtitle} ILIKE ${`%${search}%`})`
      );
    }

    // 关联媒体数据查询
    const select = ctx.db
      .select({
        id: table.id,
        title: table.title,
        subtitle: table.subtitle,
        description: table.description,
        buttonUrl: table.buttonUrl,
        buttonLabel: table.buttonLabel,
        sortOrder: table.sortOrder,
        isActive: table.isActive,
        backgroundClass: table.backgroundClass,
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
    const cardsWithMedia = await this.withScope(select, ctx, filters)
      .orderBy(sql`${table.sortOrder} asc, ${table.createdAt} desc`)
      .limit(limit)
      .offset((page - 1) * limit);

    // 获取总数
    const countSelect = ctx.db.select().from(this.table).$dynamic();
    const total = await ctx.db.$count(
      this.table,
      and(...this.getScopeFilters(ctx), ...filters)
    );

    // 格式化返回数据，包含媒体 URL
    const storage = StorageFactory.createStorageFromEnv();
    const data = cardsWithMedia.map((item: any) => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
      imageUrl: item.media ? storage.getPublicUrl(item.media.storageKey) : null,
      buttonUrl: item.buttonUrl,
      buttonLabel: item.buttonLabel,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
      backgroundClass: item.backgroundClass,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  /**
   * 🛡️ 核心：获取激活的首页展示卡片（前端展示用）
   * withScope 自动处理站点和工厂隔离
   */
  async findCurrent(ctx: ServiceContext) {
    const table = this.table as any;

    // 关联媒体数据查询 - 只返回激活的
    const select = ctx.db
      .select({
        id: table.id,
        title: table.title,
        subtitle: table.subtitle,
        description: table.description,
        buttonUrl: table.buttonUrl,
        buttonLabel: table.buttonLabel,
        sortOrder: table.sortOrder,
        isActive: table.isActive,
        backgroundClass: table.backgroundClass,
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

    const cardsWithMedia = await this.withScope(select, ctx, [
      eq(table.isActive, true),
    ]).orderBy(sql`${table.sortOrder} asc, ${table.createdAt} desc`);

    // 格式化返回数据，包含媒体 URL
    const storage = StorageFactory.createStorageFromEnv();
    return cardsWithMedia.map((item: any) => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
      imageUrl: item.media ? storage.getPublicUrl(item.media.storageKey) : null,
      buttonUrl: item.buttonUrl,
      buttonLabel: item.buttonLabel,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
      backgroundClass: item.backgroundClass,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  }

  /**
   * 🛡️ 核心：创建 Hero Card
   * 自动关联媒体文件
   */
  async createHeroCard(data: any, mediaId: string | null, ctx: ServiceContext) {
    // 1. 创建基本的 Hero Card
    const card = await this.create(
      {
        ...data,
        mediaId,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
        backgroundClass: data.backgroundClass ?? "bg-blue-50",
      },
      ctx
    );

    // 2. 如果有关联的媒体文件，返回带媒体 URL 的数据
    if (mediaId) {
      const storage = StorageFactory.createStorageFromEnv();
      // 需要导入 media 表来查询

      const [media] = await ctx.db
        .select()
        .from(mediaTable)
        .where(eq(mediaTable.id, mediaId))
        .limit(1);

      if (media) {
        return {
          ...card,
          imageUrl: storage.getPublicUrl(media.storageKey),
        };
      }
    }

    return card;
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
        // 使用 withScope 确保只能更新属于自己 Scope 的卡片
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
    const [card] = await this.withScope(select, ctx, [eq(table.id, id)]);

    if (!card) {
      throw new HttpError.NotFound("首页展示卡片不存在或无权访问");
    }

    const [updatedCard] = await this.withScope(
      ctx.db
        .update(table)
        .set({ isActive: !card.isActive })
        .where(eq(table.id, id))
        .returning(),
      ctx
    );

    return {
      id: updatedCard.id,
      isActive: updatedCard.isActive,
      message: updatedCard.isActive ? "卡片已激活" : "卡片已停用",
    };
  }
}
