// 管理台认证插件 - 自动选择权限最高的站点

import { permissionTable, rolePermissionsTable } from "@repo/contract/table";
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { dbPlugin } from "~/db/connection";
import { auth } from "../lib/auth";

export const adminAuthPlugin = new Elysia({ name: "admin-auth" })
  // bring db utilities (make sure dbPlugin exports a `db` object)
  .use(dbPlugin)
  // expose a *global* macro so any child route can call `auth()`
  .macro({
    auth: {
      resolve: async ({ request, db }) => {
        // 确保 request 存在
        if (!request) {
          throw new HttpError.BadRequest("请求对象不存在");
        }

        const headers = request.headers;
        const url = request.url;

        // 1️⃣ verify session
        const session = await auth.api.getSession({ headers });
        if (!session) throw new HttpError.Unauthorized("未登录");
        // 2️⃣ fetch user
        const user = await db.query.usersTable.findFirst({
          where: { id: session.user.id },
        });
        if (!user) throw new HttpError.NotFound("用户不存在");

        const requestedSiteId = headers.get("x-site-id");

        // ------------------------------
        // 3️⃣ SUPER ADMIN flow
        // ------------------------------
        if (user.isSuperAdmin) {
          const allSites = await db.query.sitesTable.findMany({
            where: {
              isActive: true,
            },
            orderBy: { createdAt: "desc" },
          });

          if (allSites.length === 0)
            throw new HttpError.NotFound("系统中没有任何站点");

          let currentSite;
          if (requestedSiteId) {
            // 如果指定了站点ID，使用指定的站点
            const requestedSite = allSites.find(
              (site) => site.id === requestedSiteId
            );
            if (!requestedSite) {
              throw new HttpError.NotFound("指定的站点不存在或已停用");
            }
            currentSite = requestedSite;
          } else {
            // 否则使用第一个站点
            currentSite = allSites[0];
          }

          return {
            user,
            currentSite,
            tenantId:
              currentSite.siteType === "factory"
                ? currentSite.factoryId
                : currentSite.exporterId,
            tenantType: currentSite.siteType,
            role: "super_admin",
            permissions: ["*"],
            can: () => true,
            allSites: allSites.map((site) => ({
              site,
              role: { name: "super_admin", priority: 100 },
              priority: 100,
            })),
          };
        }
        // ------------------------------
        // 4️⃣ Normal user flow
        // ------------------------------
        const userRoleSites = await db.query.userSiteRolesTable.findMany({
          where: {
            userId: user.id,
          },
          columns: {},
          with: {
            role: {
              orderBy: { priority: "desc" },
            },
            site: true,
          },
        });

        if (userRoleSites.length === 0)
          throw new HttpError.Forbidden("您没有被分配到任何站点，请联系管理员");

        let currentSite, role;

        if (requestedSiteId) {
          // 如果指定了站点ID，查找用户是否有权限访问该站点
          const requestedSiteData = userRoleSites.find(
            (item) => item.site.id === requestedSiteId
          );
          if (!requestedSiteData) {
            throw new HttpError.Forbidden("您没有权限访问该站点");
          }
          currentSite = requestedSiteData.site;
          role = requestedSiteData.role;
        } else {
          // 否则使用权限最高的站点
          currentSite = userRoleSites[0].site;
          role = userRoleSites[0].role;
        }
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
          role: role.name,
          permissions,
          can: (action: string) =>
            permissions.includes(action) || permissions.includes("*"),
          allSites: userRoleSites,
        };
      },
    },
  })
  .as("global");
