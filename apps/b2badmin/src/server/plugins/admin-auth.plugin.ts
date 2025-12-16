// 管理台认证插件 - 自动选择权限最高的站点

import {
  permissionTable,
  rolePermissionsTable,
  roleTable,
  sitesTable,
  userSiteRolesTable,
} from "@repo/contract/table";
import { desc, eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { dbPlugin } from "@/server/db/connection";
import { auth } from "../lib/auth";

export const adminAuthPlugin = new Elysia({ name: "admin-auth" })
  // bring db utilities (make sure dbPlugin exports a `db` object)
  .use(dbPlugin)
  // expose a *global* macro so any child route can call `auth()`
  .macro({
    auth: {
      resolve: async ({ request: { headers }, db }) => {
        // 1️⃣ verify session
        const session = await auth.api.getSession({ headers });
        if (!session) throw new HttpError.Unauthorized("未登录");
        // 2️⃣ fetch user
        const user = await db.query.usersTable.findFirst({
          where: { id: session.user.id },
        });
        if (!user) throw new HttpError.NotFound("用户不存在");
        // ------------------------------
        // 3️⃣ SUPER ADMIN shortcut
        // ------------------------------
        if (user.isSuperAdmin) {
          const allSites = await db.query.sitesTable.findMany({
            orderBy: { createdAt: "desc" },
          });
          if (allSites.length === 0)
            throw new HttpError.NotFound("系统中没有任何站点");
          const currentSite = allSites[0];
          return {
            user,
            currentSite,
            tenantId:
              currentSite.siteType === "factory"
                ? currentSite.factoryId
                : currentSite.exporterId,
            tenantType: currentSite.siteType,
            roles: ["SUPER_ADMIN"],
            permissions: ["*"],
            can: () => true,
            allSites: allSites.map((site) => ({
              site,
              role: { name: "SUPER_ADMIN", priority: 100 } ,
              priority: 100,
            })),
          };
        }
        // ------------------------------
        // 4️⃣ Normal user flow
        // ------------------------------
        const userSites = await db
          .select({
            site: sitesTable,
            role: roleTable,
            priority: roleTable.priority,
          })
          .from(userSiteRolesTable)
          .innerJoin(sitesTable, eq(userSiteRolesTable.siteId, sitesTable.id))
          .innerJoin(roleTable, eq(userSiteRolesTable.roleId, roleTable.id))
          .where(eq(userSiteRolesTable.userId, user.id))
          .orderBy(
            desc(roleTable.priority),
            desc(userSiteRolesTable.createdAt)
          );
        if (userSites.length === 0)
          throw new HttpError.Forbidden("您没有被分配到任何站点，请联系管理员");
        const { site: currentSite, role } = userSites[0];
        // 6️⃣ fetch permissions for the selected role
        const perms = await db
          .select({ name: permissionTable.name })
          .from(rolePermissionsTable)
          .innerJoin(
            permissionTable,
            eq(rolePermissionsTable.permissionId, permissionTable.id)
          )
          .where(eq(rolePermissionsTable.roleId, role.id));
        const permissions = [...new Set(perms.map((p) => p.name))];
        return {
          user,
          currentSite,
          tenantId:
            currentSite.siteType === "factory"
              ? currentSite.factoryId
              : currentSite.exporterId,
          tenantType: currentSite.siteType,
          roles: [role.name],
          permissions,
          can: (action: string) =>
            permissions.includes(action) || permissions.includes("*"),
          allSites: userSites,
        };
      },
    },
  })
  .as("global");
