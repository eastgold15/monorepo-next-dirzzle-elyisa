import type { Static } from "@sinclair/typebox";
import { and, eq, ilike, type SQL, sql } from "drizzle-orm";
import type {
  PgDelete,
  PgSelect,
  PgTable,
  PgUpdate,
} from "drizzle-orm/pg-core";
import type { db } from "~/db/connection";
export interface ServiceContext {
  db: typeof db;
  auth: {
    userId: string;
    siteId: string;
    tenantId: string;
    factoryId?: string | null; // 👈 工厂特定 ID
    exporterId?: string | null; // 👈 出口商特定 ID
    role: string;
  };
}

export abstract class B2BBaseService<
  T extends PgTable,
  C extends { Create: any; Update: any; Response: any; ListQuery: any },
> {
  constructor(
    protected table: T,
    protected contract: C
  ) {}

  protected getScopeFilters(ctx: ServiceContext): SQL[] {
    const filters: SQL[] = [];
    const table = this.table as any;
    const { siteId, factoryId } = ctx.auth;

    // 1. 基础站点隔离 (Tenant Level)
    if (table.siteId && siteId) {
      filters.push(eq(table.siteId, siteId));
    }

    // 2. 核心：工厂深度隔离 (Factory Level)
    // 如果当前用户是工厂身份 (有 factoryId)，且表中有 factoryId 字段，强制过滤
    if (table.factoryId && factoryId) {
      filters.push(eq(table.factoryId, factoryId));
    }

    return filters;
  }

  protected withScope<QB extends PgSelect | PgUpdate | PgDelete>(
    qb: QB,
    ctx: ServiceContext,
    extraFilters: SQL[] = []
  ): QB {
    const allFilters = [...this.getScopeFilters(ctx), ...extraFilters];
    // @ts-expect-error
    return allFilters.length > 0 ? qb.where(and(...allFilters)) : qb;
  }

  async findAll(query: Static<C["ListQuery"]>, ctx: ServiceContext) {
    const { page = 1, limit = 99_999, search } = query as any;
    const tableAny = this.table as any;
    const extra: SQL[] = [];
    if (search && tableAny.name)
      extra.push(ilike(tableAny.name, `%${search}%`));

    const select = ctx.db.select().from(this.table).$dynamic();
    const data = await this.withScope(select, ctx, extra)
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy(
        tableAny.createdAt
          ? sql`${tableAny.createdAt} desc`
          : sql`created_at desc`
      );

    const total = await ctx.db.$count(
      this.table,
      and(...this.getScopeFilters(ctx), ...extra)
    );
    return { data, total, page, limit };
  }

  // 修改 create 方法，确保保存时自动注入 factoryId 和 exporterId
  async create(data: Static<C["Create"]>, ctx: ServiceContext) {
    const table = this.table as any;
    const { siteId, factoryId, exporterId } = ctx.auth;

    const payload = {
      ...data,
      ...(table.siteId && { siteId }),
      ...(table.factoryId && factoryId && { factoryId }), // 👈 强制注入自己的工厂 ID
      ...(table.exporterId && exporterId && { exporterId }), // 👈 强制注入自己的出口商 ID
    };

    const result = await ctx.db.insert(this.table).values(payload).returning();
    return result;
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
