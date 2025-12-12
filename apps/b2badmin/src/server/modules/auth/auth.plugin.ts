import { eq, inArray } from "drizzle-orm";
import { Elysia } from "elysia";
import { dbPlugin } from "@/server/db/connection";
import { rolePermissionsTable, usersTable } from "@/server/db/schema";
import { auth } from "@/server/lib/auth";

// 用户中间件（计算用户和会话并传递给路由）
export const betterAuthPlugin = new Elysia({ name: "better-auth" })
  .use(dbPlugin)
  .macro({
    auth: {
      async resolve({ status, request: { headers }, db }) {
        const session = await auth.api.getSession({
          headers,
        });

        if (!session) return status(401);
        // 假设这是在 getUser 或 session 回调中
        const userInfoWithRoles = await db.query.usersTable.findFirst({
          where: eq(usersTable.id, session.user.id),
          with: {
            userRoles: {
              with: {
                role: true,
              },
            },
          },
        });

        if (!userInfoWithRoles) {
          throw new Error("用户信息不存在");
        }

        // 安全地提取角色名
        const roles = (userInfoWithRoles.userRoles || [])
          .map((ur) => ur.role?.name)
          .filter((name): name is string => !!name);

        if (roles.length === 0) {
          throw new Error("用户角色不存在");
        }

        // 查询权限名称（扁平化为一维数组）
        const permissions = (
          await db.query.rolePermissionsTable.findMany({
            where: inArray(rolePermissionsTable.roleId, roles),
            with: {
              permissions: {
                columns: {
                  name: true,
                },
              },
            },
          })
        )
          .flatMap((rp) => rp.permissions.map((p) => p.name)) // → string[]
          .filter((name): name is string => !!name); // 过滤 null/undefined

        // 如果需要去重（推荐）：
        const uniquePermissions = [...new Set(permissions)];

        // 构造返回给前端的安全用户信息
        const safeUserInfo = {
          ...userInfoWithRoles,
          userRoles: undefined, // 隐藏关联数据
        };

        return {
          user: session.user,
          roles,
          permissions: uniquePermissions,
          userInfo: safeUserInfo,
          session: session.session,
        };
      },
    },
  });
