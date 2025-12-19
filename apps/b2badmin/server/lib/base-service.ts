import { and, eq, or, sql, SQL, getColumns } from "drizzle-orm";
import { AnyPgTable, PgSelect, PgTable, PgTableWithColumns } from "drizzle-orm/pg-core";
import { db } from "~/db/connection";

export class BaseService<
    T extends PgTableWithColumns<any>,
    C extends { Create: any; Update: any; Response: any; ListQuery: any }
> {
    constructor(protected table: T, protected contract: C) { }

    /**
     * 🛡️ 收集隔离条件 (Scope Collector)
     * 抽离此逻辑，以便 findAll 和 $count 都能复用相同的过滤数组
     */
    private getScopeFilters(auth: any): SQL[] {
        const { role, userId, exporterId, factoryId } = auth;
        const filters: SQL[] = [];
        const tableAny = this.table as any;

        if (role === 'SUPER_ADMIN') return [];

        // 逻辑：只有当表里定义了对应字段，才施加隔离
        if (role === 'EXPORTER_ADMIN' && tableAny.exporterId) {
            filters.push(eq(tableAny.exporterId, exporterId));
        } else if (role === 'FACTORY_ADMIN' && tableAny.factoryId) {
            filters.push(eq(tableAny.factoryId, factoryId));
        } else if (role.endsWith('_SALES')) {
            // 组织边界隔离
            if (role.startsWith('EXPORTER') && tableAny.exporterId) {
                filters.push(eq(tableAny.exporterId, exporterId));
            } else if (tableAny.factoryId) {
                filters.push(eq(tableAny.factoryId, factoryId));
            }
            // 个人/公海隔离
            if (tableAny.ownerId) {
                const personal = [eq(tableAny.ownerId, userId)];
                if (tableAny.isPublic) personal.push(eq(tableAny.isPublic, true));
                filters.push(or(...personal));
            }
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

    async findAll(query: any, auth: any) {
        const { page = 1, limit = 10 } = query;
        const filters = this.getScopeFilters(auth);

        // 1. 数据查询：使用 .$dynamic() 链式构建
        const data = await db
            .select()
            .from(this.table)
            .$dynamic()
            .where(this.buildWhere(filters))
            .limit(limit)
            .offset((page - 1) * limit);

        // 2. 总数查询：使用最新的 $count API
        // $count 会自动处理 count(*) 并返回 number
        const total = await db.$count(this.table, this.buildWhere(filters));

        return {
            data: data as (typeof this.contract.Response.static)[],
            total,
        };
    }

    async findOne(id: string, auth: any) {
        const filters = this.getScopeFilters(auth);
        filters.push(eq((this.table as any).id, id));

        const [result] = await db
            .select()
            .from(this.table)
            .$dynamic()
            .where(this.buildWhere(filters));

        return result as typeof this.contract.Response.static;
    }

    async create(data: any, auth: any) {
        // 强制补全归属，确保安全
        const payload = {
            ...data,
            exporterId: auth.exporterId,
            factoryId: auth.factoryId,
            ownerId: auth.userId,
        };
        const [result] = await db.insert(this.table).values(payload).returning();
        return result as typeof this.contract.Response.static;
    }

    async update(id: string, data: any, auth: any) {
        const filters = this.getScopeFilters(auth);
        const [result] = await db
            .update(this.table)
            .set(data)
            .where(and(eq((this.table as any).id, id), ...filters))
            .returning();
        return result as typeof this.contract.Response.static;
    }

    async delete(id: string, auth: any) {
        const filters = this.getScopeFilters(auth);
        await db
            .delete(this.table)
            .where(and(eq((this.table as any).id, id), ...filters));
        return { success: true };
    }
}