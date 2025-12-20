import { and, eq, ilike, type SQL, sql } from "drizzle-orm";
import type {
  PgDelete,
  PgSelect,
  PgTableWithColumns,
  PgUpdate,
} from "drizzle-orm/pg-core";

/**
 * 极简上下文：只需 siteId
 */
export interface ServiceContext {
  db: any;
  siteId: string;
}

export class BaseService<
  T extends PgTableWithColumns<any>,
  C extends { Create: any; Update: any; Response: any; ListQuery: any },
> {
  constructor(
    protected table: T,
    protected contract: C
  ) {}

  /**
   * 🛡️ 唯一隔离因子：siteId
   */
  protected getScopeFilters(ctx: ServiceContext): SQL[] {
    const filters: SQL[] = [];
    const tableAny = this.table as any;

    // 只要表里有 siteId 字段，且 context 里有值，就应用过滤
    if (tableAny.siteId && ctx.siteId) {
      filters.push(eq(tableAny.siteId, ctx.siteId));
    }

    return filters;
  }

  /**
   * 🛠️ 核心工具：自动应用隔离条件
   */
  protected withScope<QB extends PgSelect | PgUpdate | PgDelete>(
    qb: QB,
    ctx: ServiceContext,
    extraFilters: SQL[] = []
  ): QB {
    const allFilters = [...this.getScopeFilters(ctx), ...extraFilters];
    // @ts-expect-error
    return allFilters.length > 0 ? qb.where(and(...allFilters)) : qb;
  }

  // --- 核心业务方法 ---

  /**
   * 自由查询接口 (支持 Drizzle 原生链式)
   */
  async query(ctx: ServiceContext, fn: (qb: any) => any) {
    const base = ctx.db.select().from(this.table).$dynamic();
    return await fn(this.withScope(base, ctx));
  }

  async findAll(
    query: {
      page?: number;
      limit?: number;
      search?: string;
      [key: string]: any;
    },
    ctx: ServiceContext
  ) {
    const { page = 1, limit = 10 } = query;
    const tableAny = this.table as any;

    // 1. 搜索条件 (如果有 name 字段)
    const extra: SQL[] = [];
    if (query.search && tableAny.name) {
      extra.push(ilike(tableAny.name, `%${query.search}%`));
    }

    // 2. 执行查询
    const select = ctx.db.select().from(this.table).$dynamic();
    const data = await this.withScope(select, ctx, extra)
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy(
        tableAny.createdAt
          ? sql`${tableAny.createdAt} desc`
          : sql`created_at desc`
      );

    // 3. 统计总数
    const total = await ctx.db.$count(
      this.table,
      and(...this.getScopeFilters(ctx), ...extra)
    );

    return {
      data: data as (typeof this.contract.Response.static)[],
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  async create(data: any, ctx: ServiceContext) {
    const tableAny = this.table as any;

    // 自动补全 siteId，确保数据归属正确
    const payload = {
      ...data,
      ...(tableAny.siteId && { siteId: ctx.siteId }),
    };

    const [result] = await ctx.db
      .insert(this.table)
      .values(payload)
      .returning();
    return result as typeof this.contract.Response.static;
  }

  async update(id: string, data: any, ctx: ServiceContext) {
    const update = ctx.db
      .update(this.table)
      .set({ ...data, updatedAt: new Date() })
      .$dynamic();
    const [result] = await this.withScope(update, ctx, [
      eq((this.table as any).id, id),
    ]).returning();
    return result;
  }

  async delete(id: string, ctx: ServiceContext) {
    const del = ctx.db.delete(this.table).$dynamic();
    await this.withScope(del, ctx, [eq((this.table as any).id, id)]);
    return { success: true };
  }
}
