import { eq, gte, lte } from "drizzle-orm";

import type { ServiceContext } from "~/lib/base-service";
import { AdsGeneratedService } from "../_generated/ads.service";

export class AdsService extends AdsGeneratedService {
    // 💡 注意：一定要接收 context (包含 db 和 siteId)
    async findCurrent(ctx: ServiceContext) {
        const now = new Date();

        // 1. 构建业务过滤条件
        const businessFilters = [
            eq(this.table.isActive, true),
            lte(this.table.startDate, now),
            gte(this.table.endDate, now),
        ];

        // 2. 开启动态查询
        const query = ctx.db.select().from(this.table).$dynamic();

        // 3. 调用基类的 withScope 自动注入 siteId 隔离
        return await this.withScope(query, ctx, businessFilters).limit(4);
    }
}
