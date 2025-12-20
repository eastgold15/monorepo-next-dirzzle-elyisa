/**
 * ✍️ 【WEB Service - 业务自定义】
 * --------------------------------------------------------
 * 💡 你可以在此重写基类方法或添加私有业务逻辑。
 * 🛡️ 自动化脚本永远不会覆盖此文件。
 * --------------------------------------------------------
 */
import { asc, eq } from "drizzle-orm";

import type { ServiceContext } from "~/lib/base-service";
import { HeroCardsGeneratedService } from "../_generated/herocards.service";

export class HeroCardsService extends HeroCardsGeneratedService {
  /**
   * 查询当前有效的 Hero Cards (带站点隔离)
   */
  async findCurrent(ctx: ServiceContext) {
    // 1. 构建基础查询并开启 $dynamic 以便 withScope 注入条件
    const query = ctx.db.select().from(this.table).$dynamic();

    // 2. 准备业务逻辑过滤条件 (isActive = true)
    const extraFilters = [eq(this.table.isActive, true)];

    // 3. 使用 withScope 自动处理 siteId 隔离，并添加排序和限制
    // withScope 会自动检测 this.table 中是否有 siteId 字段并注入 eq(table.siteId, ctx.siteId)
    const result = await this.withScope(query, ctx, extraFilters)
      .orderBy(asc(this.table.sortOrder))
      .limit(3);

    return result;
  }
}
