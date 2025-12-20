import { UsersContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";
import { usersService } from "~/modules/index";

export const usersController = new Elysia({ prefix: "/users" })
  .use(authGuardMid)
  .use(dbPlugin)

  // 获取当前用户信息接口
  .get(
    "/me",
    async ({ user, currentSite, db, role, permissions }) => {
      const result = await db.query.userSiteRolesTable.findMany({
        where: {
          userId: user.id,
        },
        with: {
          role: true,
          site: true,
        },
      });

      const allSites = result.map((item) => item.site);
      const userData = {
        user: {
          ...user,
          role,
          site: currentSite,
        },
        currentSite,
        allSites,
        roles: role,
        permissions,
      };
      return userData;
    },
    {
      detail: {
        summary: "获取当前用户信息",
        description:
          "返回当前登录用户的详细信息，包括基础信息、权限范围、关联站点和角色",
        tags: ["Users"],
      },
    }
  )

  // 获取用户列表
  .get(
    "/",
    ({ query, permissions, auth }) => {
      if (!permissions.includes("USERS_VIEW")) throw new Error("Forbidden");
      return usersService.findAll(query, auth);
    },
    {
      query: UsersContract.ListQuery,
      detail: {
        summary: "获取用户列表",
        description: "分页获取用户列表，支持搜索和排序",
        tags: ["Users"],
      },
    }
  )

  // 创建用户
  .post(
    "/",
    ({ body, permissions, auth }) => {
      if (!permissions.includes("USERS_CREATE")) throw new Error("Forbidden");
      return usersService.create(body, auth);
    },
    {
      body: UsersContract.Create,
      detail: {
        summary: "创建新用户",
        description: "创建一个新的系统用户，需要相应的权限",
        tags: ["Users"],
      },
    }
  )

  // 更新用户信息
  .patch(
    "/:id",
    ({ params, body, permissions, auth }) => {
      if (!permissions.includes("USERS_EDIT")) throw new Error("Forbidden");
      return usersService.update(params.id, body, auth);
    },
    {
      params: t.Object({ id: t.String() }),
      body: UsersContract.Patch,
      detail: {
        summary: "更新用户信息",
        description: "部分更新指定用户的信息，需要相应的权限",
        tags: ["Users"],
      },
    }
  )

  // 删除用户
  .delete(
    "/:id",
    ({ params, permissions, auth }) => {
      if (!permissions.includes("USERS_DELETE")) throw new Error("Forbidden");
      return usersService.delete(params.id, auth);
    },
    {
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "删除用户",
        description: "删除指定的用户，需要相应的权限",
        tags: ["Users"],
      },
    }
  );
