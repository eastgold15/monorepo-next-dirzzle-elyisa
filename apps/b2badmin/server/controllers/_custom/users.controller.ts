import {
  exportersTable,
  factoriesTable,
  sitesTable,
  UsersContract,
  userSiteRolesTable,
  usersTable,
} from "@repo/contract";
import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";

import { dbPlugin } from "~/db/connection";
import { auth as authserver } from "~/lib/auth";
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

  // 更新当前用户个人资料
  .put(
    "/me/profile",
    async ({ body, user, db }) => {
      const updatedUser = await db
        .update(usersTable)
        .set({
          name: body.name,
          phone: body.phone,
          address: body.address,
          city: body.city,
        })
        .where(eq(usersTable.id, user.id))
        .returning();

      return updatedUser[0];
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        phone: t.Optional(t.String()),
        address: t.Optional(t.String()),
        city: t.Optional(t.String()),
      }),
      detail: {
        summary: "更新当前用户个人资料",
        description: "允许用户更新自己的个人信息，包括姓名、电话、地址和城市",
        tags: ["Users"],
      },
    }
  )

  // 获取账号设置所需的完整信息（用户+站点+出口商/工厂）
  .get(
    "/me/settings",
    async ({ user, currentSite, db }) => {
      // 获取出口商或工厂信息
      let company = null;
      if (currentSite?.siteType === "exporter" && currentSite.exporterId) {
        company = await db.query.exportersTable.findFirst({
          where: { id: currentSite.exporterId },
        });
      } else if (currentSite?.siteType === "factory" && currentSite.factoryId) {
        company = await db.query.factoriesTable.findFirst({
          where: { id: currentSite.factoryId },
        });
      }

      return {
        user,
        site: currentSite,
        company,
      };
    },
    {
      detail: {
        summary: "获取账号设置信息",
        description:
          "获取账号设置页面所需的完整信息，包括用户信息、站点信息和关联的出口商/工厂信息",
        tags: ["Users"],
      },
    }
  )

  // 更新当前用户的站点信息和出口商/工厂信息
  .put(
    "/me/site",
    async ({ body, user, currentSite, db }) => {
      if (!currentSite) {
        throw new Error("No current site found");
      }

      // 1. 先更新站点信息
      const updatedSite = await db
        .update(sitesTable)
        .set({
          name: body.siteName,
          domain: body.domain,
        })
        .where(eq(sitesTable.id, currentSite.id))
        .returning();

      // 2. 根据站点类型更新对应的出口商或工厂信息
      if (currentSite.siteType === "exporter" && currentSite.exporterId) {
        // 更新出口商信息
        const updatedExporter = await db
          .update(exportersTable)
          .set({
            name: body.companyName,
            code: body.companyCode,
            address: body.companyAddress,
            website: body.website,
          })
          .where(eq(exportersTable.id, currentSite.exporterId))
          .returning();

        return {
          site: updatedSite[0],
          exporter: updatedExporter[0],
        };
      }
      if (currentSite.siteType === "factory" && currentSite.factoryId) {
        // 更新工厂信息
        const updatedFactory = await db
          .update(factoriesTable)
          .set({
            name: body.companyName,
            code: body.companyCode,
            address: body.companyAddress,
            website: body.website,
            contactPhone: body.contactPhone,
          })
          .where(eq(factoriesTable.id, currentSite.factoryId))
          .returning();

        return {
          site: updatedSite[0],
          factory: updatedFactory[0],
        };
      }

      return updatedSite[0];
    },
    {
      body: t.Object({
        siteName: t.Optional(t.String()),
        domain: t.Optional(t.String()),
        companyName: t.Optional(t.String()),
        companyCode: t.Optional(t.String()),
        companyAddress: t.Optional(t.String()),
        website: t.Optional(t.String()),
        contactPhone: t.Optional(t.String()),
      }),
      detail: {
        summary: "更新当前用户的站点和公司信息",
        description:
          "允许用户更新自己所属站点和关联的出口商/工厂信息，根据站点类型自动判断更新出口商或工厂",
        tags: ["Users"],
      },
    }
  )

  // 获取用户列表
  .get(
    "/",
    ({ query, auth, db }) => usersService.findAll(query, { db, auth }),
    {
      permissions: ["USERS_VIEW"],
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
    async ({ body, db, currentSite, status }) => {
      const user = await authserver.api.signInEmail({
        body: {
          email: body.email,
          password: body.password,
        },
      });

      if (body.roleId) {
        const userSiteRole = await db
          .insert(userSiteRolesTable)
          .values({
            userId: user.user.id,
            siteId: currentSite.id,
            roleId: body.roleId,
          })
          .returning();

        return userSiteRole;
      }
      return user;
    },
    {
      allPermissions: ["USERS_CREATE"],
      body: UsersContract.Create,
      detail: {
        summary: "创建新用户",
        description: "创建一个新的系统用户，需要相应的权限",
        tags: ["Users"],
      },
    }
  )

  // 更新用户信息
  .put(
    "/:id",
    ({ params, body, auth, db }) =>
      usersService.update(params.id, body, { db, auth }),
    {
      allPermissions: ["USERS_EDIT"],
      params: t.Object({ id: t.String() }),
      body: UsersContract.Update,
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
    ({ params, permissions, auth, db }) => {
      if (!permissions.includes("USERS_DELETE")) throw new Error("Forbidden");
      return usersService.delete(params.id, { db, auth });
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
