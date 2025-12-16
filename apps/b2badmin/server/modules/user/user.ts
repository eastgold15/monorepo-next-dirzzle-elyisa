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
    ({ user, currentSite, tenantId, tenantType, allSites, db, roles }) => {
      const userData = {
        user,
        currentSite,
        tenantId,
        tenantType,
        allSites,
        roles,
      };
      return userData;
    },
    {
      auth: true,
      detail: {
        summary: "获取当前用户信息",
        description:
          "返回当前登录用户的详细信息，包括基础信息、权限范围和业务数据",
      },
    }
  );
