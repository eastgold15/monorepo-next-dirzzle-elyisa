import { SiteTModel, sitesTable } from "@repo/contract";
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

        const formattedSites = allSites.map((currentSite) => ({
          currentSite: {
            ...currentSite,
            factory: currentSite.factoryOwner,
            exporter: currentSite.exporterOwner,
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
    },
    {

      allRoles: ['*'],
      detail: {
        summary: "获取可访问站点列表",
        description: "获取用户有权限访问的所有站点，包括角色信息",
      },
    }
  )


  // 站点管理 - 超级管理员可以管理所有站点
  .group("/admin", (app) =>
    app
      .use(adminAuthPlugin)
      // 创建站点
      .post(
        "/",
        async ({ body, db }) => {
          // 检查域名是否已存在
          const existingSite = await db.query.sitesTable.findFirst({
            where: {
              domain: body.domain,
            },
          });

          if (existingSite) {
            throw new HttpError.BadRequest("域名已存在");
          }

          const [currentSite] = await db
            .insert(sitesTable)
            .values({
              name: body.name,
              domain: body.domain,
              siteType: body.siteType,
              factoryId: body.factoryId,
              exporterId: body.exporterId,
              isActive: body.isActive ?? true,
            })
            .returning();

          return { data: currentSite };
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
          if (query.entityId) {
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
        async ({ params, body, db }) => {
          const { siteId } = params;

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

          const [updatedSite] = await db
            .update(sitesTable)
            .set({ ...body, updatedAt: new Date() })
            .where(eq(sitesTable.id, siteId))
            .returning();

          if (!updatedSite) {
            throw new HttpError.NotFound("站点不存在");
          }

          return { data: updatedSite };
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
        async ({ params, db, status }) => {
          const { siteId } = params;

          const result = await db
            .delete(sitesTable)
            .where(eq(sitesTable.id, siteId));
          return status(204);
        },
        {
          auth: true,
          params: t.Object({
            siteId: t.String(),
          }),
          detail: {
            summary: "删除站点",
            description: "删除站点",
          },
        }
      )
  );
