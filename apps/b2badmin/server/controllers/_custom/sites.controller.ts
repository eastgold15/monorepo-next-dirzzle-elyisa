import { SitesContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";
import { sitesService } from "~/modules/index";

export const sitesController = new Elysia({ prefix: "/sites" })
  .use(authGuardMid)
  .use(dbPlugin)

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
      detail: {
        summary: "获取可访问站点列表",
        description:
          "获取当前用户有权限访问的所有站点，包括在每个站点中的角色信息",
        tags: ["Sites"],
      },
    }
  )

  // 获取站点列表（管理员）
  .get(
    "/",
    ({ query, auth, db }) => sitesService.findAll(query, { db, auth }),
    {
      allPermission: "SITES_VIEW",
      query: SitesContract.ListQuery,
      detail: {
        summary: "获取站点列表",
        description: "分页获取站点列表，支持按站点类型、状态等条件筛选",
        tags: ["Sites"],
      },
    }
  )

  // 创建站点（管理员）
  .post("/", ({ body, auth, db }) => sitesService.create(body, { db, auth }), {
    allPermission: "SITES_CREATE",
    body: SitesContract.Create,
    detail: {
      summary: "创建新站点",
      description: "创建一个新的站点，需要指定所属的工厂和出口商",
      tags: ["Sites"],
    },
  })

  // 更新站点信息（管理员）
  .put(
    "/:id",
    ({ params, body, auth, db }) =>
      sitesService.update(params.id, body, { db, auth }),
    {
      allPermission: "SITES_EDIT",
      params: t.Object({ id: t.String() }),
      body: SitesContract.Update,
      detail: {
        summary: "更新站点信息",
        description: "更新指定站点的信息",
        tags: ["Sites"],
      },
    }
  )

  // 删除站点（管理员）
  .delete(
    "/:id",
    ({ params, auth, db }) => sitesService.delete(params.id, { db, auth }),
    {
      allPermission: "SITES_DELETE",
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "删除站点",
        description: "删除指定的站点，请谨慎操作此接口",
        tags: ["Sites"],
      },
    }
  );
