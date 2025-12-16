import {
  SiteTModel,
  siteCategoriesTable,
  siteProductsTable,
  sitesTable
} from "@repo/contract";
import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { dbPlugin } from "~/db/connection";
import { adminAuthPlugin } from "~/plugins/admin-auth.plugin";


export const siteRoute = new Elysia({
  prefix: "/site",
  tags: ["Site Management"],
})
  .use(dbPlugin)
  .use(adminAuthPlugin)

  // 获取用户可访问的站点列表
  .get(
    "/accessible",
    async ({ user, db }) => {
      try {
        // 超级管理员可以访问所有站点
        if (user.isSuperAdmin) {
          const allSites = await db.query.sitesTable.findMany({
            where: {
              isActive: true,
            },
            with: {
              factoryOwner: {
                columns: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
              exporterOwner: {
                columns: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          });

          const formattedSites = allSites.map((site) => ({
            site: {
              ...site,
              factory: site.factoryOwner,
              exporter: site.exporterOwner,
            },
            role: {
              name: "SUPER_ADMIN",
              priority: 100,
            },
            priority: 100,
          }));

          return { sites: formattedSites };
        }

        // 普通用户只能访问被分配了角色的站点
        const userSites = await db.query.userSiteRolesTable.findMany({
          where: {
            userId: user.id,
          },
          with: {
            site: {
              with: {
                factoryOwner: {
                  columns: {
                    id: true,
                    name: true,
                    code: true,
                  },
                },
                exporterOwner: {
                  columns: {
                    id: true,
                    name: true,
                    code: true,
                  },
                },
              },
            },
            role: {
              columns: {
                id: true,
                name: true,
                description: true,
                type: true,
                priority: true,
                parentRoleId: true,
              },
            },
          },
        });

        // 过滤出活跃站点并按角色优先级排序
        const filteredSites = userSites
          .filter((userSite) => userSite.site.isActive)
          .sort((a, b) => b.role.priority - a.role.priority);

        const formattedSites = filteredSites.map((item) => ({
          site: {
            ...item.site,
            factory: item.site.factoryOwner,
            exporter: item.site.exporterOwner,
          },
          role: {
            name: item.role.name,
            priority: item.role.priority,
          },
          priority: item.role.priority,
        }));

        return { sites: formattedSites };
      } catch (error) {
        console.error("获取可访问站点失败", error);
        throw new HttpError.InternalServerError("获取可访问站点失败");
      }
    },
    {
      auth: true,
      detail: {
        summary: "获取可访问站点列表",
        description: "获取用户有权限访问的所有站点，包括角色信息",
      },
    }
  )

  // 切换当前站点
  .post(
    "/switch",
    async ({ body, db, user, currentSite, allSites }) => {
      try {
        const { siteId } = body;

        // 验证站点存在
        const targetSite = await db.query.sitesTable.findFirst({
          where: {
            id: siteId,
          },
          with: {
            factoryOwner: {
              columns: {
                id: true,
                name: true,
                code: true,
              },
            },
            exporterOwner: {
              columns: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        });

        if (!targetSite) {
          throw new HttpError.NotFound("站点不存在");
        }

        if (!targetSite.isActive) {
          throw new HttpError.BadRequest("站点已停用");
        }

        // 验证用户权限
        if (!user.isSuperAdmin) {
          const userSiteRole = await db.query.userSiteRolesTable.findFirst({
            where: {
              userId: user.id,
              siteId,
            },
            with: {
              role: {
                columns: {
                  id: true,
                  name: true,
                  priority: true,
                },
              },
            },
          });

          if (!userSiteRole) {
            throw new HttpError.Forbidden("您没有权限访问该站点");
          }
        }

        // 从 adminAuthPlugin 提供的 allSites 中找到切换后的站点信息
        const switchedSiteInfo = allSites.find(site => site.site.id === siteId);

        if (!switchedSiteInfo) {
          throw new HttpError.Forbidden("您没有权限访问该站点");
        }

        // 返回与 /me 接口相同的数据格式
        return {
          user,
          currentSite: {
            ...targetSite,
            factory: targetSite.factoryOwner,
            exporter: targetSite.exporterOwner,
          },
          tenantId: targetSite.siteType === "factory"
            ? targetSite.factoryId
            : targetSite.exporterId,
          tenantType: targetSite.siteType,
          allSites: allSites,
          roles: switchedSiteInfo.role.name,
          permissions: [], // 这里可以根据需要添加权限信息
          can: () => true, // 临时处理
        };
      } catch (error) {
        if (error && typeof error === 'object' && 'constructor' in error && error.constructor.name === 'HttpError') {
          throw error;
        }
        console.error("站点切换失败", error);
        throw new HttpError.InternalServerError("站点切换失败");
      }
    },
    {
      auth: true,
      body: SiteTModel.SwitchRequest,
      detail: {
        summary: "切换当前站点",
        description: "切换用户当前操作的站点，更新session中的站点上下文",
      },
    }
  )
  // 站点管理 - 超级管理员可以管理所有站点，出口商可以管理旗下工厂站点，工厂管理员可以管理自己的站点
  .group("/admin", (app) =>

    app
      .use(adminAuthPlugin)
      // 创建站点
      .post(
        "/",
        async ({ body, db, role, tenantId, tenantType }) => {
          // 验证权限
          // 超级管理员可以创建任何类型的站点
          // 出口商管理员只能创建工厂类型的站点
          // 工厂管理员不能创建站点
          if (role === "factory_admin") {
            throw new HttpError.Forbidden("工厂管理员不能创建站点");
          }

          // 使用数据库 Insert 类型
          const siteData = {
            name: body.name,
            domain: body.domain,
            siteType: body.siteType,
            factoryId: body.factoryId,
            exporterId: body.exporterId,
            isActive: body.isActive ?? true,
          };

          // 检查域名是否已存在
          const existingSite = await db.query.sitesTable.findFirst({
            where: {
              domain: body.domain,
            },
          });

          if (existingSite) {
            throw new HttpError.BadRequest("域名已存在");
          }

          const [site] = await db.insert(sitesTable).values(siteData).returning();

          return { data: site };
        },
        {
          auth: true,
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
          const whereConditions: any = {};

          if (query.siteType) {
            whereConditions.siteType = query.siteType;
          }
          if (query.isActive !== undefined) {
            whereConditions.isActive = query.isActive;
          }
          // Drizzle 1.0 doesn't support OR in where objects directly for findMany
          // We'll handle this differently or use a raw query if needed
          if (query.entityId) {
            // This might need special handling for OR condition
            whereConditions.factoryId = query.entityId;
          }

          const sites = await db.query.sitesTable.findMany({
            where: whereConditions,
            with: {
              factoryOwner: {
                columns: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
              exporterOwner: {
                columns: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
            limit: query.limit || 50,
            offset: query.offset || 0,
          });

          return { data: sites };
        },
        {
          auth: true,
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
        async ({ params, body, db, role, tenantId }) => {
          const { siteId } = params;

          // 验证权限
          // 超级管理员可以管理任何站点
          // 出口商管理员可以管理自己旗下工厂的站点
          // 工厂管理员可以管理自己的站点
          const site = await db.query.sitesTable.findFirst({
            where: {
              id: siteId,
            },
            with: {
              factoryOwner: {
                columns: { id: true, exporterId: true },
              },
            },
          });

          if (!site) {
            throw new HttpError.NotFound("站点不存在");
          }

          if (role === "factory_admin") {
            // 工厂管理员只能管理自己的站点
            if (site.siteType !== "factory" || site.factoryId !== tenantId) {
              throw new HttpError.Forbidden("您没有权限管理此站点");
            }
          } else if (role === "exporter_admin") {
            // 出口商管理员只能管理自己旗下工厂的站点或自己的站点
            if (site.siteType === "factory") {
              if (!site.factoryOwner || site.factoryOwner.exporterId !== tenantId) {
                throw new HttpError.Forbidden("您没有权限管理此工厂站点");
              }
            } else if (site.siteType === "exporter") {
              if (site.exporterId !== tenantId) {
                throw new HttpError.Forbidden("您没有权限管理此站点");
              }
            }
          }

          // 如果更新域名，检查是否重复
          if (body.domain) {
            const existingSite = await db.query.sitesTable.findFirst({
              where: {
                domain: body.domain,
                isActive: true,
              },
            });

            if (existingSite && existingSite.id !== siteId) {
              throw new HttpError.BadRequest("域名已存在");
            }
          }

          const updatedSite = await db
            .update(sitesTable)
            .set({ ...body, updatedAt: new Date() })
            .where(eq(sitesTable.id, siteId))
            .returning();

          if (!updatedSite[0]) {
            throw new HttpError.NotFound("站点不存在");
          }

          return { data: updatedSite[0] };
        },
        {
          auth: true,
          params: t.Object({
            siteId: t.String(),
          }),
          body: SiteTModel.Update,
          detail: {
            summary: "更新站点",
            description: "更新站点信息",
          },
        }
      )
      // 删除站点
      .delete(
        "/:siteId",
        async ({ params, db, role, tenantId }) => {
          const { siteId } = params;

          // 验证权限（与更新站点相同的逻辑）
          const site = await db.query.sitesTable.findFirst({
            where: {
              id: siteId,
            },
            with: {
              factoryOwner: {
                columns: { id: true, exporterId: true },
              },
            },
          });

          if (!site) {
            throw new HttpError.NotFound("站点不存在");
          }

          if (role === "factory_admin") {
            // 工厂管理员只能删除自己的站点
            if (site.siteType !== "factory" || site.factoryId !== tenantId) {
              throw new HttpError.Forbidden("您没有权限删除此站点");
            }
          } else if (role === "exporter_admin") {
            // 出口商管理员只能删除自己旗下工厂的站点或自己的站点
            if (site.siteType === "factory") {
              if (!site.factoryOwner || site.factoryOwner.exporterId !== tenantId) {
                throw new HttpError.Forbidden("您没有权限删除此工厂站点");
              }
            } else if (site.siteType === "exporter") {
              if (site.exporterId !== tenantId) {
                throw new HttpError.Forbidden("您没有权限删除此站点");
              }
            }
          }

          // 检查是否有数据依赖
          const categories = await db.query.siteCategoriesTable.findFirst({
            where: {
              siteId,
            },
          });

          if (categories) {
            throw new HttpError.BadRequest("站点下还有分类，无法删除");
          }

          const products = await db.query.siteProductsTable.findFirst({
            where: {
              siteId,
            },
          });

          if (products) {
            throw new HttpError.BadRequest("站点下还有商品，无法删除");
          }

          await db.delete(sitesTable).where(eq(sitesTable.id, siteId));

          return { message: "站点已删除" };
        },
        {
          auth: true,
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
      .use(adminAuthPlugin)
      // 创建分类
      .post(
        "/",
        async ({ body, currentSite, db }) => {
          if (!currentSite?.id) {
            throw new HttpError.Unauthorized("需要选择站点");
          }

          // 验证父分类（如果有）
          if (body.parentId) {
            const parent = await db.query.siteCategoriesTable.findFirst({
              where: {
                id: body.parentId,
                siteId: currentSite.id,
              },
            });

            if (!parent) {
              throw new HttpError.NotFound("父分类不存在或不属于当前站点");
            }
          }

          const [category] = await db
            .insert(siteCategoriesTable)
            .values({
              ...body,
              siteId: currentSite.id,
            })
            .returning();

          return { data: category };
        },
        {
          auth: true,
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
        async ({ currentSite, db }) => {
          if (!currentSite?.id) {
            throw new HttpError.Unauthorized("需要选择站点");
          }

          // 使用关系查询
          const categories = await db.query.siteCategoriesTable.findMany({
            where: {
              siteId: currentSite.id,
            },
            orderBy: { sortOrder: "asc" },
          });

          // 构建树形结构
          const buildTree = (items: any[], parentId: string | null = null): any[] =>
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
          auth: true,
          detail: {
            summary: "获取分类树",
            description: "获取当前站点的分类树结构",
          },
        }
      )
      // 更新分类
      .patch(
        "/:categoryId",
        async ({ params, body, currentSite, db }) => {
          const { categoryId } = params;

          if (!currentSite?.id) {
            throw new HttpError.Unauthorized("需要选择站点");
          }

          // 验证分类属于当前站点
          const existing = await db.query.siteCategoriesTable.findFirst({
            where: {
              id: categoryId,
              siteId: currentSite.id,
            },
          });

          if (!existing) {
            throw new HttpError.NotFound("分类不存在");
          }

          // 验证父分类（如果有）
          if (body.parentId) {
            if (body.parentId === categoryId) {
              throw new HttpError.BadRequest("不能将自己设为父分类");
            }

            const parent = await db.query.siteCategoriesTable.findFirst({
              where: {
                id: body.parentId,
                siteId: currentSite.id,
              },
            });

            if (!parent) {
              throw new HttpError.NotFound("父分类不存在或不属于当前站点");
            }
          }

          const updated = await db
            .update(siteCategoriesTable)
            .set({ ...body, updatedAt: new Date() })
            .where(eq(siteCategoriesTable.id, categoryId))
            .returning();

          return { data: updated[0] };
        },
        {
          auth: true,
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
        async ({ params, currentSite, db }) => {
          const { categoryId } = params;

          if (!currentSite?.id) {
            throw new HttpError.Unauthorized("需要选择站点");
          }

          // 验证分类属于当前站点
          const existing = await db.query.siteCategoriesTable.findFirst({
            where: {
              id: categoryId,
              siteId: currentSite.id,
            },
          });

          if (!existing) {
            throw new HttpError.NotFound("分类不存在");
          }

          // 检查是否有子分类
          const children = await db.query.siteCategoriesTable.findFirst({
            where: {
              parentId: categoryId,
            },
          });

          if (children) {
            throw new HttpError.BadRequest("请先删除子分类");
          }

          // 检查是否有商品使用此分类
          const products = await db.query.siteProductsTable.findFirst({
            where: {
              siteCategoryId: categoryId,
            },
          });

          if (products) {
            throw new HttpError.BadRequest("分类下还有商品，无法删除");
          }

          await db.delete(siteCategoriesTable).where(
            eq(siteCategoriesTable.id, categoryId)
          );

          return { message: "分类已删除" };
        },
        {
          auth: true,
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
      .use(adminAuthPlugin)
      // 添加商品到站点
      .post(
        "/",
        async ({ body, currentSite, db }) => {
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

          // TODO: 根据站点类型添加权限验证逻辑
          // 工厂站点只能添加自己的商品
          // 出口商站点只能添加下属工厂的商品

          // 验证分类（如果有）
          if (body.siteCategoryId) {
            const category = await db.query.siteCategoriesTable.findFirst({
              where: {
                id: body.siteCategoryId,
                siteId: currentSite.id,
              },
            });

            if (!category) {
              throw new Error("分类不存在或不属于当前站点");
            }
          }

          // 检查是否已存在
          const existing = await db.query.siteProductsTable.findFirst({
            where: {
              siteId: currentSite.id,
              productId: body.productId,
            },
          });

          if (existing) {
            throw new Error("商品已存在于站点中");
          }

          const [siteProduct] = await db
            .insert(siteProductsTable)
            .values({
              siteId: currentSite.id,
              productId: body.productId,
              siteCategoryId: body.siteCategoryId || null,
              siteName: body.siteName || null,
              siteDescription: body.siteDescription || null,
              sitePrice: body.sitePrice ? body.sitePrice.toString() : null,
              sortOrder: body.sortOrder || 0,
              isVisible: body.isVisible ?? true,
              isFeatured: body.isFeatured ?? false,
              seoTitle: body.seoTitle || null,
            })
            .returning();

          return { data: siteProduct };
        },
        {
          auth: true,
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
        async ({ query, currentSite, db }) => {
          // 使用关系查询替换手动 JOIN
          const siteProducts = await db.query.siteProductsTable.findMany({
            where: {
              siteId: currentSite.id,
              ...(query.isVisible !== undefined && {
                isVisible: query.isVisible,
              }),
              ...(query.categoryId && { siteCategoryId: query.categoryId }),
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
          auth: true,
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
        async ({ params, body, currentSite, db }) => {
          const { siteProductId } = params;

          // 验证商品属于当前站点
          const existing = await db.query.siteProductsTable.findFirst({
            where: {
              id: siteProductId,
              siteId: currentSite.id,
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
          auth: true,
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
        async ({ params, currentSite, db }) => {
          const { siteProductId } = params;

          // 验证商品属于当前站点
          const existing = await db.query.siteProductsTable.findFirst({
            where: {
              id: siteProductId,
              siteId: currentSite.id,
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
          auth: true,
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