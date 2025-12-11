import type { CategoryModel, TreeNode } from "@repo/contract";
import { asc, eq, inArray } from "drizzle-orm";
import { HttpError } from "elysia-http-problem-json";
import { db } from "@/server/db/connection";
import { categoriesTable } from "@/server/db/schema";
import type { SupportedLocale } from "../../plugins/locale";
import { buildTree } from "../../utils/buildTree";
import { translateService } from "../translations/translate.service";
/**
 * 分类服务类
 * 处理分类相关的业务逻辑
 */
export const CategoriesService = {
  /**
   * 创建分类
   */
  async createCategory(data: CategoryModel["Create"]) {
    const [newCategory] = await db
      .insert(categoriesTable)
      .values(data)
      .returning();
    return newCategory;
  },

  /**
   * 更新分类
   */
  async updateCategory(id: string, data: CategoryModel["Update"]) {
    const [updatedCategory] = await db
      .update(categoriesTable)
      .set(data)
      .where(eq(categoriesTable.id, id))
      .returning();
    return updatedCategory;
  },
  /**
   * 获取分类树形结构（已本地化）
   */
  async getCategoryTree(
    locale: SupportedLocale = "zh-CN"
  ): Promise<TreeNode<CategoryModel["Entity"]>[]> {
    const categories = await db
      .select()
      .from(categoriesTable)
      .orderBy(asc(categoriesTable.sortOrder));

    // 并行翻译所有节点
    const translatedCategories = await Promise.all(
      categories.map(async (cat) => {
        const translated = await translateService.translateCategory(
          cat,
          locale
        );
        return translated;
      })
    );

    return buildTree(translatedCategories, "id", "parentId");
  },
  /**
   * 获取管理端分类树（原始数据，不翻译）
   */
  async getAdminCategoryTree() {
    const categories = await db
      .select()
      .from(categoriesTable)
      .orderBy(asc(categoriesTable.sortOrder));
    return buildTree(categories, "id", "parentId");
  },

  /**
   * 根据 slug 获取分类详情（已翻译）
   */
  async getCategoryBySlug(slug: string, locale: SupportedLocale = "zh-CN") {
    const [category] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.slug, slug));

    if (!category) {
      throw new HttpError.NotFound("分类不存在");
    }

    // 使用新方法翻译
    return translateService.translateCategory(category, locale);
  },

  /**
   * 根据 ID 获取分类详情（已翻译）
   */
  async getCategoryById(id: string, locale: SupportedLocale = "zh-CN") {
    const [category] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, id));

    if (!category) {
      throw new HttpError.NotFound("分类不存在");
    }

    return translateService.translateCategory(category, locale);
  },

  /**
   * 批量删除分类：仅删除没有子分类的项，有子分类的自动跳过
   */
  async batchDelete(ids: string[]) {
    if (ids.length === 0) {
      return [];
    }

    return await db.transaction(async (tx) => {
      // 1. 找出哪些待删除的分类 **有子分类**
      const parentsWithChildren = await tx
        .select({ parentId: categoriesTable.parentId })
        .from(categoriesTable)
        .where(inArray(categoriesTable.parentId, ids))
        .groupBy(categoriesTable.parentId); // 去重

      const parentIdsWithChildren = new Set(
        parentsWithChildren.map((p) => p.parentId)
      );

      // 2. 过滤出“没有子分类”的 ID
      const safeToDeleteIds = ids.filter(
        (id) => !parentIdsWithChildren.has(id)
      );

      if (safeToDeleteIds.length === 0) {
        return []; // 全部都有子分类，一个都不删
      }

      // 3. 删除安全的分类
      const deleted = await tx
        .delete(categoriesTable)
        .where(inArray(categoriesTable.id, safeToDeleteIds))
        .returning();

      return deleted;
    });
  },
};
