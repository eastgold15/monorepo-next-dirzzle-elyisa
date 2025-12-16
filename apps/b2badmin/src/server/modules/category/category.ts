import { CategoryModel, TreeNode } from "@repo/contract";
import { categoriesTable } from "@repo/contract/table";
import { asc, eq, inArray } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { db, dbPlugin } from "@/server/db/connection";
import { localeMiddleware } from "@/server/plugins/locale";
import { commonRes } from "@/server/utils/Res";
import { buildTree } from "@/server/utils/buildTree";
import type { SupportedLocale } from "@/server/plugins/locale";
import { translateService } from "../translations/translate.service";

// 创建分类
async function createCategory(data: CategoryModel["Create"]) {
  const [newCategory] = await db
    .insert(categoriesTable)
    .values(data)
    .returning();
  return newCategory;
}

// 更新分类
async function updateCategory(id: string, data: CategoryModel["Update"]) {
  const [updatedCategory] = await db
    .update(categoriesTable)
    .set(data)
    .where(eq(categoriesTable.id, id))
    .returning();
  return updatedCategory;
}

// 获取分类树形结构（已本地化）
async function getCategoryTree(
  locale: SupportedLocale = "zh-CN"
): Promise<TreeNode<CategoryModel["Entity"]>[]> {
  const categories = await db.query.categoriesTable.findMany({
    orderBy: { sortOrder: "asc" },
  });

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
}

// 获取管理端分类树（原始数据，不翻译）
async function getAdminCategoryTree() {
  const categories = await db.query.categoriesTable.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return buildTree(categories, "id", "parentId");
}

// 根据 slug 获取分类详情（已翻译）
async function getCategoryBySlug(slug: string, locale: SupportedLocale = "zh-CN") {
  const category = await db.query.categoriesTable.findFirst({
    where: { slug },
  });

  if (!category) {
    throw new HttpError.NotFound("分类不存在");
  }

  // 使用新方法翻译
  return translateService.translateCategory(category, locale);
}

// 根据 ID 获取分类详情（已翻译）
async function getCategoryById(id: string, locale: SupportedLocale = "zh-CN") {
  const category = await db.query.categoriesTable.findFirst({
    where: { id },
  });

  if (!category) {
    throw new HttpError.NotFound("分类不存在");
  }

  return translateService.translateCategory(category, locale);
}

// 批量删除分类：仅删除没有子分类的项，有子分类的自动跳过
async function batchDelete(ids: string[]) {
  if (ids.length === 0) {
    return [];
  }

  return await db.transaction(async (tx) => {
    // 1. 找出哪些待删除的分类 **有子分类**
    const parentsWithChildren = await tx.query.categoriesTable.findMany({
      where: { parentId: { in: ids } },
      columns: { parentId: true },
      distinct: ["parentId"],
    });

    const parentIdsWithChildren = new Set(
      parentsWithChildren.map((p) => p.parentId).filter(Boolean)
    );

    // 2. 过滤出"没有子分类"的 ID
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
}

/**
 * 分类控制器
 * 处理分类相关的HTTP请求
 */
export const categoriesController = new Elysia({
  prefix: "/categories",
  tags: ["Categories"],
})
  .use(dbPlugin)
  .use(localeMiddleware)
  .get(
    "/tree",
    async () => {
      const result = await getAdminCategoryTree();
      return commonRes(result, 200, "获取管理端分类树形列表成功");
    },
    {
      detail: {
        tags: ["Categories"],
        summary: "获取管理端分类树形列表",
        description:
          "获取所有分类的树形结构列表，返回原始多语言数据，用于管理端显示所有语言内容。",
      },
    }
  )
  // 根据slug获取分类详情
  .get(
    "/slug/:slug",
    async ({ params: { slug }, locale }) => {
      const category = await getCategoryBySlug(slug, locale);
      return commonRes(category, 200, "根据slug获取分类详情成功");
    },
    {
      params: t.Object({
        slug: t.String(),
      }),
      detail: {
        tags: ["Categories"],
        summary: "根据slug获取分类详情",
        description:
          "根据slug获取分类详情，会根据Accept-Language头部返回对应语言的内容。",
      },
    }
  )
  // 获取分类树形列表 - 前端用户使用
  .get(
    "/",
    async ({ locale }) => {
      console.log("获取分类树形列表，当前语言:", locale);
      const result = await getCategoryTree(locale);
      return commonRes(result, 200, "获取分类树形列表成功");
    },
    {
      detail: {
        tags: ["Categories"],
        summary: "获取分类树形列表",
        description:
          "获取所有分类的树形结构列表，支持搜索和筛选，主要用于管理端。会根据Accept-Language头部返回对应语言的内容。",
      },
    }
  )

  // 参数路由（必须放在最后）
  // 根据ID获取分类详情
  .get(
    "/:id",
    async ({ params: { id }, locale }) => {
      const category = await getCategoryById(id, locale);
      return commonRes(category, 200, "获取分类详情成功");
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Categories"],
        summary: "获取分类详情",
        description:
          "根据ID获取分类详情，会根据Accept-Language头部返回对应语言的内容。",
      },
    }
  )
  // 更新分类
  .put(
    "/:id",
    async ({ params: { id }, body }) => {
      const updatedCategory = await updateCategory(id, body);
      return commonRes(updatedCategory, 200, "分类更新成功");
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: CategoryModel.Patch,
      detail: {
        tags: ["Categories"],
        summary: "更新分类",
        description: "更新分类",
      },
    }
  )
  //批量删除分类
  .delete(
    "/batchDelete",
    async ({ body: { ids } }) => {
      const _res = await batchDelete(ids);
      return commonRes(_res, 204, "分类删除成功");
    },
    {
      body: t.Object({
        ids: t.Array(t.String()),
      }),
      detail: {
        tags: ["Categories"],
        summary: "批量删除分类",
        description: "删除指定分类，删除前会检查是否有子分类",
      },
    }
  )
  // 创建分类 - RESTful标准设计（放在最后，避免与其他路由冲突）
  .post(
    "/",
    async ({ body }) => {
      const newCategory = await createCategory(body);
      return commonRes(newCategory, 201, "分类创建成功");
    },
    {
      body: CategoryModel.Create,
      detail: {
        tags: ["Categories"],
        summary: "创建分类",
        description: "创建分类",
      },
    }
  );