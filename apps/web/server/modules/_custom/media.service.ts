/**
 * ✍️ 【WEB Service - 业务自定义】
 * --------------------------------------------------------
 * 💡 处理媒体资源的查询，并强制执行站点隔离。
 * --------------------------------------------------------
 */
import { asc, eq, inArray } from "drizzle-orm";
import { MediaGeneratedService } from "../_generated/media.service";
import type { ServiceContext } from "../_lib/base-service";

export class MediaService extends MediaGeneratedService {
    /**
     * 根据 ID 获取单个媒体 URL
     */
    async getUrlById(id: string, ctx: ServiceContext) {
        const query = ctx.db
            .select({ url: this.table.url })
            .from(this.table)
            .$dynamic();

        // 🛡️ 注入站点隔离 + ID 过滤
        const [result] = await this.withScope(query, ctx, [
            eq((this.table as any).id, id),
        ]).orderBy(asc((this.table as any).createdAt));

        return result?.url || null;
    }

    /**
     * 批量获取媒体 URL 列表
     */
    async getUrlsByIds(ids: string[], ctx: ServiceContext) {
        if (!ids || ids.length === 0) return [];

        const query = ctx.db
            .select({ url: this.table.url })
            .from(this.table)
            .$dynamic();

        // 🛡️ 注入站点隔离 + 批量 ID 过滤 (inArray)
        return await this.withScope(query, ctx, [
            inArray((this.table as any).id, ids),
        ]);
    }
}
