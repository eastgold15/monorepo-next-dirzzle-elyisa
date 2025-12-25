import { UserSiteRolesContract, userSiteRolesTable } from "@repo/contract";
import { Elysia, t } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";
import { userSiteRolesService } from "~/modules/index";

export const usersiterolesController = new Elysia({ prefix: "/usersiteroles" })
  .use(authGuardMid)
  .use(dbPlugin)

  // 需要完成的功能，
  // 1. 超管为所有人分配 用户在某站点的角色。
  // 2. 出口商为工厂用户和业务员分配在某站点的角色。
  // 3. 工厂用户为业务员分配在该站点的角色。





  // 超管和出口商为工厂用户分配站点，工厂用户的角色管理列表
  .get(
    "/admin",
    ({ query, auth, db }) => userSiteRolesService.list({ db, auth }, query),
    {
      allPermissions: ["USER_SITE_ROLES_VIEW"],
      query: UserSiteRolesContract.ListQuery,
      detail: {
        summary: "获取该用户身份下的用户角色管理",
        description:
          "获取该用户身份下的用户角色管理列表",
        tags: ["UserSiteRoles"],
      },
    }
  )

  // 分配用户到站点角色
  .post(
    "/",
    ({ body, permissions, auth, db }) => {
      if (!permissions.includes("USERSITEROLES_CREATE"))
        throw new Error("Forbidden");
      return userSiteRolesService.create(body, auth);
    },
    {
      body: UserSiteRolesContract.Create,
      detail: {
        summary: "分配用户站点角色",
        description: "将用户分配到指定站点，并授予相应的角色权限",
        tags: ["UserSiteRoles"],
      },
    }
  )

  // 更新用户站点角色
  .patch(
    "/:id",
    ({ params, body, permissions, auth }) => {
      if (!permissions.includes("USERSITEROLES_EDIT"))
        throw new Error("Forbidden");
      return userSiteRolesService.update(params.id, body, auth);
    },
    {
      params: t.Object({ id: t.String() }),
      body: UserSiteRolesContract.Patch,
      detail: {
        summary: "更新用户站点角色",
        description: "更新用户在站点中的角色信息，如更改角色或权限级别",
        tags: ["UserSiteRoles"],
      },
    }
  )

  // 取消用户站点角色分配
  .delete(
    "/:id",
    ({ params, permissions, auth }) => {
      if (!permissions.includes("USERSITEROLES_DELETE"))
        throw new Error("Forbidden");
      return userSiteRolesService.delete(params.id, auth);
    },
    {
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "取消用户站点角色",
        description:
          "取消用户在指定站点中的角色分配，用户将失去该站点的访问权限",
        tags: ["UserSiteRoles"],
      },
    }
  )

  // 批量分配多个用户到站点
  .post(
    "/batch-assign",
    async ({ body, permissions, auth, db }) => {
      if (!permissions.includes("USERSITEROLES_CREATE"))
        throw new Error("Forbidden");

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

      // 批量创建用户站点角色
      const assignments = userIds.map((userId) => ({
        userId,
        siteId,
        roleId,
        assignedAt: new Date(),
      }));

      const result = await db
        .insert(userSiteRolesTable)
        .values(assignments)
        .returning();

      return { data: result };
    },
    {
      body: t.Object({
        userIds: t.Array(t.String()),
        siteId: t.String(),
        roleId: t.String(),
      }),
      detail: {
        summary: "批量分配用户站点角色",
        description: "一次性将多个用户分配到同一个站点，并授予相同的角色",
        tags: ["UserSiteRoles"],
      },
    }
  )

  // 获取站点下的所有用户及其角色
  .get(
    "/site/:siteId/users",
    async ({ params, permissions, auth, db }) => {
      if (!permissions.includes("USERSITEROLES_VIEW"))
        throw new Error("Forbidden");

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
      detail: {
        summary: "获取站点用户列表",
        description: "获取指定站点下的所有用户及其角色信息",
        tags: ["UserSiteRoles"],
      },
    }
  )

  // 获取用户的所有站点角色
  .get(
    "/user/:userId/sites",
    async ({ params, permissions, auth, db }) => {
      if (!permissions.includes("USERSITEROLES_VIEW"))
        throw new Error("Forbidden");

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
      detail: {
        summary: "获取用户站点列表",
        description: "获取指定用户的所有站点访问权限及角色信息",
        tags: ["UserSiteRoles"],
      },
    }
  );
