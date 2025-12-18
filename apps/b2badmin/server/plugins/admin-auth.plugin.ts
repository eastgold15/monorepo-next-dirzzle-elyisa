// 管理台认证插件 - 自动选择权限最高的站点

import { Elysia } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { dbPlugin } from "~/db/connection";
import { auth } from "../lib/auth";
import { and, eq } from "drizzle-orm";

export const adminAuthPlugin = new Elysia({ name: "admin-auth" })
  // bring db utilities (make sure dbPlugin exports a `db` object)
  .use(dbPlugin)
  .derive(async ({ request, db }) => {
    // 1. 验证 Session (这里省略你之前的代码)
    const headers = request.headers;
    const requestedSiteId = undefined // 👈 获取前端传来的意向站点
    // 1️⃣ verify session
    const session = await auth.api.getSession({ headers });
    if (!session) throw new HttpError.Unauthorized("未登录");

    // 2️⃣ fetch user
    const user = await db.query.usersTable.findFirst({
      where: { id: session.user.id },
    });
    if (!user) throw new HttpError.NotFound("用户不存在");
    // 用户拥有的角色和站点，挑一个最高的作为默认站点和角色
    const userRoleSites = await db.query.userSiteRolesTable.findMany({
      where: {
        userId: user.id,
      },
      with: {
        role: {
          orderBy: { priority: "desc" },
        },
        site: true,
      },
    });

    if (userRoleSites.length === 0) {
      throw new HttpError.Forbidden("您没有任何站点权限");
    }

    // 3️⃣ 寻找匹配的“现场数据”
    let activeRelation;

    if (requestedSiteId) {
      // 在用户拥有的列表里找有没有这个 ID
      activeRelation = userRoleSites.find(item => item.site.id === requestedSiteId);

      // 安全保护：如果用户伪造了一个他不拥有的 site-id，直接报错
      if (!activeRelation) {
        throw new HttpError.Forbidden("您没有权限访问该指定的站点");
      }
    } else {
      // 如果没有传 header，默认取优先级最高的第一个
      activeRelation = userRoleSites[0];
    }


    const { site: currentSite, role } = activeRelation;

    // 4️⃣ 查库获取该角色在“当前站点”上下文下的权限
    const rolePermissions = await db.query.rolePermissionsTable.findMany({
      where: {
        roleId: role.id,
      },
      with: {
        permission: {
          columns: {
            name: true,
          },
        },
      },
    });
    const permissions = [...new Set(rolePermissions.map(p => p.permission?.name).filter(Boolean))];
    return {
      user,
      currentSite,
      tenantId:
        currentSite.siteType === "factory" ? currentSite.factoryId : currentSite.exporterId,
      tenantType: currentSite.siteType,
      role,
      permissions // 自动注入到后续的所有 Hook 中
    }
  })
  .resolve(({ currentSite, role, user }) => {

    /**
     * 自动注入当前站点 ID 的过滤器
     * @param tableSchema Drizzle 表定义 (用于传统的 db.select 模式)
     * @param otherFilters 其他 SQL 条件
     */
    const t = (otherFilters?: any) => {
      // 如果是超级管理员，可以选择不过滤（视业务而定）
      if (user.isSuperAdmin && !currentSite) return otherFilters;

      // 返回 Drizzle 能够识别的过滤对象
      // 针对 db.query 这种关系查询模式：
      return {
        siteId: currentSite.id,
        ...(otherFilters || {})
      };
    };

    /**
     * 针对 db.select() 这种原生 SQL 模式的助手
     */
    const tx = (tableSchema: any, otherCondition?: any) => {
      return and(eq(tableSchema.siteId, currentSite.id), otherCondition);
    };

    return {
      t,  // 简化的关系查询助手
      tx, // 原生 SQL 查询助手
    };
  })
  .macro({
    allRoles: (roles: string[]) => ({
      beforeHandle({ role, status }) {

        if (!role) {
          throw new HttpError.Forbidden("您没有任何角色权限");
        }

        if (!roles.includes(role.name)) {
          return status(403, {
            message: `该功能仅限角色 [${roles.join(",")}] 访问，您的角色是: ${role.name}`,
            code: "ROLE_NOT_ALLOWED"
          })
        }
      }

    }),

    allPermission: (name: string) => ({
      beforeHandle({ permissions, status }) {
        if (!permissions) {
          throw new HttpError.Forbidden("您没有任何权限");
        }
        if (!permissions.includes(name) && !permissions.includes('*')) {
          return status(403, `权限不足，需要 ${name} 权限`)
        }
      }
    })
  })


  .get("/permissions", ({ user, currentSite, role, t }) => {

  }, {

    allRoles: ["admin"],
    allPermission: "*",
  })



  // .macro({
  //   auth: {
  //     resolve: async ({ request, db }) => {
  //       // 确保 request 存在
  //       if (!request) {
  //         throw new HttpError.BadRequest("请求对象不存在");
  //       }

  //       const headers = request.headers;
  //       const url = request.url;

  //       // 1️⃣ verify session
  //       const session = await auth.api.getSession({ headers });
  //       if (!session) throw new HttpError.Unauthorized("未登录");
  //       // 2️⃣ fetch user
  //       const user = await db.query.usersTable.findFirst({
  //         where: { id: session.user.id },
  //       });
  //       if (!user) throw new HttpError.NotFound("用户不存在");

  //       const requestedSiteId = headers.get("x-site-id");

  //       // ------------------------------
  //       // 3️⃣ SUPER ADMIN flow
  //       // ------------------------------
  //       if (user.isSuperAdmin) {
  //         const allSites = await db.query.sitesTable.findMany({
  //           where: {
  //             isActive: true,
  //           },
  //           orderBy: { createdAt: "desc" },
  //         });

  //         if (allSites.length === 0)
  //           throw new HttpError.NotFound("系统中没有任何站点");

  //         let currentSite;
  //         if (requestedSiteId) {
  //           // 如果指定了站点ID，使用指定的站点
  //           const requestedSite = allSites.find(
  //             (site) => site.id === requestedSiteId
  //           );
  //           if (!requestedSite) {
  //             throw new HttpError.NotFound("指定的站点不存在或已停用");
  //           }
  //           currentSite = requestedSite;
  //         } else {
  //           // 否则使用第一个站点
  //           currentSite = allSites[0];
  //         }

  //         return {
  //           user,
  //           currentSite,
  //           tenantId:
  //             currentSite.siteType === "factory"
  //               ? currentSite.factoryId
  //               : currentSite.exporterId,
  //           tenantType: currentSite.siteType,
  //           role: "super_admin",
  //           permissions: ["*"],
  //           can: () => true,
  //           allSites: allSites.map((site) => ({
  //             site,
  //             role: { name: "super_admin", priority: 100 },
  //             priority: 100,
  //           })),
  //         };
  //       }
  //       // ------------------------------
  //       // 4️⃣ Normal user flow
  //       // ------------------------------
  //       const userRoleSites = await db.query.userSiteRolesTable.findMany({
  //         where: {
  //           userId: user.id,
  //         },
  //         columns: {},
  //         with: {
  //           role: {
  //             orderBy: { priority: "desc" },
  //           },
  //           site: true,
  //         },
  //       });

  //       if (userRoleSites.length === 0)
  //         throw new HttpError.Forbidden("您没有被分配到任何站点，请联系管理员");

  //       let currentSite, role;

  //       if (requestedSiteId) {
  //         // 如果指定了站点ID，查找用户是否有权限访问该站点
  //         const requestedSiteData = userRoleSites.find(
  //           (item) => item.site.id === requestedSiteId
  //         );
  //         if (!requestedSiteData) {
  //           throw new HttpError.Forbidden("您没有权限访问该站点");
  //         }
  //         currentSite = requestedSiteData.site;
  //         role = requestedSiteData.role;
  //       } else {
  //         // 否则使用权限最高的站点
  //         currentSite = userRoleSites[0].site;
  //         role = userRoleSites[0].role;
  //       }
  //       // 6️⃣ fetch permissions for the selected role
  //       const perms = await db
  //         .select({ name: permissionTable.name })
  //         .from(rolePermissionsTable)
  //         .innerJoin(
  //           permissionTable,
  //           eq(rolePermissionsTable.permissionId, permissionTable.id)
  //         )
  //         .where(eq(rolePermissionsTable.roleId, role.id));
  //       const permissions = [...new Set(perms.map((p) => p.name))];
  //       return {
  //         user,
  //         currentSite,
  //         tenantId:
  //           currentSite.siteType === "factory"
  //             ? currentSite.factoryId
  //             : currentSite.exporterId,
  //         tenantType: currentSite.siteType,
  //         role: role.name,
  //         permissions,
  //         can: (action: string) =>
  //           permissions.includes(action) || permissions.includes("*"),
  //         allSites: userRoleSites,
  //       };
  //     },
  //   },
  // })
  .as("global");

