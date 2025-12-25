import { UserSiteRolesContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";
import { userSiteRolesService } from "~/modules/index";

export const usersiterolesController = new Elysia({ prefix: "/usersiteroles" })
  .use(authGuardMid)
  .use(dbPlugin)

  /**
   * 获取该用户身份下的用户角色管理列表
   *
   * 权限规则：
   * 1. 超管：可以看到所有用户角色分配
   * 2. 出口商：可以看到旗下工厂用户和业务员的角色分配
   * 3. 工厂：可以看到自己工厂业务员的角色分配
   */
  .get(
    "/admin",
    ({ auth, db, user }) => userSiteRolesService.list({ db, auth }, user),
    {
      allPermission: "USER_SITE_ROLES_VIEW",
      detail: {
        summary: "获取用户角色管理列表",
        description: "根据当前用户身份，返回可管理的用户站点角色分配列表",
        tags: ["UserSiteRoles"],
      },
    }
  )

  /**
   * 分配用户到站点角色
   *
   * 权限规则：
   * 1. 超管可以为所有人分配
   * 2. 出口商可以为工厂用户和业务员分配到旗下站点
   * 3. 工厂用户可以为业务员分配到该站点
   */
  .post(
    "/",
    ({ body, auth, db }) => userSiteRolesService.createUser(body, { db, auth }),
    {
      allPermission: "USER_SITE_ROLES_CREATE",
      body: UserSiteRolesContract.Create,
      detail: {
        summary: "分配用户站点角色",
        description:
          "将用户分配到指定站点，并授予相应的角色权限。根据当前用户身份，有不同的分配权限限制。",
        tags: ["UserSiteRoles"],
      },
    }
  )

  /**
   * 更新用户站点角色
   */
  .put(
    "/:id",
    ({ params, body, auth, db }) =>
      userSiteRolesService.update(params.id, body, { db, auth }),
    {
      allPermission: "USER_SITE_ROLES_EDIT",
      params: t.Object({ id: t.String() }),
      body: UserSiteRolesContract.Update,
      detail: {
        summary: "更新用户站点角色",
        description: "更新用户在站点中的角色信息，如更改角色或权限级别",
        tags: ["UserSiteRoles"],
      },
    }
  )

  /**
   * 取消用户站点角色分配
   */
  .delete(
    "/:id",
    ({ params, auth, db }) =>
      userSiteRolesService.delete(params.id, { db, auth }),
    {
      allPermission: "USER_SITE_ROLES_DELETE",
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "取消用户站点角色",
        description:
          "取消用户在指定站点中的角色分配，用户将失去该站点的访问权限",
        tags: ["UserSiteRoles"],
      },
    }
  )

  /**
   * 批量分配多个用户到站点
   */
  .post(
    "/batch/assign",
    async ({ body, auth, db }) => {
      const { userIds, siteId, roleId } = body;

      // 检查站点是否存在
      const site = await db.query.sitesTable.findFirst({
        where: {
          id: siteId,
        },
      });

      if (!site) {
        throw new HttpError.NotFound("站点不存在");
      }

      // 检查角色是否存在
      const role = await db.query.roleTable.findFirst({
        where: {
          id: roleId,
        },
      });

      if (!role) {
        throw new HttpError.NotFound("角色不存在");
      }

      // 逐个验证权限并创建分配
      const results = [];
      for (const userId of userIds) {
        try {
          const result = await userSiteRolesService.createUser(
            { userId, siteId, roleId },
            { db, auth }
          );
          results.push({ success: true, data: result });
        } catch (error: any) {
          results.push({
            success: false,
            userId,
            error: error.message || "分配失败",
          });
        }
      }

      return { data: results };
    },
    {
      body: t.Object({
        userIds: t.Array(t.String()),
        siteId: t.String(),
        roleId: t.String(),
      }),
      allPermission: "USER_SITE_ROLES_CREATE",
      detail: {
        summary: "批量分配用户站点角色",
        description:
          "一次性将多个用户分配到同一个站点，并授予相同的角色。会逐个验证权限。",
        tags: ["UserSiteRoles"],
      },
    }
  )

  /**
   * 获取站点下的所有用户及其角色
   */
  .get(
    "/site/:siteId/users",
    async ({ params, db }) => {
      const { siteId } = params;

      const siteUsers = await db.query.userSiteRolesTable.findMany({
        where: {
          siteId,
        },
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
              isActive: true,
            },
          },
          role: {
            columns: {
              id: true,
              name: true,
              description: true,
              type: true,
              priority: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return { data: siteUsers };
    },
    {
      params: t.Object({
        siteId: t.String(),
      }),
      allPermission: "USER_SITE_ROLES_VIEW",
      detail: {
        summary: "获取站点用户列表",
        description: "获取指定站点下的所有用户及其角色信息",
        tags: ["UserSiteRoles"],
      },
    }
  )

  /**
   * 获取用户的所有站点角色
   */
  .get(
    "/user/:userId/sites",
    async ({ params, db }) => {
      const { userId } = params;

      const userSites = await db.query.userSiteRolesTable.findMany({
        where: {
          userId,
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
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return { data: userSites };
    },
    {
      params: t.Object({
        userId: t.String(),
      }),
      allPermission: "USER_SITE_ROLES_VIEW",
      detail: {
        summary: "获取用户站点列表",
        description: "获取指定用户的所有站点访问权限及角色信息",
        tags: ["UserSiteRoles"],
      },
    }
  );
