// 用户信息控制器

import { Elysia } from "elysia";
import { dbPlugin } from "~/db/connection";
import { adminAuthPlugin } from "~/plugins/admin-auth.plugin";

export const userRoute = new Elysia({
  prefix: "/user",
  tags: ["User"],
})

  .use(dbPlugin)
  .use(adminAuthPlugin)
  .get(
    "/me",
    async ({ user, currentSite, tenantId, tenantType, db, role, permissions }) => {

      const result = await db.query.userSiteRolesTable.findMany({
        where: {
          userId: user.id,
        },
        with: {
          role: true,
          site: true,
        }
      })

      const allSites = result.map((item) => item.site);
      const userData = {
        user: {
          ...user,
          role,
          site: currentSite,
        },
        currentSite,
        tenantId,
        tenantType,
        allSites,
        roles: role,
        permissions
      };
      return userData;
    },
    {
      detail: {
        summary: "获取当前用户信息",
        description:
          "返回当前登录用户的详细信息，包括基础信息、权限范围和业务数据",
      },
    }
  );
