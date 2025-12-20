import { SiteCategoriesContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";
import { siteCategoriesService } from "~/modules/index";

export const sitecategoriesController = new Elysia({
  prefix: "/sitecategories",
  tags: ["SiteCategories"],
})
  .use(authGuardMid)
  .use(dbPlugin)

  // 获取树形结构的分类列表
  .get(
    "/tree",
    async ({ db, auth, permissions }) => {
      if (!permissions.includes("SITECATEGORIES_VIEW"))
        throw new Error("Forbidden");

      return await siteCategoriesService.getTree({ db, auth });
    },
    {
      detail: {
        summary: "获取树形分类列表",
        description: "获取当前站点的树形结构分类列表",
        tags: ["SiteCategories"],
      },
    }
  )

  // 创建分类（支持层级关系）
  .post(
    "/",
    async ({ body, db, auth, permissions }) => {
      if (!permissions.includes("SITECATEGORIES_CREATE"))
        throw new Error("Forbidden");

      return await siteCategoriesService.createCategory(body, { db, auth });
    },
    {
      body: t.Object({
        name: t.String(),
        description: t.Optional(t.String()),
        parentId: t.Optional(t.String()),
        sortOrder: t.Optional(t.Number()),
        isActive: t.Optional(t.Boolean()),
      }),
      detail: {
        summary: "创建分类",
        description: "创建新的站点分类，支持设置父级分类",
        tags: ["SiteCategories"],
      },
    }
  )

  // 移动分类（更新父级关系）
  .patch(
    "/:id/move",
    async ({ params, body, db, auth, permissions }) => {
      if (!permissions.includes("SITECATEGORIES_EDIT"))
        throw new Error("Forbidden");

      const { newParentId } = body;
      return await siteCategoriesService.moveCategory(
        params.id,
        newParentId ?? null,
        { db, auth }
      );
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        newParentId: t.Optional(t.String()),
      }),
      detail: {
        summary: "移动分类",
        description: "将分类移动到新的父级下",
        tags: ["SiteCategories"],
      },
    }
  )

  // 批量更新排序
  .patch(
    "/sort",
    async ({ body, db, auth, permissions }) => {
      if (!permissions.includes("SITECATEGORIES_EDIT"))
        throw new Error("Forbidden");

      return await siteCategoriesService.updateSortOrder(body.items, {
        db,
        auth,
      });
    },
    {
      body: t.Object({
        items: t.Array(
          t.Object({
            id: t.String(),
            sortOrder: t.Number(),
          })
        ),
      }),
      detail: {
        summary: "批量更新分类排序",
        description: "批量更新分类的排序",
        tags: ["SiteCategories"],
      },
    }
  )

  // 切换分类激活状态
  .patch(
    "/:id/toggle",
    async ({ params, db, auth, permissions }) => {
      if (!permissions.includes("SITECATEGORIES_EDIT"))
        throw new Error("Forbidden");

      return await siteCategoriesService.toggleStatus(params.id, { db, auth });
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: "切换分类状态",
        description: "启用或禁用指定的分类",
        tags: ["SiteCategories"],
      },
    }
  )

  // 标准的 CRUD 操作
  .get(
    "/",
    ({ query, permissions, auth, db }) => {
      if (!permissions.includes("SITECATEGORIES_VIEW"))
        throw new Error("Forbidden");
      return siteCategoriesService.findAll(query, { db, auth });
    },
    {
      query: SiteCategoriesContract.ListQuery,
      detail: {
        summary: "获取分类列表",
        description: "分页获取分类列表（需要权限）",
        tags: ["SiteCategories"],
      },
    }
  )

  .get(
    "/:id",
    ({ params, permissions, auth, db }) => {
      if (!permissions.includes("SITECATEGORIES_VIEW"))
        throw new Error("Forbidden");
      return siteCategoriesService.findOne(params.id, { db, auth });
    },
    {
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "获取分类详情",
        description: "获取指定分类的详细信息（需要权限）",
        tags: ["SiteCategories"],
      },
    }
  )

  .patch(
    "/:id",
    ({ params, body, permissions, auth, db }) => {
      if (!permissions.includes("SITECATEGORIES_EDIT"))
        throw new Error("Forbidden");
      return siteCategoriesService.update(params.id, body, { db, auth });
    },
    {
      params: t.Object({ id: t.String() }),
      body: SiteCategoriesContract.Patch,
      detail: {
        summary: "更新分类信息",
        description: "更新指定分类的信息（需要权限）",
        tags: ["SiteCategories"],
      },
    }
  )

  .delete(
    "/:id",
    ({ params, permissions, auth, db }) => {
      if (!permissions.includes("SITECATEGORIES_DELETE"))
        throw new Error("Forbidden");
      return siteCategoriesService.delete(params.id, { db, auth });
    },
    {
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "删除分类",
        description: "删除指定的分类（需要权限）",
        tags: ["SiteCategories"],
      },
    }
  );
