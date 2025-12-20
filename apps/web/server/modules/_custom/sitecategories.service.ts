import { asc, eq } from "drizzle-orm";
import { buildTree } from "~/utils/buildTree";
import { SiteCategoriesGeneratedService } from "../_generated/sitecategories.service";
import type { ServiceContext } from "../_lib/base-service";

/**
 * 🛠️ Category 业务实现
 */
export class SiteCategoriesService extends SiteCategoriesGeneratedService {
  /**
   * 获取站点分类树
   */
  async getTree(ctx: ServiceContext) {
    // 1. 开启动态查询
    const query = ctx.db.select().from(this.table).$dynamic();

    // 2. 调用 withScope 自动注入 siteId 隔离，并增加排序
    const categories = await this.withScope(query, ctx).orderBy(
      asc((this.table as any).sortOrder)
    );

    // 3. 转换为树形结构
    return buildTree(categories, "id", "parentId");
  }

  /**
   * 获取单个分类 (带站点检查)
   */
  async getById(id: string, ctx: ServiceContext) {
    const query = ctx.db.select().from(this.table).$dynamic();

    // 使用 withScope 确保用户查不到非本站点的分类
    const res = await this.withScope(query, ctx, [
      eq((this.table as any).id, id),
    ]);

    return res[0];
  }
}
