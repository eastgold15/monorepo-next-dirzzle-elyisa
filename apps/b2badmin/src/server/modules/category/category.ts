import { CategoryModel } from "@repo/contract";
import { Elysia, t } from "elysia";
import { localeMiddleware } from "@/server/plugins/locale";
import { commonRes } from "@/server/utils/Res";
import { CategoriesService } from "./category.service";

/**
 * 分类控制器
 * 处理分类相关的HTTP请求
 */
export const categoriesController = new Elysia({
  prefix: "/categories",
  tags: ["Categories"],
})
  .use(localeMiddleware)
  .get(
    "/tree",
    async () => {
      const result = await CategoriesService.getAdminCategoryTree();
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
      const category = await CategoriesService.getCategoryBySlug(slug, locale);
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
      const result = await CategoriesService.getCategoryTree(locale);
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
      const category = await CategoriesService.getCategoryById(id, locale);
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
      const updatedCategory = await CategoriesService.updateCategory(id, body);
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
    "batchDelete",
    async ({ body: { ids } }) => {
      const _res = await CategoriesService.batchDelete(ids);
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
      const newCategory = await CategoriesService.createCategory(body);
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
