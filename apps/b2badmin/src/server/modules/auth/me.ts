import { Elysia } from "elysia";
import { auth } from "@/server/lib/auth";
import { dbPlugin } from "@/server/db/connection";
import { commonRes } from "@/server/utils/Res";
import {
  usersTable,
  userResourceRolesTable,
  roleTable
} from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

export const meRoute = new Elysia({
  prefix: "/me",
  tags: ["User"],
})
  .use(dbPlugin)
  .get("/", async ({ set }) => {
    try {
      // 获取当前会话信息
      const session = await auth.api.getSession({
        headers: set.headers as any,
      });

      if (!session || !session.user) {
        return commonRes(
          { error: "未登录" },
          401,
          "Unauthorized"
        );
      }

      // 从数据库获取用户详细信息
      const [user] = await db
        .select({
          id: usersTable.id,
          email: usersTable.email,
          name: usersTable.name,
          image: usersTable.image,
          emailVerified: usersTable.emailVerified,
          createdAt: usersTable.createdAt,
          updatedAt: usersTable.updatedAt,
        })
        .from(usersTable)
        .where(eq(usersTable.id, session.user.id))
        .limit(1);

      // 获取用户的工厂和出口商关联
      const userResources = await db
        .select({
          resourceType: userResourceRolesTable.resourceType,
          resourceId: userResourceRolesTable.resourceId,
          isPrimary: userResourceRolesTable.isPrimary,
          roleName: roleTable.name,
        })
        .from(userResourceRolesTable)
        .leftJoin(roleTable, eq(roleTable.id, userResourceRolesTable.roleId))
        .where(eq(userResourceRolesTable.userId, session.user.id));

      // 组织返回数据
      const factories = userResources
        .filter(r => r.resourceType === 'factory')
        .map(r => ({
          id: r.resourceId,
          isPrimary: r.isPrimary,
          role: r.roleName,
        }));

      const exporters = userResources
        .filter(r => r.resourceType === 'exporter')
        .map(r => ({
          id: r.resourceId,
          isPrimary: r.isPrimary,
          role: r.roleName,
        }));

      const userData = {
        ...user,
        factories,
        exporters,
        primaryFactory: factories.find(f => f.isPrimary),
        primaryExporter: exporters.find(e => e.isPrimary),
      };

      return commonRes(userData);
    } catch (error) {
      console.error("获取用户信息失败:", error);
      return commonRes(
        { error: "获取用户信息失败" },
        500,
        "Internal Server Error"
      );
    }
  });