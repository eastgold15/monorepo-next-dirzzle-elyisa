// src/lib/base-service.ts

import { eq, sql } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { db } from "~/db/connection";


// 泛型 T 对应 Drizzle Table, C 对应你的 Contract 结构
export class BaseService<
    T extends PgTable<any>,
    C extends { Create: any; Update: any; Response: any },
> {
    constructor(
        protected table: T,
        protected contract: C
    ) { }

    // 这里的 data 自动推导为 Contract.Create 的类型
    async create(data: typeof this.contract.Create.static) {
        const [result] = await db.insert(this.table).values(data).returning();
        return result as typeof this.contract.Response.static;
    }

    async findAll({ page = 1, limit = 10 }: { page?: number; limit?: number }) {
        const offset = (page - 1) * limit;
        const data = await db.select().from(this.table).limit(limit).offset(offset);
        const [totalRes] = await db
            .select({ count: sql<number>`count(*)` })
            .from(this.table);

        return {
            data: data as (typeof this.contract.Response.static)[],
            total: Number(totalRes.count),
        };
    }

    async findOne(id: string) {
        const [result] = await db
            .select()
            .from(this.table)
            .where(eq((this.table as any).id, id));
        return result as typeof this.contract.Response.static;
    }

    async update(id: string, data: typeof this.contract.Update.static) {
        const [result] = await db
            .update(this.table)
            .set(data)
            .where(eq((this.table as any).id, id))
            .returning();
        return result as typeof this.contract.Response.static;
    }

    async delete(id: string) {
        await db.delete(this.table).where(eq((this.table as any).id, id));
        return { success: true };
    }
}
