/**
 * ✍️ 【B2B Service - 业务自定义】
 * --------------------------------------------------------
 * 💡 你可以在此重写基类方法或添加私有业务逻辑。
 * 🛡️ 自动化脚本永远不会覆盖此文件。
 * --------------------------------------------------------
 */
import { eq, sql } from "drizzle-orm";
import { HttpError } from "elysia-http-problem-json";
import { SiteCategoriesGeneratedService } from "../_generated/sitecategories.service";
import type { ServiceContext } from "../_lib/base-service";

export class SiteCategoriesService extends SiteCategoriesGeneratedService {
  findOne() {
    throw new Error("Method not implemented.");
  }
  /**
   * 🛡️ 核心：获取树形结构的分类列表
   */
  async getTree(ctx: ServiceContext) {
    const table = this.table as any;

    // 获取所有分类
    const categories = await this.withScope(
      ctx.db.select().from(this.table).$dynamic(),
      ctx,
      []
    ).orderBy(sql`${table.sortOrder} asc, ${table.createdAt} asc`);

    // 构建树形结构
    const categoryMap = new Map();
    const rootCategories = [];

    // 先将所有分类存入 map
    for (const category of categories) {
      categoryMap.set(category.id, {
        ...category,
        children: [],
      });
    }

    // 构建父子关系
    for (const category of categories) {
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(categoryMap.get(category.id));
        }
      } else {
        rootCategories.push(categoryMap.get(category.id));
      }
    }

    return rootCategories;
  }

  /**
   * 🛡️ 核心：创建分类（支持层级关系）
   */
  async createCategory(data: any, ctx: ServiceContext) {
    const {
      name,
      description,
      parentId,
      sortOrder = 0,
      isActive = true,
    } = data;

    // 如果有父级，验证父级是否存在
    if (parentId) {
      const select = ctx.db.select().from(this.table).$dynamic();
      const [parent] = await this.withScope(select, ctx, [
        eq((this.table as any).id, parentId),
      ]);

      if (!parent) {
        throw new HttpError.NotFound("父级分类不存在或无权访问");
      }
    }

    return await this.create(
      {
        name,
        description,
        parentId,
        sortOrder,
        isActive,
      },
      ctx
    );
  }

  /**
   * 🛡️ 核心：移动分类（更新父级关系）
   */
  async moveCategory(
    id: string,
    newParentId: string | null,
    ctx: ServiceContext
  ) {
    const table = this.table as any;

    // 验证分类是否存在
    const select = ctx.db.select().from(this.table).$dynamic();
    const [category] = await this.withScope(select, ctx, [eq(table.id, id)]);

    if (!category) {
      throw new HttpError.NotFound("分类不存在或无权访问");
    }

    // 验证不能将分类移动到自己的子级下
    if (newParentId) {
      const [parent] = await this.withScope(select, ctx, [
        eq(table.id, newParentId),
      ]);

      if (!parent) {
        throw new HttpError.NotFound("目标父级分类不存在或无权访问");
      }

      // 检查是否会形成循环引用
      const isDescendant = await this.checkIsDescendant(newParentId, id, ctx);
      if (isDescendant) {
        throw new HttpError.BadRequest("不能将分类移动到自己的子级下");
      }
    }

    // 更新父级关系
    const [updated] = await this.withScope(
      ctx.db
        .update(table)
        .set({ parentId: newParentId })
        .where(eq(table.id, id))
        .$dynamic()
        .returning(),
      ctx
    );

    return {
      id: updated.id,
      parentId: updated.parentId,
      message: "分类移动成功",
    };
  }

  /**
   * 🛡️ 核心：批量更新排序
   */
  async updateSortOrder(
    items: Array<{ id: string; sortOrder: number }>,
    ctx: ServiceContext
  ) {
    const table = this.table as any;

    // 使用事务处理批量排序更新
    await ctx.db.transaction(async (tx) => {
      for (const item of items) {
        // 使用 withScope 确保只能更新属于自己 Scope 的分类
        await this.withScope(
          tx.update(table).set({ sortOrder: item.sortOrder }).$dynamic(),
          ctx,
          [eq(table.id, item.id)]
        );
      }
    });

    return { success: true, message: "排序更新成功" };
  }

  /**
   * 🛡️ 核心：切换激活状态
   */
  async toggleStatus(id: string, ctx: ServiceContext) {
    const table = this.table as any;
    const select = ctx.db.select().from(this.table).$dynamic();
    const [category] = await this.withScope(select, ctx, [eq(table.id, id)]);

    if (!category) {
      throw new HttpError.NotFound("分类不存在或无权访问");
    }

    // 先执行更新操作
    const [updated] = await this.withScope(
      ctx.db
        .update(table)
        .set({ isActive: !category.isActive })
        .where(eq(table.id, id))
        .$dynamic(),
      ctx
    );

    return {
      id: updated.id,
      isActive: updated.isActive,
      message: updated.isActive ? "分类已激活" : "分类已停用",
    };
  }

  /**
   * 🛡️ 辅助方法：检查是否为子孙分类
   */
  private async checkIsDescendant(
    ancestorId: string,
    descendantId: string,
    ctx: ServiceContext
  ): Promise<boolean> {
    const table = this.table as any;
    const select = ctx.db.select().from(this.table).$dynamic();
    const category = await this.withScope(select, ctx, [
      eq(table.id, descendantId),
    ]);

    if (!category || category.length === 0) {
      return false;
    }

    const parentId = category[0].parentId;

    if (!parentId) {
      return false;
    }

    if (parentId === ancestorId) {
      return true;
    }

    // 递归检查
    return await this.checkIsDescendant(ancestorId, parentId, ctx);
  }
}
