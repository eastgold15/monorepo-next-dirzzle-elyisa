import { Elysia } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { db } from "../db/connection";

// 角色类型定义
export type UserRole = "exporter_admin" | "factory_admin" | "salesperson";

// 权限检查函数
export async function checkUserPermissions(
  userId: string,
  requiredRole?: UserRole
) {
  // 获取用户的角色信息
  const userWithRoles = await db.query.usersTable.findFirst({
    where: { id: userId },
    with: {
      userRoles: {
        with: {
          role: true,
        },
      },
      salesperson: {
        with: {
          factory: {
            columns: {
              id: true,
              name: true,
              exporterId: true,
            },
          },
        },
      },
    },
  });

  if (!userWithRoles) {
    throw new HttpError.Unauthorized("用户不存在");
  }

  // 获取用户角色
  const roles = userWithRoles.userRoles.map((ur) => ur.role.name);

  // 如果没有角色，拒绝访问
  if (roles.length === 0) {
    throw new HttpError.Forbidden("用户没有分配角色");
  }

  // 检查特定角色要求
  if (requiredRole && !roles.includes(requiredRole)) {
    throw new HttpError.Forbidden(`需要 ${requiredRole} 角色`);
  }

  return {
    user: userWithRoles,
    roles,
    factoryId: userWithRoles.salesperson?.factoryId,
    exporterId: userWithRoles.salesperson?.factory?.exporterId,
  };
}

// 获取出口商管理员能看到的所有工厂
export async function getExporterFactories(exporterId: string) {
  const factories = await db.query.factoriesTable.findMany({
    where: { exporterId },
    columns: {
      id: true,
      name: true,
      code: true,
    },
  });

  return factories;
}

// 检查工厂访问权限
export async function checkFactoryAccess(userId: string, factoryId: string) {
  const userPermissions = await checkUserPermissions(userId);

  // 出口商管理员可以访问所有旗下工厂
  if (userPermissions.roles.includes("exporter_admin")) {
    const factories = await getExporterFactories(userPermissions.exporterId!);
    const hasAccess = factories.some((f) => f.id === factoryId);
    if (!hasAccess) {
      throw new HttpError.Forbidden("您无权访问该工厂");
    }
    return { ...userPermissions, canAccessAllFactories: true };
  }

  // 工厂管理员只能访问自己的工厂
  if (userPermissions.roles.includes("factory_admin")) {
    if (userPermissions.factoryId !== factoryId) {
      throw new HttpError.Forbidden("您只能管理自己的工厂");
    }
    return { ...userPermissions, canAccessAllFactories: false };
  }

  // 业务员通过 salesperson 表关联到工厂
  if (userPermissions.roles.includes("salesperson")) {
    if (userPermissions.factoryId !== factoryId) {
      throw new HttpError.Forbidden("您只能操作被分配的工厂");
    }
    return { ...userPermissions, canAccessAllFactories: false };
  }

  throw new HttpError.Forbidden("权限不足");
}

// Elysia 权限中间件
export const permissionsPlugin = new Elysia({ name: "permissions" })
  .derive({ as: "global" }, async ({ headers, set }) => {
    // 从请求头获取用户信息（假设通过认证中间件设置）
    const userId = headers["x-user-id"] as string;

    if (!userId) {
      set.status = 401;
      throw new HttpError.Unauthorized("未提供用户ID");
    }

    const userPermissions = await checkUserPermissions(userId);

    return {
      userPermissions,
    };
  })
  .macro({
    // 检查是否为出口商管理员
    exporterAdmin: {
      async resolve({ userPermissions }) {
        if (!userPermissions.roles.includes("exporter_admin")) {
          throw new HttpError.Forbidden("需要出口商管理员权限");
        }
      },
    },
    // 检查是否为工厂管理员
    factoryAdmin: {
      async resolve({ userPermissions }) {
        if (!userPermissions.roles.includes("factory_admin")) {
          throw new HttpError.Forbidden("需要工厂管理员权限");
        }
      },
    },
    // 检查是否为业务员
    salesperson: {
      async resolve({ userPermissions }) {
        if (!userPermissions.roles.includes("salesperson")) {
          throw new HttpError.Forbidden("需要业务员权限");
        }
      },
    },
    // 检查工厂访问权限
    factoryAccess(factoryId?: string) {
      return {
        async resolve({ userPermissions, params }) {
          const targetFactoryId = factoryId || params?.factoryId;
          if (!targetFactoryId) {
            throw new HttpError.BadRequest("未提供工厂ID");
          }
          await checkFactoryAccess(userPermissions.user.id, targetFactoryId);
        },
      };
    },
  });

// 获取用户可见的工厂列表
export async function getUserVisibleFactories(userId: string) {
  const userPermissions = await checkUserPermissions(userId);

  if (userPermissions.roles.includes("exporter_admin")) {
    return await getExporterFactories(userPermissions.exporterId!);
  }

  // 工厂管理员和业务员只能看到自己的工厂
  if (userPermissions.factoryId) {
    const factory = await db.query.factoriesTable.findFirst({
      where: { id: userPermissions.factoryId },
      columns: {
        id: true,
        name: true,
        code: true,
      },
    });
    return factory ? [factory] : [];
  }

  return [];
}
