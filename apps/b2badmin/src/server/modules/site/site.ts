import { SiteTModel } from "@repo/contract";
import {
  siteCategoriesTable,
  siteProductsTable,
  sitesTable,
  userSitePermissionsTable,
} from "@repo/contract/table";
import { and, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { dbPlugin } from "@/server/db/connection";
import {
  isExporterSite,
  isFactorySite,
  siteContextMiddleware,
} from "@/server/plugins/site-context";

export const siteRoute = new Elysia({
  prefix: "/site",
  tags: ["Site Management"],
})
  .use(siteContextMiddleware)
  // 获取当前站点信息
  .use(dbPlugin)
  .get(
    "/current",
    async ({ siteContext }) => ({
      data: {
        site: siteContext.site,
        entity: siteContext.entity,
      },
    }),
    {
      detail: {
        summary: "获取当前站点信息",
        description: "获取当前请求的站点详细信息",
      },
    }
  )
  // 站点管理 - 只有超级管理员可以访问
  .group("/admin", (app) =>
    app
      // 创建站点
      .post(
        "/",
        async ({ body, db }) => {
          // 验证entityId是否存在
          let entity;
          if (body.siteType === "factory") {
            entity = await db.query.factoriesTable.findFirst({
              where: {
                id: body.entityId,
              },
            });
          } else {
            entity = await db.query.exportersTable.findFirst({
              where: {
                id: body.entityId,
              },
            });
          }

          if (!entity) {
            throw new Error("关联的实体不存在");
          }

          // 检查域名是否已存在
          const existingSite = await db.query.sitesTable.findFirst({
            where: {
              domain: body.domain,
            },
          });

          if (existingSite) {
            throw new Error("域名已存在");
          }

          const [site] = await db.insert(sitesTable).values(body).returning();

          return { data: site };
        },
        {
          body: SiteTModel.Insert,
          detail: {
            summary: "创建站点",
            description: "创建新的站点",
          },
        }
      )
      // 站点列表
      .get(
        "/",
        async ({ query, db }) => {
          // 使用关系查询替换手动 JOIN
          const sites = await db.query.sitesTable.findMany({
            where: () => {
              const conditions = {};
              if (query.siteType) {
                conditions.siteType = query.siteType;
              }
              if (query.isActive !== undefined) {
                conditions.isActive = query.isActive;
              }
              if (query.entityId) {
                conditions.entityId = query.entityId;
              }
              return conditions;
            },
            with: {
              entity: true, // 使用关系自动获取关联的工厂或出口商
            },
            orderBy: { createdAt: "desc" },
            limit: query.limit || 50,
            offset: query.offset || 0,
          });

          return { data: sites };
        },
        {
          query: SiteTModel.ListQuery,
          detail: {
            summary: "获取站点列表",
            description: "获取所有站点列表（管理员专用）",
          },
        }
      )
      // 更新站点
      .patch(
        "/:siteId",
        async ({ params, body }) => {
          const { siteId } = params;

          // 如果更新域名，检查是否重复
          if (body.domain) {
            const existingSite = await db.query.sitesTable.findFirst({
              where: {
                domain: body.domain,
                id: { not: siteId }, // 排除当前站点
              },
            });

            if (existingSite) {
              throw new Error("域名已存在");
            }
          }

          const [updatedSite] = await db
            .update(sitesTable)
            .set({ ...body, updatedAt: new Date() })
            .where(eq(sitesTable.id, siteId))
            .returning();

          if (!updatedSite) {
            throw new Error("站点不存在");
          }

          return { data: updatedSite };
        },
        {
          params: t.Object({
            siteId: t.String(),
          }),
          body: SiteTModel.Patch,
          detail: {
            summary: "更新站点",
            description: "更新站点信息",
          },
        }
      )
      // 删除站点
      .delete(
        "/:siteId",
        async ({ params }) => {
          const { siteId } = params;

          // 检查是否有数据依赖
          const categories = await db.query.siteCategoriesTable.findFirst({
            where: {
              siteId: siteId,
            },
          });

          if (categories) {
            throw new Error("站点下还有分类，无法删除");
          }

          const products = await db.query.siteProductsTable.findFirst({
            where: {
              siteId: siteId,
            },
          });

          if (products) {
            throw new Error("站点下还有商品，无法删除");
          }

          await db.delete(sitesTable).where(eq(sitesTable.id, siteId));

          return { message: "站点已删除" };
        },
        {
          params: t.Object({
            siteId: t.String(),
          }),
          detail: {
            summary: "删除站点",
            description: "删除站点（需要先删除所有相关数据）",
          },
        }
      )
  )
  // 站点分类管理
  .group("/categories", (app) =>
    app
      // 创建分类
      .post(
        "/",
        async ({ body, siteContext }) => {
          // 验证父分类（如果有）
          if (body.parentId) {
            const parent = await db.query.siteCategoriesTable.findFirst({
              where: {
                id: body.parentId,
                siteId: siteContext.site.id,
              },
            });

            if (!parent) {
              throw new Error("父分类不存在或不属于当前站点");
            }
          }

          const [category] = await db
            .insert(siteCategoriesTable)
            .values({
              ...body,
              siteId: siteContext.site.id,
            })
            .returning();

          return { data: category };
        },
        {
          body: SiteTModel.CategoryCreate,
          detail: {
            summary: "创建站点分类",
            description: "在当前站点下创建新的分类",
          },
        }
      )
      // 获取分类树
      .get(
        "/tree",
        async ({ siteContext }) => {
          // 使用关系查询
          const categories = await db.query.siteCategoriesTable.findMany({
            where: {
              siteId: siteContext.site.id,
            },
            orderBy: { sortOrder: "asc" },
          });

          // 构建树形结构
          const buildTree = (items: any[], parentId: string | null = null) =>
            items
              .filter((item) => item.parentId === parentId)
              .map((item) => ({
                ...item,
                children: buildTree(items, item.id),
              }));

          const tree = buildTree(categories);

          return { data: tree };
        },
        {
          detail: {
            summary: "获取分类树",
            description: "获取当前站点的分类树结构",
          },
        }
      )
      // 更新分类
      .patch(
        "/:categoryId",
        async ({ params, body, siteContext }) => {
          const { categoryId } = params;

          // 验证分类属于当前站点
          const existing = await db.query.siteCategoriesTable.findFirst({
            where: {
              id: categoryId,
              siteId: siteContext.site.id,
            },
          });

          if (!existing) {
            throw new Error("分类不存在");
          }

          // 验证父分类（如果有）
          if (body.parentId) {
            if (body.parentId === categoryId) {
              throw new Error("不能将自己设为父分类");
            }

            const parent = await db.query.siteCategoriesTable.findFirst({
              where: {
                id: body.parentId,
                siteId: siteContext.site.id,
              },
            });

            if (!parent) {
              throw new Error("父分类不存在或不属于当前站点");
            }
          }

          const [updated] = await db
            .update(siteCategoriesTable)
            .set({ ...body, updatedAt: new Date() })
            .where(eq(siteCategoriesTable.id, categoryId))
            .returning();

          return { data: updated };
        },
        {
          params: t.Object({
            categoryId: t.String(),
          }),
          body: t.Partial(SiteTModel.CategoryCreate),
          detail: {
            summary: "更新分类",
            description: "更新站点分类信息",
          },
        }
      )
      // 删除分类
      .delete(
        "/:categoryId",
        async ({ params, siteContext }) => {
          const { categoryId } = params;

          // 检查是否有子分类
          const children = await db.query.siteCategoriesTable.findFirst({
            where: {
              parentId: categoryId,
            },
          });

          if (children) {
            throw new Error("请先删除子分类");
          }

          // 检查是否有商品使用此分类
          const products = await db.query.siteProductsTable.findFirst({
            where: {
              siteCategoryId: categoryId,
            },
          });

          if (products) {
            throw new Error("分类下还有商品，无法删除");
          }

          await db
            .delete(siteCategoriesTable)
            .where(eq(siteCategoriesTable.id, categoryId));

          return { message: "分类已删除" };
        },
        {
          params: t.Object({
            categoryId: t.String(),
          }),
          detail: {
            summary: "删除分类",
            description: "删除站点分类",
          },
        }
      )
  )
  // 站点商品管理
  .group("/products", (app) =>
    app
      // 添加商品到站点
      .post(
        "/",
        async ({ body, siteContext }) => {
          // 验证商品存在
          const product = await db.query.productsTable.findFirst({
            where: {
              id: body.productId,
            },
            with: {
              factory: true, // 获取工厂信息用于权限验证
            },
          });

          if (!product) {
            throw new Error("商品不存在");
          }

          // 验证商品工厂权限
          if (isFactorySite(siteContext)) {
            // 工厂站点只能添加自己的商品
            if (product.factoryId !== siteContext.entity.id) {
              throw new Error("只能添加自己工厂的商品");
            }
          } else if (isExporterSite(siteContext)) {
            // 出口商站点只能添加下属工厂的商品
            const factories = await db.query.factoriesTable.findMany({
              where: {
                exporter_id: siteContext.entity.id,
              },
            });

            const factoryIds = factories.map((f) => f.id);
            if (!factoryIds.includes(product.factoryId)) {
              throw new Error("只能添加下属工厂的商品");
            }
          }

          // 验证分类（如果有）
          if (body.siteCategoryId) {
            const category = await db.query.siteCategoriesTable.findFirst({
              where: {
                id: body.siteCategoryId,
                siteId: siteContext.site.id,
              },
            });

            if (!category) {
              throw new Error("分类不存在或不属于当前站点");
            }
          }

          // 检查是否已存在
          const existing = await db.query.siteProductsTable.findFirst({
            where: {
              siteId: siteContext.site.id,
              product_id: body.productId,
            },
          });

          if (existing) {
            throw new Error("商品已存在于站点中");
          }

          const [siteProduct] = await db
            .insert(siteProductsTable)
            .values({
              ...body,
              siteId: siteContext.site.id,
            })
            .returning();

          return { data: siteProduct };
        },
        {
          body: SiteTModel.ProductCreate,
          detail: {
            summary: "添加商品到站点",
            description: "将商品添加到当前站点",
          },
        }
      )
      // 获取站点商品列表
      .get(
        "/",
        async ({ query, siteContext }) => {
          // 使用关系查询替换手动 JOIN
          const siteProducts = await db.query.siteProductsTable.findMany({
            where: {
              siteId: siteContext.site.id,
              isVisible: true,
              ...(query.category_id && { siteCategoryId: query.category_id }),
              ...(query.isFeatured !== undefined && {
                isFeatured: query.isFeatured,
              }),
            },
            with: {
              product: {
                with: {
                  factory: true, // 通过关系获取工厂信息
                },
              },
              siteCategory: true, // 获取站点分类信息
            },
            orderBy: { sortOrder: "asc" },
            limit: query.limit || 20,
            offset: query.offset || 0,
          });

          return { data: siteProducts };
        },
        {
          query: SiteTModel.ProductListQuery,
          detail: {
            summary: "获取站点商品列表",
            description: "获取当前站点展示的商品列表",
          },
        }
      )
      // 更新站点商品
      .patch(
        "/:siteProductId",
        async ({ params, body, siteContext }) => {
          const { siteProductId } = params;

          // 验证商品属于当前站点
          const existing = await db.query.siteProductsTable.findFirst({
            where: {
              id: siteProductId,
              siteId: siteContext.site.id,
            },
          });

          if (!existing) {
            throw new Error("商品不存在或不属于当前站点");
          }

          const [updated] = await db
            .update(siteProductsTable)
            .set({ ...body, updatedAt: new Date() })
            .where(eq(siteProductsTable.id, siteProductId))
            .returning();

          return { data: updated };
        },
        {
          params: t.Object({
            siteProductId: t.String(),
          }),
          body: t.Partial(SiteTModel.ProductCreate),
          detail: {
            summary: "更新站点商品",
            description: "更新商品在站点中的展示信息",
          },
        }
      )
      // 从站点移除商品
      .delete(
        "/:siteProductId",
        async ({ params, siteContext }) => {
          const { siteProductId } = params;

          // 验证商品属于当前站点
          const existing = await db.query.siteProductsTable.findFirst({
            where: {
              id: siteProductId,
              siteId: siteContext.site.id,
            },
          });

          if (!existing) {
            throw new Error("商品不存在或不属于当前站点");
          }

          await db
            .delete(siteProductsTable)
            .where(eq(siteProductsTable.id, siteProductId));

          return { message: "商品已从站点移除" };
        },
        {
          params: t.Object({
            siteProductId: t.String(),
          }),
          detail: {
            summary: "移除商品",
            description: "从站点中移除商品",
          },
        }
      )
  )
  // 用户站点权限管理
  .group("/permissions", (app) =>
    app
      // 授予用户站点权限
      .post(
        "/",
        async ({ body, siteContext }) => {
          // 验证用户存在
          const user = await db.query.usersTable.findFirst({
            where: {
              id: body.userId,
            },
          });

          if (!user) {
            throw new Error("用户不存在");
          }

          // 检查是否已存在
          const existing = await db.query.userSitePermissionsTable.findFirst({
            where: {
              userId: body.userId,
              siteId: siteContext.site.id,
            },
          });

          if (existing) {
            // 更新现有权限
            const [updated] = await db
              .update(userSitePermissionsTable)
              .set({ role: body.role, updatedAt: new Date() })
              .where(
                and(
                  eq(userSitePermissionsTable.userId, body.userId),
                  eq(userSitePermissionsTable.siteId, siteContext.site.id)
                )
              )
              .returning();

            return { data: updated };
          }

          // 创建新权限
          const [permission] = await db
            .insert(userSitePermissionsTable)
            .values({
              userId: body.userId,
              siteId: siteContext.site.id,
              role: body.role,
            })
            .returning();

          return { data: permission };
        },
        {
          body: SiteTModel.PermissionCreate,
          detail: {
            summary: "授予站点权限",
            description: "授予用户在当前站点的权限",
          },
        }
      )
      // 获取站点用户权限列表
      .get(
        "/",
        async ({ siteContext }) => {
          // 使用关系查询替换手动 JOIN
          const permissions = await db.query.userSitePermissionsTable.findMany({
            where: {
              siteId: siteContext.site.id,
            },
            with: {
              user: true, // 通过关系获取用户信息
            },
            orderBy: { createdAt: "desc" },
          });

          return { data: permissions };
        },
        {
          detail: {
            summary: "获取权限列表",
            description: "获取当前站点的所有用户权限",
          },
        }
      )
      // 撤销权限
      .delete(
        "/:userId",
        async ({ params, siteContext }) => {
          const { userId } = params;

          await db
            .delete(userSitePermissionsTable)
            .where(
              and(
                eq(userSitePermissionsTable.userId, userId),
                eq(userSitePermissionsTable.siteId, siteContext.site.id)
              )
            );

          return { message: "权限已撤销" };
        },
        {
          params: t.Object({
            userId: t.String(),
          }),
          detail: {
            summary: "撤销权限",
            description: "撤销用户在当前站点的权限",
          },
        }
      )
  );
