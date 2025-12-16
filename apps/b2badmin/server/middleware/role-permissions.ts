import { Elysia } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import {
  usersTable,
  userRolesTable,
  roleTable,
  factoriesTable,
  salespersonsTable
} from "@repo/contract/table";
import { eq, and } from "drizzle-orm";
import { db } from "@/server/db/connection";

// 角色权限检查插件
export const rolePermissionsPlugin = new Elysia({ name: 'role-permissions' })
  .derive({ as: 'global' }, async ({ userInfo }) => {
    if (!userInfo) {
      throw new HttpError.Unauthorized("用户未登录");
    }

    // 获取用户的角色信息
    const roles = userInfo.roles as string[];

    // 获取用户关联的工厂（如果是工厂管理员或业务员）
    const userFactory = await db.query.salespersonsTable.findFirst({
      where: { userId: userInfo.id },
      with: {
        factory: {
          columns: {
            id: true,
            name: true,
            code: true,
            exporterId: true,
          },
        },
      },
    });

    // 判断用户权限级别
    const isExporterAdmin = roles.includes('exporter_admin');
    const isFactoryAdmin = roles.includes('factory_admin');
    const isSalesperson = roles.includes('salesperson');

    // 获取用户可管理的工厂列表
    let accessibleFactories = [];

    if (isExporterAdmin && userFactory?.factory?.exporterId) {
      // 出口商管理员可以管理其下的所有工厂
      accessibleFactories = await db.query.factoriesTable.findMany({
        where: { exporterId: userFactory.factory.exporterId },
        columns: {
          id: true,
          name: true,
          code: true,
        },
      });
    } else if ((isFactoryAdmin || isSalesperson) && userFactory?.factoryId) {
      // 工厂管理员和业务员只能管理自己的工厂
      accessibleFactories = [{
        id: userFactory.factory.id,
        name: userFactory.factory.name,
        code: userFactory.factory.code,
      }];
    }

    return {
      userRoles: roles,
      isExporterAdmin,
      isFactoryAdmin,
      isSalesperson,
      userFactoryId: userFactory?.factoryId,
      userFactory,
      accessibleFactories,
    };
  })
  .macro({
    // 检查是否为出口商管理员
    requireExporterAdmin: {
      async resolve({ isExporterAdmin }) {
        if (!isExporterAdmin) {
          throw new HttpError.Forbidden("需要出口商管理员权限");
        }
      },
    },
    // 检查是否为工厂管理员
    requireFactoryAdmin: {
      async resolve({ isFactoryAdmin }) {
        if (!isFactoryAdmin) {
          throw new HttpError.Forbidden("需要工厂管理员权限");
        }
      },
    },
    // 检查是否为业务员
    requireSalesperson: {
      async resolve({ isSalesperson }) {
        if (!isSalesperson) {
          throw new HttpError.Forbidden("需要业务员权限");
        }
      },
    },
    // 检查是否可以管理工厂（出口商管理员或该工厂的管理员）
    canManageFactory: (factoryId?: string) => ({
      async resolve({ isExporterAdmin, userFactoryId, accessibleFactories, params }) {
        const targetFactoryId = factoryId || params?.factoryId || params?.id;

        if (!targetFactoryId) {
          throw new HttpError.BadRequest("缺少工厂ID");
        }

        // 出口商管理员需要检查工厂是否在其管理范围内
        if (isExporterAdmin) {
          const hasAccess = accessibleFactories.some(f => f.id === targetFactoryId);
          if (!hasAccess) {
            throw new HttpError.Forbidden("您无权管理该工厂");
          }
        } else {
          // 工厂管理员和业务员只能管理自己的工厂
          if (userFactoryId !== targetFactoryId) {
            throw new HttpError.Forbidden("您只能管理自己的工厂");
          }
        }
      },
    }),
    // 检查是否可以查看工厂数据
    canViewFactory: (factoryId?: string) => ({
      async resolve({ isExporterAdmin, userFactoryId, accessibleFactories, params }) {
        const targetFactoryId = factoryId || params?.factoryId || params?.id;

        if (!targetFactoryId) {
          throw new HttpError.BadRequest("缺少工厂ID");
        }

        // 出口商管理员可以查看所有旗下工厂
        if (isExporterAdmin) {
          const hasAccess = accessibleFactories.some(f => f.id === targetFactoryId);
          if (!hasAccess) {
            throw new HttpError.Forbidden("您无权查看该工厂数据");
          }
        } else {
          // 工厂管理员和业务员只能查看自己的工厂
          if (userFactoryId !== targetFactoryId) {
            throw new HttpError.Forbidden("您只能查看自己工厂的数据");
          }
        }
      },
    }),
  });

// 获取权限过滤器 - 用于构建查询条件
export function getFactoryPermissionFilter(
  isExporterAdmin: boolean,
  userFactoryId?: string,
  accessibleFactories?: any[]
) {
  if (isExporterAdmin && accessibleFactories) {
    // 出口商管理员可以看到所有旗下工厂
    return {
      factoryId: {
        in: accessibleFactories.map(f => f.id)
      }
    };
  } else if (userFactoryId) {
    // 工厂管理员和业务员只能看到自己的工厂
    return { factoryId: userFactoryId };
  } else {
    // 没有工厂关联的用户
    return null;
  }
}