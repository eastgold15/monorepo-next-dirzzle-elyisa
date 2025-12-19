import { siteConfigTable } from "@repo/contract";
import { SiteConfigContract } from "@repo/contract";
import { asc, desc, eq, ilike, SQL } from "drizzle-orm";
import { BaseService } from "~/lib/base-service";

export class SiteConfigService extends BaseService<typeof siteConfigTable, typeof SiteConfigContract> {
    constructor() {
        super(siteConfigTable, SiteConfigContract);
    }


    async findWithBusinessLogic(query: any, auth: any) {
        const { search, category, visible, sort, sortOrder } = query;
        const extraFilters: SQL[] = [];

        // 映射业务搜索逻辑
        if (search) {
            extraFilters.push(ilike(siteConfigTable.key, `%${search}%`));
        }
        if (category) {
            extraFilters.push(eq(siteConfigTable.category, category));
        }
        if (visible !== undefined) {
            extraFilters.push(eq(siteConfigTable.visible, visible));
        }

        // 处理排序
        const orderColumn = (siteConfigTable as any)[sort] ?? siteConfigTable.createdAt;
        const orderBy = sortOrder === 'asc' ? asc(orderColumn) : desc(orderColumn);

        // 调用父类的 findAll，并注入业务条件
        return this.findAll(query, auth, extraFilters, orderBy);
    }
}
