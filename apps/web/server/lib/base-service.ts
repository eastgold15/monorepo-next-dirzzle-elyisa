import { and, eq, or, type SQL, sql } from "drizzle-orm";
import type { PgTableWithColumns } from "drizzle-orm/pg-core";
import { db } from "../db/connection";

export interface ServiceContext {
  db: typeof db;
  siteId: string;
  siteType: string;
  factoryId?: string;
  exporterId?: string;
}

export class BaseService<
  T extends PgTableWithColumns<any>,
  C extends { Create: any; Update: any; Response: any; ListQuery: any },
> {
  constructor(
    protected table: T,
    protected contract: C
  ) { }

  /**
   * 🛡️ 收集站点隔离条件 (Site Scope Collector)
   * 根据站点类型和关联的工厂/出口商ID进行数据隔离
   */
  protected getScopeFilters(context: ServiceContext): SQL[] {
    const { siteType, factoryId, exporterId } = context;
    const filters: SQL[] = [];
    const tableAny = this.table as any;

    // 根据站点类型进行数据隔离
    if (siteType === "factory" && tableAny.factoryId) {
      filters.push(eq(tableAny.factoryId, factoryId));
    } else if (siteType === "exporter" && tableAny.exporterId) {
      filters.push(eq(tableAny.exporterId, exporterId));
    }

    // 对于站点关联的表（如 siteCategories, siteProducts），使用 siteId
    if (tableAny.siteId) {
      filters.push(eq(tableAny.siteId, context.siteId));
    }

    return filters;
  }

  /**
   * 动态 Where 辅助函数
   */
  private buildWhere(filters: SQL[]): SQL | undefined {
    return filters.length > 0 ? and(...filters) : undefined;
  }

  // --- 核心业务方法 ---

  /**
   * 增强版 findAll
   * @param query 查询参数
   * @param context 上下文（包含站点信息）
   * @param extraFilters 额外的过滤条件
   * @param orderBy 排序条件
   */
  async findAll(
    query: { page?: number; limit?: number; [key: string]: any },
    context: ServiceContext,
    extraFilters: SQL[] = [],
    orderBy?: SQL
  ) {
    const { db } = context;
    const { page = 1, limit = 10, sortBy, sortOrder = "desc" } = query;

    // 获取站点隔离条件
    const scopeFilters = this.getScopeFilters(context);

    // 构建搜索条件
    const searchFilters: SQL[] = [];
    if (query.search) {
      // 假设所有表都有 name 字段
      if ((this.table as any).name) {
        searchFilters.push(sql`(name ILIKE ${`%${query.search}%`})`);
      }
    }

    // 合并所有过滤条件
    const allFilters = [...scopeFilters, ...searchFilters, ...extraFilters];

    // 构建排序
    let finalOrderBy = orderBy;
    if (!finalOrderBy && sortBy && (this.table as any)[sortBy]) {
      const column = (this.table as any)[sortBy];
      finalOrderBy = sortOrder === "desc" ? sql`${column} desc` : sql`${column} asc`;
    }
    if (!finalOrderBy) {
      finalOrderBy = sql`created_at desc`; // 默认排序
    }

    // 执行查询
    const data = await db
      .select()
      // @ts-expect-error
      .from(this.table)
      .$dynamic()
      .where(this.buildWhere(allFilters))
      .orderBy(finalOrderBy)
      .limit(limit)
      .offset((page - 1) * limit);

    // 获取总数
    // @ts-expect-error
    const total = await db.$count(this.table, this.buildWhere(allFilters));

    return {
      data: data as (typeof this.contract.Response.static)[],
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  async findOne(id: string, context: ServiceContext) {
    const { db } = context;
    const filters = this.getScopeFilters(context);
    filters.push(eq((this.table as any).id, id));

    const [result] = await db
      .select()
      // @ts-expect-error
      .from(this.table)
      .$dynamic()
      .where(this.buildWhere(filters));

    return result as typeof this.contract.Response.static;
  }

  async create(data: any, context: ServiceContext) {
    const { db, siteId, siteType, factoryId, exporterId } = context;

    // 强制补全站点归属信息
    const payload = {
      ...data,
      // 根据表结构添加相应的站点字段
      ...(siteType === "factory" && { factoryId }),
      ...(siteType === "exporter" && { exporterId }),
      // 如果表有 siteId 字段，则添加
      ...((this.table as any).siteId && { siteId }),
    };

    // @ts-expect-error
    const [result] = await db.insert(this.table).values(payload).returning();
    return result as typeof this.contract.Response.static;
  }

  async update(id: string, data: any, context: ServiceContext) {
    const { db } = context;
    const filters = this.getScopeFilters(context);

    const [result] = await db
      // @ts-expect-error
      .update(this.table)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq((this.table as any).id, id), ...filters))
      .returning();

    return result as typeof this.contract.Response.static;
  }

  async delete(id: string, context: ServiceContext) {
    const { db } = context;
    const filters = this.getScopeFilters(context);

    await db
      // @ts-expect-error
      .delete(this.table)
      .where(and(eq((this.table as any).id, id), ...filters));

    return { success: true };
  }
}
