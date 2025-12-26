import { heroCardsTable, mediaTable } from "@repo/contract";
import {
  and,
  asc,
  desc,
  eq,
  getColumns,
  ilike,
  or,
  type SQL,
} from "drizzle-orm";
import { HttpError } from "elysia-http-problem-json";
import { HeroCardsGeneratedService } from "../_generated/herocards.service";
import type { ServiceContext } from "../_lib/base-service";

export class HeroCardsService extends HeroCardsGeneratedService {
  /**
   * 🛡️ 核心：获取所有首页展示卡片（后台管理）
   */
  async findAllWithMedia(query: any, ctx: ServiceContext) {
    console.log("query:", query);
    const { page = 1, limit = 10, search } = query;

    // 1. 确保 filters 始终是一个干净的数组
    const filters: SQL[] = [];
    if (search) {
      filters.push(
        or(
          ilike(heroCardsTable.title, `%${search}%`),
          ilike(heroCardsTable.description, `%${search}%`)
        )!
      );
    }

    // 2. 构建基础查询，暂时不加 $dynamic()，先传给 withScope
    const baseQuery = ctx.db
      .select({
        ...getColumns(heroCardsTable),
        mediaUrl: mediaTable.url,
      })
      .from(heroCardsTable)
      .leftJoin(mediaTable, eq(heroCardsTable.mediaId, mediaTable.id))
      .$dynamic();

    // 3. 在 withScope 处理后再调用 orderBy 等动态方法
    // 确保 filters! 这种非空断言不会导致传入 [undefined]
    const scopedQuery = this.withScope(baseQuery, ctx, filters);

    const results = await scopedQuery
      .orderBy(asc(heroCardsTable.sortOrder), desc(heroCardsTable.createdAt))
      .limit(Number(limit))
      .offset((Number(page) - 1) * Number(limit));
    console.log("results:", results);
    // 4. 计算总数 (注意：filters 展开时要小心)
    const total = await ctx.db.$count(
      heroCardsTable,
      and(...this.getScopeFilters(ctx), ...filters)
    );

    // 5. 格式化数据
    const data = results.map((item) => ({
      ...item,
    }));

    return { data, total, page: Number(page), limit: Number(limit) };
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
        siteId: ctx.auth.siteId,
      },
      ctx
    );
    return card;
  }

  /**
   * 🛡️ 核心：更新排序
   */
  async updateSortOrder(
    items: Array<{ id: string; sortOrder: number }>,
    ctx: ServiceContext
  ) {
    await ctx.db.transaction(async (tx) => {
      for (const item of items) {
        // 使用 withScope 确保只能更新归属于当前 site/tenant 的数据
        await this.withScope(
          tx
            .update(heroCardsTable)
            .set({ sortOrder: item.sortOrder })
            .$dynamic(),
          ctx,
          [eq(heroCardsTable.id, item.id)]
        );
      }
    });

    return { success: true };
  }

  /**
   * 🛡️ 核心：切换状态
   */
  async toggleStatus(id: string, ctx: ServiceContext) {
    const [card] = await this.withScope(
      ctx.db.select().from(heroCardsTable).$dynamic(),
      ctx,
      [eq(heroCardsTable.id, id)]
    );

    if (!card) throw new HttpError.NotFound("记录不存在");

    const [updated] = await ctx.db
      .update(heroCardsTable)
      .set({ isActive: !card.isActive })
      .where(eq(heroCardsTable.id, id))
      .returning();

    return {
      id: updated.id,
      isActive: updated.isActive,
      message: updated.isActive ? "已激活" : "已停用",
    };
  }
}
