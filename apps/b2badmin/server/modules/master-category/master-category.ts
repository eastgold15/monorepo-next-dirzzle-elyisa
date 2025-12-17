import { MasterCategoryTModel } from "@repo/contract";
import { MasterTable } from "@repo/contract/table";
import { eq, inArray } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { dbPlugin } from "~/db/connection";
import { adminAuthPlugin } from "~/plugins/admin-auth.plugin";
import { buildTree } from "~/utils/buildTree";

/**
 * 主分类管理接口
 * 主分类是全局的分类体系，由系统管理员维护
 * 站点分类通过 masterCategoryId 映射到主分类
 */
export const masterCategoryRoute = new Elysia({
  name: "master-category",
  prefix: "/master-category",
  tags: ["主分类管理"],
})
  .use(dbPlugin)
  .use(adminAuthPlugin)
  .get(
    "/tree",
    async ({ db, user }) => {
      if (!user.isSuperAdmin) {
        throw new HttpError.NotAcceptable("非超级管理员不能获取主分类树");
      }
      // 获取所有主分类
      const categories = await db.query.MasterTable.findMany({
        orderBy: {
          sortOrder: "asc",
          createdAt: "desc",
        },
      });

      // 构建树形结构
      const tree = buildTree(categories, "id", "parentId") as MasterCategoryTModel["TreeEntity"][];

      return tree
    },
    {
      auth: true,
      detail: {
        summary: "获取主分类树",
        description: "获取主分类的树形结构，用于模板管理和商品分类",
        tags: ["主分类管理"],
      },
    }
  )
  .get(
    "/",
    async ({ query, db }) => {
      const { page = 1, limit = 50, parentId, search } = query;

      // 获取主分类列表
      const categories = await db.query.MasterTable.findMany({
        where: {
          ...(parentId ? { parentId } : {}),
          name: { like: `%${search}%` },
        },
        orderBy: {
          sortOrder: "asc",
        },
        limit,
        offset: (page - 1) * limit,
      });
      return categories;
    },
    {
      detail: {
        summary: "获取主分类列表",
        description: "分页获取主分类列表，支持按父分类筛选",
        tags: ["主分类管理"],
      },
      query: MasterCategoryTModel.ListQuery,
    }
  )
  .post(
    "/",
    async ({ body, db }) => {
      const { name, slug, description, parentId, sortOrder, isVisible, icon } =
        body;

      // 检查slug是否重复
      const existing = await db.query.MasterTable.findFirst({
        where: {
          slug,
        },
      });

      if (existing) {
        throw new HttpError.Conflict("分类标识已存在");
      }

      // 创建主分类
      const [category] = await db
        .insert(MasterTable)
        .values({
          name,
          slug,
          description,
          parentId,
          sortOrder: sortOrder || 0,
          isVisible: isVisible ?? true,
          icon: icon || "",
        })
        .returning();

      return category;
    },
    {
      detail: {
        summary: "创建主分类",
        description: "创建新的主分类，用于模板管理和商品分类标准",
        tags: ["主分类管理"],
      },
      body: MasterCategoryTModel.Create,
    }
  )
  .put(
    "/update/:id",
    async ({ params: { id }, body, db }) => {
      const { name, slug, description, parentId, sortOrder, isVisible, icon } =
        body;

      // 检查slug是否重复（排除自己）
      if (slug) {
        const existing = await db.query.MasterTable.findFirst({
          where: {
            slug,
          },
        });

        if (existing && existing.id !== id) {
          throw new HttpError.Conflict("分类标识已存在");
        }
      }

      // 检查是否将自己的ID设为父分类（避免循环引用）
      if (parentId === id) {
        throw new HttpError.BadRequest("不能将自己设为父分类");
      }

      // 更新主分类
      const [category] = await db
        .update(MasterTable)
        .set({
          name,
          slug,
          description,
          parentId,
          sortOrder: sortOrder || 0,
          isVisible: isVisible ?? true,
          icon: icon || "",
          updatedAt: new Date(),
        })
        .where(eq(MasterTable.id, id))
        .returning();

      if (!category) {
        throw new HttpError.NotFound("主分类不存在");
      }

      return category;
    },
    {
      detail: {
        summary: "更新主分类",
        description: "更新主分类信息",
        tags: ["主分类管理"],
      },
      params: t.Object({
        id: t.String(),
      }),
      body: MasterCategoryTModel.Update,
    }
  )
  .delete(
    "/",
    async ({ body: { ids }, db }) => {
      // 检查是否有子分类
      const childCategories = await db.query.MasterTable.findMany({
        where: {
          id: {
            in: ids,
          },
        },
      });

      if (childCategories.length > 0) {
        throw new HttpError.BadRequest("请先删除子分类");
      }

      // 删除主分类
      const result = await db
        .delete(MasterTable)
        .where(inArray(MasterTable.id, ids))
        .returning();

      if (!result.length) {
        throw new HttpError.NotFound("未找到要删除的主分类");
      }

      return {
        message: "删除成功",
      };
    },
    {
      detail: {
        summary: "批量删除主分类",
        description: "批量删除主分类，需要先删除所有子分类",
        tags: ["主分类管理"],
      },
      body: t.Object({
        ids: t.Array(t.String()),
      }),
    }
  )
  .get(
    "/detail/:id",
    async ({ params: { id }, db }) => {
      const category = await db.query.MasterTable.findFirst({
        where: {
          id,
        },
      });

      if (!category) {
        throw new HttpError.NotFound("主分类不存在");
      }

      return category;
    },
    {
      detail: {
        summary: "获取主分类详情",
        description: "根据ID获取主分类详情",
        tags: ["主分类管理"],
      },
      params: t.Object({
        id: t.String(),
      }),
    }
  );
