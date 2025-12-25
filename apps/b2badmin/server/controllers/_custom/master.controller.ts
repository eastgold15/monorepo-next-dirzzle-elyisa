import { MasterContract, masterTable } from "@repo/contract";
import { eq, inArray } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";
import { masterService } from "~/modules/index";
import { buildTree } from "~/utils/buildTree";

export const masterController = new Elysia({
  prefix: "/master",
  tags: ["Master Category"],
})
  .use(authGuardMid)
  .use(dbPlugin)

  // 获取主分类树（包含业务逻辑）
  .get(
    "/tree",
    async ({ db }) => {
      // 获取所有主分类
      const categories = await db.query.masterTable.findMany({
        orderBy: {
          sortOrder: "asc",
          createdAt: "desc",
        },
      });

      // 构建树形结构
      const tree = buildTree(categories, "id", "parentId");

      return tree;
    },
    {
      detail: {
        summary: "获取主分类树",
        description: "获取主分类的树形结构，用于模板管理和商品分类",
        tags: ["Master Category"],
      },
    }
  )

  // 获取主分类列表（包含业务逻辑）
  .get(
    "/",
    async ({ query, db }) => {
      const { page = 1, limit = 50, parentId, search } = query;

      // 获取主分类列表
      const categories = await db.query.masterTable.findMany({
        where: {
          ...(parentId ? { parentId } : {}),
          ...(search ? { name: { like: `%${search}%` } } : {}),
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
      query: MasterContract.ListQuery,
      detail: {
        summary: "获取主分类列表",
        description: "分页获取主分类列表，支持按父分类筛选和搜索",
        tags: ["Master Category"],
      },
    }
  )

  // 创建主分类（包含业务逻辑）
  .post(
    "/",
    async ({ body, db }) => {
      const { name, slug, description, parentId, sortOrder, isActive, icon } =
        body;

      // 检查slug是否重复
      const existing = await db.query.masterTable.findFirst({
        where: {
          slug,
        },
      });

      if (existing) {
        throw new HttpError.Conflict("分类标识已存在");
      }

      // 检查父分类是否存在
      if (parentId) {
        const parent = await db.query.masterTable.findFirst({
          where: { id: parentId },
          columns: { id: true },
        });
        if (!parent) {
          throw new HttpError.NotFound("父分类不存在");
        }
      }

      // 创建主分类
      const [category] = await db
        .insert(masterTable)
        .values({
          name,
          slug,
          description,
          parentId,
          sortOrder: sortOrder || 0,
          isActive: isActive ?? true,
          icon: icon || "",
        })
        .returning();

      return category;
    },
    {
      body: MasterContract.Create,
      detail: {
        summary: "创建主分类",
        description: "创建新的主分类，用于模板管理和商品分类标准",
        tags: ["Master Category"],
      },
    }
  )

  // 更新主分类（包含业务逻辑）
  .put(
    "/:id",
    async ({ params: { id }, body, db }) => {
      const { name, slug, description, parentId, sortOrder, isActive, icon } =
        body;

      // 检查是否存在
      const existing = await db.query.masterTable.findFirst({
        where: { id },
      });

      if (!existing) {
        throw new HttpError.NotFound("主分类不存在");
      }

      // 检查slug是否重复（排除自己）
      if (slug && slug !== existing.slug) {
        const slugExists = await db.query.masterTable.findFirst({
          where: { slug },
        });

        if (slugExists && slugExists.id !== id) {
          throw new HttpError.Conflict("分类标识已存在");
        }
      }

      // 检查是否将自己的ID设为父分类（避免循环引用）
      if (parentId === id) {
        throw new HttpError.BadRequest("不能将自己设为父分类");
      }

      // 检查父分类是否存在
      if (parentId) {
        const parent = await db.query.masterTable.findFirst({
          where: { id: parentId },
          columns: { id: true },
        });
        if (!parent) {
          throw new HttpError.NotFound("父分类不存在");
        }
      }

      // 更新主分类
      const [category] = await db
        .update(masterTable)
        .set({
          name,
          slug,
          description,
          parentId,
          sortOrder: sortOrder || 0,
          isActive: isActive ?? true,
          icon: icon || "",
          updatedAt: new Date(),
        })
        .where(eq(masterTable.id, id))
        .returning();

      return category;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: MasterContract.Update,
      detail: {
        summary: "更新主分类",
        description: "更新主分类信息，包括名称、描述、父分类等",
        tags: ["Master Category"],
      },
    }
  )

  // 批量删除主分类（包含业务逻辑）
  .delete(
    "/batch",
    async ({ body: { ids }, db }) => {
      // 检查是否有子分类
      const childCategories = await db.query.masterTable.findMany({
        where: {
          parentId: { in: ids },
        },
        columns: { id: true },
      });

      if (childCategories.length > 0) {
        throw new HttpError.BadRequest("请先删除子分类");
      }

      // 删除主分类
      const result = await db
        .delete(masterTable)
        .where(inArray(masterTable.id, ids))
        .returning({ id: masterTable.id });

      if (!result.length) {
        throw new HttpError.NotFound("未找到要删除的主分类");
      }

      return {
        message: `成功删除 ${result.length} 个主分类`,
        count: result.length,
      };
    },
    {
      body: t.Object({
        ids: t.Array(t.String()),
      }),
      detail: {
        summary: "批量删除主分类",
        description: "批量删除主分类，需要先删除所有子分类",
        tags: ["Master Category"],
      },
    }
  )

  // 获取主分类详情
  .get(
    "/:id",
    async ({ params: { id }, db }) => {
      const category = await db.query.masterTable.findFirst({
        where: {
          id,
        },
        with: {
          children: {
            columns: {
              id: true,
              name: true,
              slug: true,
              sortOrder: true,
            },
            orderBy: { sortOrder: "asc" },
          },
        },
      });

      if (!category) {
        throw new HttpError.NotFound("主分类不存在");
      }

      return category;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: "获取主分类详情",
        description: "根据ID获取主分类详情，包括子分类信息",
        tags: ["Master Category"],
      },
    }
  )

  // 批量更新排序
  .patch(
    "/sort",
    async ({ body, db }) => {
      const { items } = body;

      // 批量更新排序
      await db.transaction(async (tx) => {
        for (const item of items) {
          await tx
            .update(masterTable)
            .set({ sortOrder: item.sortOrder })
            .where(eq(masterTable.id, item.id));
        }
      });

      return { message: "排序更新成功" };
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
        description: "批量更新主分类的排序值",
        tags: ["Master Category"],
      },
    }
  )

  // 标准的 CRUD 操作
  .delete(
    "/:id",
    ({ params, permissions, auth, db }) =>
      masterService.delete(params.id, { db, auth }),
    {
      allPermission: "MASTER_DELETE",
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "删除主分类",
        description: "删除指定的主分类（权限检查版）",
        tags: ["Master Category"],
      },
    }
  );
