import { eq, and, count, desc, asc, SQL, SQLWrapper } from "drizzle-orm";
import { db } from "../db/connection";
import type { CommonRes } from "../utils/Res";

export interface ServiceContext {
  db: typeof db;
  user: any;
}

export class BaseService<T extends Record<string, any>, C extends Record<string, any>> {
  constructor(
    private table: T,
    private contract: C
  ) {}

  async findAll(query: any, context: ServiceContext) {
    const { db } = context;
    const {
      page = 1,
      pageSize = 10,
      sortBy,
      sortOrder = "asc",
      search,
      ...filters
    } = query;

    const offset = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);

    // 构建查询条件
    const conditions = [];

    // 添加搜索条件
    if (search) {
      // 假设所有表都有 name 字段，如果没有需要根据实际情况修改
      if ('name' in this.table) {
        conditions.push((this.table as any).name.like(`%${search}%`));
      }
    }

    // 添加过滤条件
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && key in this.table) {
        conditions.push(eq((this.table as any)[key], value));
      }
    });

    // 构建排序条件
    let orderBy;
    if (sortBy && sortBy in this.table) {
      const column = (this.table as any)[sortBy];
      orderBy = sortOrder === "desc" ? desc(column) : asc(column);
    } else {
      // 默认按创建时间倒序
      orderBy = desc((this.table as any).createdAt);
    }

    // 执行查询
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, totalResult] = await Promise.all([
      db
        .select()
        .from(this.table)
        .where(where)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(this.table)
        .where(where)
    ]);

    const total = totalResult[0]?.count || 0;

    return CommonRes.success({
      data,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(total / Number(pageSize)),
    });
  }

  async findById(id: string, context: ServiceContext) {
    const { db } = context;
    const result = await db
      .select()
      .from(this.table)
      .where(eq((this.table as any).id, id))
      .limit(1);

    return result[0] ? CommonRes.success(result[0]) : CommonRes.error("Not found");
  }

  async create(body: any, context: ServiceContext) {
    const { db } = context;
    const result = await db
      .insert(this.table)
      .values(body)
      .returning();

    return CommonRes.success(result[0]);
  }

  async update(id: string, body: any, context: ServiceContext) {
    const { db } = context;
    const result = await db
      .update(this.table)
      .set({ ...body, updatedAt: new Date() })
      .where(eq((this.table as any).id, id))
      .returning();

    return result[0] ? CommonRes.success(result[0]) : CommonRes.error("Not found");
  }

  async delete(id: string, context: ServiceContext) {
    const { db } = context;
    const result = await db
      .delete(this.table)
      .where(eq((this.table as any).id, id))
      .returning();

    return result[0] ? CommonRes.success(result[0]) : CommonRes.error("Not found");
  }
}