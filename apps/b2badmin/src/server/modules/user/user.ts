// 用户信息控制器

import { UserModel } from "@repo/contract";
import {
  exportersTable,
  factoriesTable,
  roleTable,
  salespersonsTable,
  userProfilesTable,
  userResourceRolesTable,
  userRolesTable,
  usersTable,
} from "@repo/contract/table";

import { and, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { dbPlugin } from "@/server/db/connection";
import { auth } from "@/server/lib/auth";
import { commonRes } from "@/server/utils/Res";
import { betterAuthPlugin } from "../auth/auth.plugin";

export const userRoute = new Elysia({
  prefix: "/user",
  tags: ["User"],
})

  .use(dbPlugin)
  .use(betterAuthPlugin)
  .get(
    "/me",
    async ({ userInfo, db }) => {
      const user = userInfo;

      // 获取用户的资源角色关联
      const userResources = await db
        .select({
          resourceType: userResourceRolesTable.resourceType,
          resourceId: userResourceRolesTable.resourceId,
          isPrimary: userResourceRolesTable.isPrimary,
          roleName: roleTable.name,
        })
        .from(userResourceRolesTable)
        .leftJoin(roleTable, eq(roleTable.id, userResourceRolesTable.roleId))
        .where(eq(userResourceRolesTable.userId, userInfo.id));

      // 获取用户的角色类型
      const userRole =
        userResources.find((r) => r.isPrimary)?.roleName || "salesperson";
      const primaryExporter = userResources.find(
        (r) => r.resourceType === "exporter" && r.isPrimary
      );
      const primaryFactory = userResources.find(
        (r) => r.resourceType === "factory" && r.isPrimary
      );

      // 初始化数据结构
      let exporterInfo: any = null;
      let factoriesInfo: any[] = [];
      let colleaguesInfo: any[] = [];
      let subordinatesInfo: any[] = [];

      // 根据角色获取详细信息
      if (userRole === "exporter_admin" && primaryExporter) {
        // 出口商管理员：获取出口商信息、所有工厂和用户
        exporterInfo = await db
          .select()
          .from(exportersTable)
          .where(eq(exportersTable.id, primaryExporter.resourceId))
          .limit(1);
        exporterInfo = exporterInfo[0] || null;

        // 获取该出口商下的所有工厂
        factoriesInfo = await db
          .select()
          .from(factoriesTable)
          .where(eq(factoriesTable.exporterId, primaryExporter.resourceId));

        // 获取该出口商下的所有用户（同事）
        colleaguesInfo = await db
          .select({
            userId: usersTable.id,
            userName: usersTable.name,
            userEmail: usersTable.email,
            role: roleTable.name,
            avatar: usersTable.image,
            isPrimary: userResourceRolesTable.isPrimary,
          })
          .from(userResourceRolesTable)
          .innerJoin(
            usersTable,
            eq(usersTable.id, userResourceRolesTable.userId)
          )
          .leftJoin(roleTable, eq(roleTable.id, userResourceRolesTable.roleId))
          .where(
            and(
              eq(userResourceRolesTable.resourceType, "exporter"),
              eq(userResourceRolesTable.resourceId, primaryExporter.resourceId),
              // 不要排除自己，需要显示所有用户
            )
          );

      } else if (userRole === "factory_admin" && primaryFactory) {
        // 工厂管理员：获取工厂信息、出口商信息和业务员
        const factory = await db
          .select()
          .from(factoriesTable)
          .where(eq(factoriesTable.id, primaryFactory.resourceId))
          .limit(1);

        if (factory[0]) {
          // 获取出口商信息
          if (factory[0].exporterId) {
            exporterInfo = await db
              .select()
              .from(exportersTable)
              .where(eq(exportersTable.id, factory[0].exporterId))
              .limit(1);
            exporterInfo = exporterInfo[0] || null;

            // 获取同出口商下的所有工厂
            factoriesInfo = await db
              .select()
              .from(factoriesTable)
              .where(eq(factoriesTable.exporterId, factory[0].exporterId));
          }

          // 获取该工厂下的业务员（下属）
          subordinatesInfo = await db
            .select({
              userId: usersTable.id,
              userName: usersTable.name,
              userEmail: usersTable.email,
              phone: salespersonsTable.phone,
              avatar: usersTable.image,
            })
            .from(userResourceRolesTable)
            .innerJoin(
              usersTable,
              eq(usersTable.id, userResourceRolesTable.userId)
            )
            .innerJoin(roleTable, eq(roleTable.id, userResourceRolesTable.roleId))
            .leftJoin(
              salespersonsTable,
              eq(salespersonsTable.userId, usersTable.id)
            )
            .where(
              and(
                eq(userResourceRolesTable.resourceType, "factory"),
                eq(userResourceRolesTable.resourceId, primaryFactory.resourceId),
                eq(roleTable.name, "salesperson")
              )
            );

          // 获取同出口商下的其他工厂管理员（同事）
          colleaguesInfo = await db
            .select({
              userId: usersTable.id,
              userName: usersTable.name,
              userEmail: usersTable.email,
              role: roleTable.name,
              avatar: usersTable.image,
            })
            .from(userResourceRolesTable)
            .innerJoin(
              usersTable,
              eq(usersTable.id, userResourceRolesTable.userId)
            )
            .leftJoin(roleTable, eq(roleTable.id, userResourceRolesTable.roleId))
            .where(
              and(
                eq(userResourceRolesTable.resourceType, "exporter"),
                eq(userResourceRolesTable.resourceId, factory[0].exporterId!),
                eq(roleTable.name, "factory_admin"),
                eq(usersTable.id, userInfo.id)  // 只包含自己
              )
            );
        }

      } else if (userRole === "salesperson" && primaryFactory) {
        // 业务员：获取所属工厂、出口商信息
        const factory = await db
          .select()
          .from(factoriesTable)
          .where(eq(factoriesTable.id, primaryFactory.resourceId))
          .limit(1);

        if (factory[0]) {
          // 获取出口商信息
          if (factory[0].exporterId) {
            exporterInfo = await db
              .select()
              .from(exportersTable)
              .where(eq(exportersTable.id, factory[0].exporterId))
              .limit(1);
            exporterInfo = exporterInfo[0] || null;

            // 获取同出口商下的所有工厂
            factoriesInfo = await db
              .select()
              .from(factoriesTable)
              .where(eq(factoriesTable.exporterId, factory[0].exporterId));
          }

          // 获取同工厂的同事
          colleaguesInfo = await db
            .select({
              userId: usersTable.id,
              userName: usersTable.name,
              userEmail: usersTable.email,
              role: roleTable.name,
              avatar: usersTable.image,
            })
            .from(userResourceRolesTable)
            .innerJoin(
              usersTable,
              eq(usersTable.id, userResourceRolesTable.userId)
            )
            .leftJoin(roleTable, eq(roleTable.id, userResourceRolesTable.roleId))
            .where(
              and(
                eq(userResourceRolesTable.resourceType, "factory"),
                eq(userResourceRolesTable.resourceId, primaryFactory.resourceId),
                // 不要排除自己
              )
            );
        }
      }

      // 组织固定的返回数据结构
      const userData = {
        // 基础用户信息
        userInfo: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.image,
          role: userRole,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },

        // 组织架构信息（用户的归属）
        organization: {
          // 主要出口商（用户属于哪个出口商）
          exporter: exporterInfo ? {
            id: exporterInfo.id,
            name: exporterInfo.name,
            code: exporterInfo.code,
            address: exporterInfo.address,
            website: exporterInfo.website,
            isActive: exporterInfo.isActive,
            isVerified: exporterInfo.isVerified,
          } : null,

          // 主要工厂（用户属于哪个工厂）
          factory: primaryFactory ? {
            id: primaryFactory.resourceId,
            role: primaryFactory.roleName,
            isPrimary: primaryFactory.isPrimary,
          } : null,

          // 可访问的工厂列表
          accessibleFactories: factoriesInfo.map(f => ({
            id: f.id,
            name: f.name,
            code: f.code,
            description: f.description,
            website: f.website,
            address: f.address,
            contactPhone: f.contactPhone,
            logo: f.logo,
            isActive: f.isActive,
            isVerified: f.isVerified,
          })),

          // 权限范围（数据可见范围）
          scope: {
            // 可以查看的工厂数量
            factoriesCount: factoriesInfo.length,
            // 管理范围描述
            manageScope: userRole === 'exporter_admin'
              ? '管理整个出口商及其所有工厂'
              : userRole === 'factory_admin'
              ? '管理指定工厂'
              : '仅限个人数据',
          }
        },

        // 团队成员信息
        team: {
          // 上级或平级管理员（出口商管理员和工厂管理员）
          managers: userRole === 'salesperson' ? [] : colleaguesInfo
            .filter(c => c.role === 'exporter_admin' || c.role === 'factory_admin')
            .map(c => ({
              id: c.userId,
              name: c.userName,
              email: c.userEmail,
              role: c.role,
              avatar: c.avatar,
              isPrimary: c.isPrimary,
            })),

          // 同事（同级别的用户）
          colleagues: colleaguesInfo
            .filter(c => c.role === userRole) // 只显示同角色的同事
            .map(c => ({
              id: c.userId,
              name: c.userName,
              email: c.userEmail,
              role: c.role,
              avatar: c.avatar,
              isPrimary: c.isPrimary,
            })),

          // 下属（自己管理的用户）
          subordinates: subordinatesInfo.map(s => ({
            id: s.userId,
            name: s.userName,
            email: s.userEmail,
            phone: s.phone,
            avatar: s.avatar,
          })),

          // 统计
          stats: {
            managersCount: (userRole === 'salesperson' ? 0 : colleaguesInfo.filter(c => c.role === 'exporter_admin' || c.role === 'factory_admin').length),
            colleaguesCount: colleaguesInfo.filter(c => c.role === userRole).length,
            subordinatesCount: subordinatesInfo.length,
            teamSize: colleaguesInfo.length + subordinatesInfo.length + (userRole === 'salesperson' ? 0 : 1), // +1 包含自己
          }
        },

        // 快速访问信息（用于前端导航）
        quickAccess: {
          // 当前用户的主要角色
          primaryRole: userRole,

          // 是否有管理权限
          canManage: userRole !== 'salesperson',

          // 可执行的操作
          actions: {
            canCreateUser: userRole !== 'salesperson',
            canCreateFactory: userRole === 'exporter_admin',
            canViewReports: userRole !== 'salesperson',
            canManageProducts: true, // 所有角色都可以管理商品（权限不同）
          }
        }
      };

      return commonRes(userData);
    },
    {
      auth: true,
      detail: {
        summary: "获取当前用户信息",
        description:
          "返回当前登录用户的详细信息，包括基础信息、权限范围和业务数据",
      },
    }
  )

  // 获取当前用户信息
  // .get(
  //   "/me",
  //   async ({ userInfo, roles, permissions }) =>
  //     commonRes(
  //       {
  //         userInfo,
  //         roles,
  //         permissions,
  //       },
  //       200,
  //       "获取用户信息成功"
  //     ),
  //   {
  //     auth: true,
  //     detail: {
  //       summary: "获取当前用户信息",
  //       description: "获取当前登录用户的详细信息，包括基本信息、档案和角色",
  //       tags: ["User"],
  //     },
  //   }
  // )

  // 创建业务员账号
  .post(
    "/salesperson",
    async ({ body, db, roles, permissions }) => {
      console.log("permissions:", permissions);
      try {
        // 权限检查：只有管理员可以创建业务员
        if (!permissions.includes("create_users")) {
          throw new HttpError.Forbidden("权限不足，无法创建业务员账号");
        }

        const { name, email, password, phone, position, factoryId } = body;

        // 检查邮箱是否已存在
        const existingUser = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, email))
          .limit(1);

        if (existingUser.length > 0) {
          return commonRes(null, 400, "邮箱已被使用");
        }

        // 验证工厂权限
        if (roles.includes("factory_admin") || roles.includes("salesperson")) {
          // 工厂管理员和业务员只能在自己管理的工厂下创建业务员
          const accessibleFactoryIds = await getAccessibleFactoryIds(
            db,
            roles,
            permissions
          );
          if (!accessibleFactoryIds.includes(factoryId)) {
            return commonRes(null, 403, "权限不足，无法在该工厂下创建业务员");
          }
        }

        // 使用 Better Auth 创建用户
        const newUser = await auth.api.signUpEmail({
          body: {
            email,
            password,
            name,
          },
        });

        if (!newUser.user) {
          return commonRes(null, 400, "创建用户失败");
        }

        // 创建用户档案
        await db.insert(userProfilesTable).values({
          userId: newUser.user.id,
          phone,
          position,
          isActive: true,
        });

        // 分配销售员角色
        await db.insert(userRolesTable).values({
          userId: newUser.user.id,
          roleId: "salesperson",
          factoryId,
        });

        return commonRes(
          {
            userId: newUser.user.id,
            email: newUser.user.email,
            name: newUser.user.name,
            message: "业务员账号创建成功",
          },
          201,
          "业务员账号创建成功"
        );
      } catch (error) {
        console.error("创建业务员失败:", error);
        return commonRes(null, 500, "创建业务员失败，请稍后重试");
      }
    },
    {
      auth: true,
      body: UserModel.CreateSalespersonRequest,
      detail: {
        summary: "创建业务员账号",
        description: "管理员创建新的业务员账号，需要提供基本信息和关联工厂",
        tags: ["User", "Admin"],
      },
    }
  )

  // 获取可访问的工厂列表
  .get(
    "/factories",
    async ({ db, roles, permissions }) => {
      try {
        // 权限检查
        if (!permissions.includes("view_factories")) {
          return commonRes(null, 403, "权限不足，无法查看工厂列表");
        }

        let factories;

        if (roles.includes("exporter_admin")) {
          // 出口商管理员可以查看所有工厂
          factories = await db
            .select()
            .from(factoriesTable)
            .where(eq(factoriesTable.isActive, true));
        } else if (roles.includes("factory_admin")) {
          // 工厂管理员只能查看自己管理的工厂
          // 这里需要在实际项目中根据具体的工厂-管理员关联关系来查询
          // 暂时返回空数组，需要在实际实现中完善
          factories = [];
        } else {
          // 其他角色无权查看
          return commonRes(null, 403, "权限不足，无法查看工厂列表");
        }

        return commonRes(
          factories.map((factory) => ({
            id: factory.id,
            name: factory.name,
            code: factory.code,
            address: factory.address,
          })),
          200,
          "获取工厂列表成功"
        );
      } catch (error) {
        console.error("获取工厂列表失败:", error);
        return commonRes(null, 500, "获取工厂列表失败，请稍后重试");
      }
    },
    {
      auth: true,
      detail: {
        summary: "获取可访问的工厂列表",
        description: "根据用户权限获取可访问的工厂列表",
        tags: ["User", "Factories"],
      },
    }
  )

  // 获取用户列表
  .get(
    "/list",
    async ({ db, roles, permissions, query }) => {
      try {
        // 权限检查
        if (!permissions.includes("view_users")) {
          return commonRes(null, 403, "权限不足，无法查看用户列表");
        }

        const { page = 1, limit = 20, search = "", role = "" } = query as any;
        const offset = (Number(page) - 1) * Number(limit);

        let queryBuilder = db
          .select({
            id: usersTable.id,
            name: usersTable.name,
            email: usersTable.email,
            phone: userProfilesTable.phone,
            position: userProfilesTable.position,
            isActive: userProfilesTable.isActive,
            createdAt: usersTable.createdAt,
            factoryName: factoriesTable.name,
            factoryId: userRolesTable.factoryId,
            roleName: userRolesTable.roleId,
          })
          .from(usersTable)
          .leftJoin(
            userProfilesTable,
            eq(usersTable.id, userProfilesTable.userId)
          )
          .leftJoin(userRolesTable, eq(usersTable.id, userRolesTable.userId))
          .leftJoin(
            factoriesTable,
            eq(userRolesTable.factoryId, factoriesTable.id)
          );

        // 数据权限过滤
        if (roles.includes("factory_admin")) {
          // 工厂管理员只能看到自己工厂的用户
          const accessibleFactoryIds = await getAccessibleFactoryIds(
            db,
            roles,
            permissions
          );
          if (accessibleFactoryIds.length > 0) {
            // 简化处理，实际应该使用 inArray
            queryBuilder = queryBuilder.where(
              eq(userRolesTable.factoryId, accessibleFactoryIds[0])
            );
          }
        }

        // 分页
        const users = await queryBuilder
          .limit(Number(limit))
          .offset(offset)
          .orderBy(usersTable.createdAt);

        // 获取总数
        const totalCount = users.length; // 简化处理

        return commonRes(
          {
            users: users.map((user) => ({
              ...user,
              createdAt: user.createdAt?.toISOString().split("T")[0],
            })),
            pagination: {
              page: Number(page),
              limit: Number(limit),
              total: totalCount,
              totalPages: Math.ceil(totalCount / Number(limit)),
            },
          },
          200,
          "获取用户列表成功"
        );
      } catch (error) {
        console.error("获取用户列表失败:", error);
        return commonRes(null, 500, "获取用户列表失败，请稍后重试");
      }
    },
    {
      auth: true,
      query: UserModel.UserListParams,
      detail: {
        summary: "获取用户列表",
        description: "分页获取用户列表，支持搜索和角色过滤",
        tags: ["User", "Admin"],
      },
    }
  )

  // 更新用户状态
  .patch(
    "/:userId/status",
    async ({ params, body, db, permissions }) => {
      try {
        // 权限检查
        if (!permissions.includes("edit_users")) {
          return commonRes(null, 403, "权限不足，无法修改用户状态");
        }

        const { userId } = params as { userId: string };
        const { isActive } = body as { isActive: boolean };

        // 更新用户档案状态
        await db
          .update(userProfilesTable)
          .set({ isActive })
          .where(eq(userProfilesTable.userId, userId));

        return commonRes(
          { userId, isActive },
          200,
          `用户${isActive ? "启用" : "停用"}成功`
        );
      } catch (error) {
        console.error("更新用户状态失败:", error);
        return commonRes(null, 500, "更新用户状态失败，请稍后重试");
      }
    },
    {
      auth: true,
      params: t.Object({
        userId: t.String(),
      }),
      body: UserModel.UpdateUserStatusRequest,
      detail: {
        summary: "更新用户状态",
        description: "启用或停用用户账号",
        tags: ["User", "Admin"],
      },
    }
  )

  // 更新用户信息
  .put(
    "/:userId",
    async ({ params, body, db, permissions }) => {
      try {
        // 权限检查
        if (!permissions.includes("edit_users")) {
          return commonRes(null, 403, "权限不足，无法编辑用户信息");
        }

        const { userId } = params as { userId: string };
        const { name, phone, position, factoryId } = body as {
          name?: string;
          phone?: string;
          position?: string;
          factoryId?: string;
        };

        // 更新用户基本信息
        if (name) {
          await db
            .update(usersTable)
            .set({ name })
            .where(eq(usersTable.id, userId));
        }

        // 更新用户档案
        if (phone || position !== undefined) {
          const updateData: any = {};
          if (phone) updateData.phone = phone;
          if (position !== undefined) updateData.position = position;

          await db
            .update(userProfilesTable)
            .set(updateData)
            .where(eq(userProfilesTable.userId, userId));
        }

        // 更新工厂关联
        if (factoryId) {
          await db
            .update(userRolesTable)
            .set({ factoryId })
            .where(eq(userRolesTable.userId, userId));
        }

        return commonRes({ userId, updated: true }, 200, "用户信息更新成功");
      } catch (error) {
        console.error("更新用户信息失败:", error);
        return commonRes(null, 500, "更新用户信息失败，请稍后重试");
      }
    },
    {
      auth: true,
      params: t.Object({
        userId: t.String(),
      }),
      body: UserModel.UpdateUserRequest,
      detail: {
        summary: "更新用户信息",
        description: "更新用户的基本信息、联系方式或工厂关联",
        tags: ["User", "Admin"],
      },
    }
  );

// 获取用户可访问的工厂ID列表
async function getAccessibleFactoryIds(
  db: any,
  roles: string[],
  permissions: string[]
): Promise<string[]> {
  if (roles.includes("exporter_admin")) {
    // 出口商管理员可以访问所有工厂
    const factories = await db
      .select({ id: factoriesTable.id })
      .from(factoriesTable);
    return factories.map((f) => f.id);
  }
  if (roles.includes("factory_admin")) {
    // 工厂管理员只能访问自己管理的工厂
    // 这里需要在实际项目中根据具体的工厂-管理员关联关系来查询
    // 暂时返回空数组，需要在实际实现中完善
    return [];
  }
  return [];
}
