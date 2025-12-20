import type { Static } from "@sinclair/typebox";
import { and, eq, ilike, type SQL, sql } from "drizzle-orm";
import type {
  PgDelete,
  PgSelect,
  PgTableWithColumns,
  PgUpdate,
} from "drizzle-orm/pg-core";

export interface ServiceContext {
  db: any;
  siteId: string;
  tenantId?: string;
}

export abstract class WEBBaseService<
  T extends PgTableWithColumns<any>,
  C extends { Create: any; Update: any; Response: any; ListQuery: any },
> {
  constructor(
    protected table: T,
    protected contract: C
  ) {}

  protected getScopeFilters(ctx: ServiceContext): SQL[] {
    const filters: SQL[] = [];
    const tableAny = this.table as any;
    if (tableAny.siteId && (ctx as any).siteId) {
      filters.push(eq(tableAny.siteId, (ctx as any).siteId));
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
    const { page = 1, limit = 10, search } = query as any;
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

  async create(data: Static<C["Create"]>, ctx: ServiceContext) {
    const tableAny = this.table as any;
    const payload = {
      ...data,
      ...(tableAny.siteId &&
        (ctx as any).siteId && { siteId: (ctx as any).siteId }),
    };
    const [result] = await ctx.db
      .insert(this.table)
      .values(payload)
      .returning();
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
