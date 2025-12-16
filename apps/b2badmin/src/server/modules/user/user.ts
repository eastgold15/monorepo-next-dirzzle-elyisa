// 用户信息控制器

import { UserManagementTModel } from "@repo/contract";
import {
  factoriesTable,
  roleTable,
  salespersonsTable,
  sitesTable,
  userSiteRolesTable,
  usersTable,
} from "@repo/contract/table";

import { and, count, desc, eq, like, or } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { dbPlugin } from "@/server/db/connection";
import { adminAuthPlugin } from "@/server/plugins/admin-auth.plugin";
import { commonRes } from "@/server/utils/Res";

export const userRoute = new Elysia({
  prefix: "/user",
  tags: ["User"],
})

  .use(dbPlugin)
  .use(adminAuthPlugin)
  .get(
    "/me",
    async ({ user, currentSite, tenantId, tenantType, allSites, db }) => {
      // 获取当前用户的角色（从认证插件中获取的最高权限角色）
      const currentRole = allSites[0]?.role?.name || "salesperson";

      // 初始化数据结构
      let exporterInfo: any = null;
      let factoriesInfo: any[] = [];
      let colleaguesInfo: any[] = [];
      let subordinatesInfo: any[] = [];

      // 根据租户类型获取详细信息
      if (tenantType === "exporter") {
        // 出口商租户
        exporterInfo = await db.query.exportersTable.findFirst({
          where: {
            id: tenantId,
          },
        });

        if (exporterInfo) {
          // 获取该出口商下的所有工厂
          factoriesInfo = await db.query.factoriesTable.findMany({
            where: {
              exporterId: tenantId,
            },
          });
        }
      } else if (tenantType === "factory") {
        // 工厂租户
        const factory = await db.query.factoriesTable.findFirst({
          where: {
            id: tenantId,
          },
        });

        if (factory?.exporterId) {
          // 获取出口商信息
          exporterInfo = await db.query.exportersTable.findFirst({
            where: {
              id: factory.exporterId,
            },
          });

          // 获取同出口商下的所有工厂
          factoriesInfo = await db.query.factoriesTable.findMany({
            where: {
              exporterId: factory.exporterId,
            },
          });
        }
      }

      // 根据角色获取团队信息
      if (currentRole === "SUPER_ADMIN" || currentRole === "exporter_admin") {
        // 获取出口商下的所有用户
        if (exporterInfo) {
          colleaguesInfo = await db
            .select({
              userId: usersTable.id,
              userName: usersTable.name,
              userEmail: usersTable.email,
              role: roleTable.name,
              avatar: usersTable.image,
            })
            .from(userSiteRolesTable)
            .innerJoin(sitesTable, eq(userSiteRolesTable.siteId, sitesTable.id))
            .innerJoin(usersTable, eq(usersTable.id, userSiteRolesTable.userId))
            .leftJoin(roleTable, eq(roleTable.id, userSiteRolesTable.roleId))
            .where(
              and(
                eq(sitesTable.entityId, exporterInfo.id),
                eq(sitesTable.siteType, "exporter")
              )
            );
        }
      } else if (currentRole === "factory_admin") {
        // 获取工厂下的业务员
        subordinatesInfo = await db
          .select({
            userId: usersTable.id,
            userName: usersTable.name,
            userEmail: usersTable.email,
            phone: salespersonsTable.phone,
            avatar: usersTable.image,
          })
          .from(userSiteRolesTable)
          .innerJoin(sitesTable, eq(userSiteRolesTable.siteId, sitesTable.id))
          .innerJoin(usersTable, eq(usersTable.id, userSiteRolesTable.userId))
          .innerJoin(roleTable, eq(roleTable.id, userSiteRolesTable.roleId))
          .leftJoin(
            salespersonsTable,
            eq(salespersonsTable.userId, usersTable.id)
          )
          .where(
            and(
              eq(sitesTable.entityId, tenantId),
              eq(sitesTable.siteType, "factory"),
              eq(roleTable.name, "salesperson")
            )
          );
      } else if (currentRole === "salesperson") {
        // 获取同工厂的同事
        colleaguesInfo = await db
          .select({
            userId: usersTable.id,
            userName: usersTable.name,
            userEmail: usersTable.email,
            role: roleTable.name,
            avatar: usersTable.image,
          })
          .from(userSiteRolesTable)
          .innerJoin(sitesTable, eq(userSiteRolesTable.siteId, sitesTable.id))
          .innerJoin(usersTable, eq(usersTable.id, userSiteRolesTable.userId))
          .leftJoin(roleTable, eq(roleTable.id, userSiteRolesTable.roleId))
          .where(
            and(
              eq(sitesTable.entityId, tenantId),
              eq(sitesTable.siteType, "factory")
            )
          );
      }

      // 组织固定的返回数据结构
      const userData = {
        // 基础用户信息
        userInfo: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.image,
          role: currentRole,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },

        // 组织架构信息（用户的归属）
        organization: {
          // 主要出口商（用户属于哪个出口商）
          exporter: exporterInfo
            ? {
              id: exporterInfo.id,
              name: exporterInfo.name,
              code: exporterInfo.code,
              address: exporterInfo.address,
              website: exporterInfo.website,
              isActive: exporterInfo.isActive,
              isVerified: exporterInfo.isVerified,
            }
            : null,

          // 主要工厂（用户属于哪个工厂）
          factory:
            tenantType === "factory"
              ? {
                id: tenantId,
                role: currentRole,
                isPrimary: true,
              }
              : null,

          // 可访问的工厂列表
          accessibleFactories: factoriesInfo.map((f) => ({
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
            manageScope:
              currentRole === "SUPER_ADMIN" || currentRole === "exporter_admin"
                ? "管理整个出口商及其所有工厂"
                : currentRole === "factory_admin"
                  ? "管理指定工厂"
                  : "仅限个人数据",
          },
        },

        // 团队成员信息
        team: {
          // 上级或平级管理员（出口商管理员和工厂管理员）
          managers:
            currentRole === "salesperson"
              ? []
              : colleaguesInfo
                .filter(
                  (c) =>
                    c.role === "SUPER_ADMIN" ||
                    c.role === "exporter_admin" ||
                    c.role === "factory_admin"
                )
                .map((c) => ({
                  id: c.userId,
                  name: c.userName,
                  email: c.userEmail,
                  role: c.role,
                  avatar: c.avatar,
                  isPrimary: c.isPrimary,
                })),

          // 同事（同级别的用户）
          colleagues: colleaguesInfo
            .filter((c) => c.role === currentRole) // 只显示同角色的同事
            .map((c) => ({
              id: c.userId,
              name: c.userName,
              email: c.userEmail,
              role: c.role,
              avatar: c.avatar,
              isPrimary: c.isPrimary,
            })),

          // 下属（自己管理的用户）
          subordinates: subordinatesInfo.map((s) => ({
            id: s.userId,
            name: s.userName,
            email: s.userEmail,
            phone: s.phone,
            avatar: s.avatar,
          })),

          // 统计
          stats: {
            managersCount:
              currentRole === "salesperson"
                ? 0
                : colleaguesInfo.filter(
                  (c) =>
                    c.role === "SUPER_ADMIN" ||
                    c.role === "exporter_admin" ||
                    c.role === "factory_admin"
                ).length,
            colleaguesCount: colleaguesInfo.filter(
              (c) => c.role === currentRole
            ).length,
            subordinatesCount: subordinatesInfo.length,
            teamSize:
              colleaguesInfo.length +
              subordinatesInfo.length +
              (currentRole === "salesperson" ? 0 : 1), // +1 包含自己
          },
        },

        // 快速访问信息（用于前端导航）
        quickAccess: {
          // 当前用户的主要角色
          primaryRole: currentRole,

          // 是否有管理权限
          canManage: currentRole !== "salesperson",

          // 可执行的操作
          actions: {
            canCreateUser: currentRole !== "salesperson",
            canCreateFactory: currentRole === "exporter_admin",
            canViewReports: currentRole !== "salesperson",
            canManageProducts: true, // 所有角色都可以管理商品（权限不同）
          },
        },

        // 站点信息（新增）
        sites: {
          current: currentSite,
          all: allSites.map((s) => ({
            site: s.site,
            role: s.role,
            priority: s.priority,
          })),
        },
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

  // 获取用户列表
  .get(
    "/list",
    async ({ tenantId, tenantType, db, query }) => {
      try {
        const {
          page = 1,
          limit = 20,
          search,
          role,
          isActive,
          factoryId,
        } = query as any;
        const offset = (Number(page) - 1) * Number(limit);

        // 构建基础查询 - 查询有角色关联的用户
        const queryBuilder = db
          .select({
            userId: usersTable.id,
            userName: usersTable.name,
            userEmail: usersTable.email,
            userPhone: salespersonsTable.phone,
            userPosition: salespersonsTable.position,
            userIsActive: salespersonsTable.isActive,
            userCreatedAt: usersTable.createdAt,
            userUpdatedAt: usersTable.updatedAt,
            roleName: roleTable.name,
            siteId: sitesTable.id,
            siteName: sitesTable.name,
            siteType: sitesTable.siteType,
            factoryId: factoriesTable.id,
            factoryName: factoriesTable.name,
            factoryCode: factoriesTable.code,
          })
          .from(usersTable)
          .innerJoin(
            userSiteRolesTable,
            eq(usersTable.id, userSiteRolesTable.userId)
          )
          .innerJoin(sitesTable, eq(userSiteRolesTable.siteId, sitesTable.id))
          .leftJoin(roleTable, eq(roleTable.id, userSiteRolesTable.roleId))
          .leftJoin(
            salespersonsTable,
            eq(salespersonsTable.userId, usersTable.id)
          )
          .leftJoin(factoriesTable, eq(factoriesTable.id, sitesTable.entityId))
          .$dynamic();

        // 构建条件数组
        const conditions = [];

        // 根据租户类型过滤数据
        if (tenantType === "exporter") {
          // 出口商管理员：查看该出口商下的所有用户（包括所有工厂站点）
          conditions.push(eq(factoriesTable.exporterId, tenantId));
        } else if (tenantType === "factory") {
          // 工厂管理员：查看该工厂下的用户
          conditions.push(eq(sitesTable.entityId, tenantId));
        } else {
          // 其他角色不能查看用户列表
          return commonRes(null, 403, "权限不足");
        }

        // 应用搜索条件
        if (search) {
          conditions.push(
            or(
              like(usersTable.name, `%${search}%`),
              like(usersTable.email, `%${search}%`)
            )
          );
        }

        // 应用角色筛选
        if (role) {
          conditions.push(eq(roleTable.name, role));
        }

        // 应用状态筛选
        if (isActive !== undefined) {
          conditions.push(eq(salespersonsTable.isActive, isActive));
        }

        // 应用工厂筛选
        if (factoryId) {
          conditions.push(eq(factoriesTable.id, factoryId));
        }

        // 获取总数
        const countQuery = db
          .select({ count: count() })
          .from(usersTable)
          .innerJoin(
            userSiteRolesTable,
            eq(usersTable.id, userSiteRolesTable.userId)
          )
          .innerJoin(sitesTable, eq(userSiteRolesTable.siteId, sitesTable.id))
          .leftJoin(roleTable, eq(roleTable.id, userSiteRolesTable.roleId))
          .leftJoin(
            salespersonsTable,
            eq(salespersonsTable.userId, usersTable.id)
          )
          .leftJoin(factoriesTable, eq(factoriesTable.id, sitesTable.entityId));

        if (conditions.length > 0) {
          countQuery.where(and(...conditions));
        }

        const [{ count: totalCount }] = await countQuery;

        console.log("查询到的用户数量:", totalCount);

        // 获取分页数据
        const users = await queryBuilder
          .where(and(...conditions))
          .limit(Number(limit))
          .offset(offset)
          .orderBy(desc(usersTable.createdAt));

        console.log("查询到的用户原始数据:", users);

        // 格式化返回数据
        const formattedUsers = users.map((user) => ({
          id: user.userId,
          name: user.userName,
          email: user.userEmail,
          phone: user.userPhone,
          position:
            user.userPosition ||
            (user.roleName === "factory_admin" ? "工厂管理员" : "未设置"),
          isActive: user.userIsActive ?? true, // 如果没有 salesperson 记录，默认为活跃
          roleName: user.roleName || "unknown",
          siteId: user.siteId,
          siteName: user.siteName,
          siteType: user.siteType,
          factoryName: user.factoryName,
          factoryId: user.factoryId,
          createdAt: user.userCreatedAt?.toISOString().split("T")[0],
        }));

        return commonRes({
          users: formattedUsers,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: totalCount,
            totalPages: Math.ceil(totalCount / Number(limit)),
          },
        });
      } catch (error) {
        console.error("获取用户列表失败:", error);
        return commonRes(null, 500, "获取用户列表失败，请稍后重试");
      }
    },
    {
      auth: true,
      detail: {
        summary: "获取用户列表",
        description: "根据用户权限获取可管理的用户列表，支持搜索和筛选",
      },
    }
  )

  // 创建业务员账号
  .post(
    "/salesperson",
    async ({ body, tenantId, tenantType, roles, db }) => {
      try {
        const userRole = roles[0]; // 从认证中间件获取的用户角色

        // 权限检查：只有管理员可以创建业务员
        if (
          !userRole ||
          (userRole !== "exporter_admin" && userRole !== "factory_admin")
        ) {
          return commonRes(null, 403, "权限不足，只有管理员可以创建业务员账号");
        }

        const { name, email, password, phone, position, factoryId } =
          body as any;

        // 验证工厂权限
        let canCreateInFactory = false;
        if (userRole === "exporter_admin" || userRole === "SUPER_ADMIN") {
          // 出口商管理员或超级管理员可以在该出口商下的任何工厂创建业务员
          if (tenantType === "exporter") {
            const factory = await db.query.factoriesTable.findFirst({
              where: {

                id: factoryId,
                exporterId: tenantId

              }
            });
            canCreateInFactory = !!factory;
          }
        } else if (userRole === "factory_admin") {
          // 工厂管理员只能在自己管理的工厂下创建业务员
          canCreateInFactory = tenantId === factoryId;
        }

        if (!canCreateInFactory) {
          return commonRes(null, 403, "权限不足，无法在该工厂下创建业务员");
        }

        // 检查邮箱是否已存在
        const existingUser = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, email))
          .limit(1);

        if (existingUser.length > 0) {
          return commonRes(null, 400, "邮箱已被使用");
        }

        // 获取业务员角色ID
        const salespersonRole = await db
          .select()
          .from(roleTable)
          .where(eq(roleTable.name, "salesperson"))
          .limit(1);

        if (salespersonRole.length === 0) {
          return commonRes(null, 500, "系统错误：找不到业务员角色");
        }

        // 使用事务创建用户和业务员记录
        const result = await db.transaction(async (tx) => {
          // 1. 创建 Better Auth 用户（这里需要使用 authClient）
          // 由于在 Elysia 路由中，我们需要直接调用 auth 的创建用户方法
          // 暂时使用简单的用户创建，实际应该集成 Better Auth 的 signUp 方法
          const [newUser] = await tx
            .insert(usersTable)
            .values({
              name,
              email,
              emailVerified: false,
            })
            .returning();

          // 2. 获取或创建工厂站点
          let [factorySite] = await tx
            .select()
            .from(sitesTable)
            .where(
              and(
                eq(sitesTable.entityId, factoryId),
                eq(sitesTable.siteType, "factory")
              )
            )
            .limit(1);

          if (!factorySite) {
            // 如果站点不存在，创建一个
            const factory = await tx.query.factoriesTable.findFirst({
              where: {
                id: factoryId
              }
            });
            if (!factory) {
              throw new Error("工厂不存在");
            }
            [factorySite] = await tx
              .insert(sitesTable)
              .values({
                name: `${factory.name} - 管理站点`,
                domain: `${factory.code}.admin.example.com`,
                siteType: "factory",
                entityId: factoryId,
              })
              .returning();
          }

          // 3. 分配角色到站点
          await tx.insert(userSiteRolesTable).values({
            userId: newUser.id,
            siteId: factorySite.id,
            roleId: salespersonRole[0].id,
          });

          // 4. 创建业务员记录
          const [newSalesperson] = await tx
            .insert(salespersonsTable)
            .values({
              userId: newUser.id,
              factoryId,
              phone: phone || null,
              position: position || null,
              isActive: true,
            })
            .returning();

          // 5. 获取工厂名称
          const factory = await tx
            .select({ name: factoriesTable.name })
            .from(factoriesTable)
            .where(eq(factoriesTable.id, factoryId))
            .limit(1);

          return {
            user: newUser,
            salesperson: newSalesperson,
            factoryName: factory[0]?.name || "Unknown",
          };
        });

        return commonRes(
          {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            role: "salesperson",
            factoryId: result.salesperson.factoryId,
            factoryName: result.factoryName,
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
      body: UserManagementTModel.CreateSalespersonRequest,
      detail: {
        summary: "创建业务员账号",
        description: "管理员创建新的业务员账号，需要提供基本信息和关联工厂",
      },
    }
  )

  // 获取可访问的工厂列表
  .get(
    "/factories",
    async ({ tenantId, tenantType, db }) => {
      try {
        let factories: any[] = [];

        if (tenantType === "exporter") {
          // 出口商管理员可以查看所有工厂
          factories = await db.query.factoriesTable.findMany({
            where: {
              exporterId: tenantId,
              isActive: true
            },
            columns: {
              id: true,
              name: true,
              code: true,
              description: true,
              isActive: true,
            },
          });
        } else if (tenantType === "factory") {
          // 工厂管理员只能查看自己管理的工厂
          const factory = await db.query.factoriesTable.findFirst({
            where: {
              id: tenantId,
            },
            columns: {
              id: true,
              name: true,
              code: true,
              description: true,
              isActive: true,
            },
          });
          factories = factory ? [factory] : [];
        } else {
          // 其他角色无权查看
          return commonRes(null, 403, "权限不足");
        }

        return commonRes(factories);
      } catch (error) {
        console.error("获取工厂列表失败:", error);
        return commonRes(null, 500, "获取工厂列表失败，请稍后重试");
      }
    },
    {
      auth: true,
      detail: {
        summary: "获取可访问的工厂列表",
        description: "根据用户权限获取可访问的工厂列表，用于创建业务员时选择",
      },
    }
  )

  // 更新用户状态
  .patch(
    "/:userId/status",
    async ({ params, body, tenantId, tenantType, roles, db }) => {
      try {
        const { userId } = params as { userId: string };
        const { isActive } = body as { isActive: boolean };

        const userRole = roles[0]; // 从认证中间件获取的用户角色

        if (
          !userRole ||
          (userRole !== "exporter_admin" && userRole !== "factory_admin")
        ) {
          return commonRes(null, 403, "权限不足，无法修改用户状态");
        }

        // 检查目标用户是否存在以及其站点关联
        const targetUserSites = await db
          .select({
            userId: usersTable.id,
            userName: usersTable.name,
            siteId: sitesTable.id,
            siteType: sitesTable.siteType,
            entityId: sitesTable.entityId,
            salespersonId: salespersonsTable.id,
            factoryId: salespersonsTable.factoryId,
          })
          .from(usersTable)
          .innerJoin(
            userSiteRolesTable,
            eq(usersTable.id, userSiteRolesTable.userId)
          )
          .innerJoin(sitesTable, eq(userSiteRolesTable.siteId, sitesTable.id))
          .leftJoin(
            salespersonsTable,
            eq(salespersonsTable.userId, usersTable.id)
          )
          .where(eq(usersTable.id, userId));

        if (targetUserSites.length === 0) {
          return commonRes(null, 404, "用户不存在或未分配到任何站点");
        }

        // 权限检查：只能管理自己权限范围内的用户
        let canManage = false;
        if (userRole === "exporter_admin" || userRole === "SUPER_ADMIN") {
          // 出口商管理员或超级管理员可以管理该出口商下的所有用户
          if (tenantType === "exporter") {
            // 检查目标用户是否属于当前出口商
            const hasExporterAccess = targetUserSites.some((site) => {
              if (site.siteType === "exporter" && site.entityId === tenantId) {
                return true;
              }
              if (site.siteType === "factory" && site.factoryId) {
                // 检查工厂是否属于当前出口商
                return db.query.factoriesTable
                  .findFirst({
                    where: and(
                      eq(factoriesTable.id, site.factoryId),
                      eq(factoriesTable.exporterId, tenantId)
                    ),
                  })
                  .then((factory) => !!factory);
              }
              return false;
            });

            // 对出口商管理员，需要检查所有站点
            canManage = await Promise.all(
              targetUserSites.map(async (site) => {
                if (
                  site.siteType === "exporter" &&
                  site.entityId === tenantId
                ) {
                  return true;
                }
                if (site.siteType === "factory" && site.factoryId) {
                  const factory = await db.query.factoriesTable.findFirst({
                    where: {
                      id: site.factoryId,
                      exporterId: tenantId
                    },
                  });
                  return !!factory;
                }
                return false;
              })
            ).then((results) => results.some((r) => r));
          }
        } else if (userRole === "factory_admin") {
          // 工厂管理员只能管理自己工厂的业务员
          canManage = targetUserSites.some(
            (site) => site.siteType === "factory" && site.entityId === tenantId
          );
        }

        if (!canManage) {
          return commonRes(null, 403, "权限不足，无法管理该用户");
        }

        // 更新业务员状态
        const salespersonUser = targetUserSites.find((u) => u.salespersonId);
        if (salespersonUser) {
          await db
            .update(salespersonsTable)
            .set({ isActive })
            .where(eq(salespersonsTable.id, salespersonUser.salespersonId!));
        }

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
        userId: t.String({
          description: "要更新状态的用户ID",
        }),
      }),
      body: UserManagementTModel.UpdateUserStatusRequest,
      detail: {
        summary: "更新用户状态",
        description: "启用或停用用户账号",
      },
    }
  );

// // 创建业务员账号
// .post(
//   "/salesperson",
//   async ({ body, db, roles, permissions }) => {
//     console.log("permissions:", permissions);
//     try {
//       // 权限检查：只有管理员可以创建业务员
//       if (!permissions.includes("create_users")) {
//         throw new HttpError.Forbidden("权限不足，无法创建业务员账号");
//       }

//       const { name, email, password, phone, position, factoryId } = body;

//       // 检查邮箱是否已存在
//       const existingUser = await db
//         .select()
//         .from(usersTable)
//         .where(eq(usersTable.email, email))
//         .limit(1);

//       if (existingUser.length > 0) {
//         return commonRes(null, 400, "邮箱已被使用");
//       }

//       // 验证工厂权限
//       if (roles.includes("factory_admin") || roles.includes("salesperson")) {
//         // 工厂管理员和业务员只能在自己管理的工厂下创建业务员
//         const accessibleFactoryIds = await getAccessibleFactoryIds(
//           db,
//           roles,
//           permissions
//         );
//         if (!accessibleFactoryIds.includes(factoryId)) {
//           return commonRes(null, 403, "权限不足，无法在该工厂下创建业务员");
//         }
//       }

//       // 使用 Better Auth 创建用户
//       const newUser = await auth.api.signUpEmail({
//         body: {
//           email,
//           password,
//           name,
//         },
//       });

//       if (!newUser.user) {
//         return commonRes(null, 400, "创建用户失败");
//       }

//       // 创建用户档案
//       await db.insert(userProfilesTable).values({
//         userId: newUser.user.id,
//         phone,
//         position,
//         isActive: true,
//       });

//       // 分配销售员角色
//       await db.insert(userRolesTable).values({
//         userId: newUser.user.id,
//         roleId: "salesperson",
//         factoryId,
//       });

//       return commonRes(
//         {
//           userId: newUser.user.id,
//           email: newUser.user.email,
//           name: newUser.user.name,
//           message: "业务员账号创建成功",
//         },
//         201,
//         "业务员账号创建成功"
//       );
//     } catch (error) {
//       console.error("创建业务员失败:", error);
//       return commonRes(null, 500, "创建业务员失败，请稍后重试");
//     }
//   },
//   {
//     auth: true,
//     body: UserModel.CreateSalespersonRequest,
//     detail: {
//       summary: "创建业务员账号",
//       description: "管理员创建新的业务员账号，需要提供基本信息和关联工厂",
//       tags: ["User", "Admin"],
//     },
//   }
// )

// // 获取可访问的工厂列表
// .get(
//   "/factories",
//   async ({ db, roles, permissions }) => {
//     try {
//       // 权限检查
//       if (!permissions.includes("view_factories")) {
//         return commonRes(null, 403, "权限不足，无法查看工厂列表");
//       }

//       let factories;

//       if (roles.includes("exporter_admin")) {
//         // 出口商管理员可以查看所有工厂
//         factories = await db
//           .select()
//           .from(factoriesTable)
//           .where(eq(factoriesTable.isActive, true));
//       } else if (roles.includes("factory_admin")) {
//         // 工厂管理员只能查看自己管理的工厂
//         // 这里需要在实际项目中根据具体的工厂-管理员关联关系来查询
//         // 暂时返回空数组，需要在实际实现中完善
//         factories = [];
//       } else {
//         // 其他角色无权查看
//         return commonRes(null, 403, "权限不足，无法查看工厂列表");
//       }

//       return commonRes(
//         factories.map((factory) => ({
//           id: factory.id,
//           name: factory.name,
//           code: factory.code,
//           address: factory.address,
//         })),
//         200,
//         "获取工厂列表成功"
//       );
//     } catch (error) {
//       console.error("获取工厂列表失败:", error);
//       return commonRes(null, 500, "获取工厂列表失败，请稍后重试");
//     }
//   },
//   {
//     auth: true,
//     detail: {
//       summary: "获取可访问的工厂列表",
//       description: "根据用户权限获取可访问的工厂列表",
//       tags: ["User", "Factories"],
//     },
//   }
// )

// // 获取用户列表
// .get(
//   "/list",
//   async ({ db, roles, permissions, query }) => {
//     try {
//       // 权限检查
//       if (!permissions.includes("view_users")) {
//         return commonRes(null, 403, "权限不足，无法查看用户列表");
//       }

//       const { page = 1, limit = 20, search = "", role = "" } = query as any;
//       const offset = (Number(page) - 1) * Number(limit);

//       let queryBuilder = db
//         .select({
//           id: usersTable.id,
//           name: usersTable.name,
//           email: usersTable.email,
//           phone: userProfilesTable.phone,
//           position: userProfilesTable.position,
//           isActive: userProfilesTable.isActive,
//           createdAt: usersTable.createdAt,
//           factoryName: factoriesTable.name,
//           factoryId: userRolesTable.factoryId,
//           roleName: userRolesTable.roleId,
//         })
//         .from(usersTable)
//         .leftJoin(
//           userProfilesTable,
//           eq(usersTable.id, userProfilesTable.userId)
//         )
//         .leftJoin(userRolesTable, eq(usersTable.id, userRolesTable.userId))
//         .leftJoin(
//           factoriesTable,
//           eq(userRolesTable.factoryId, factoriesTable.id)
//         );

//       // 数据权限过滤
//       if (roles.includes("factory_admin")) {
//         // 工厂管理员只能看到自己工厂的用户
//         const accessibleFactoryIds = await getAccessibleFactoryIds(
//           db,
//           roles,
//           permissions
//         );
//         if (accessibleFactoryIds.length > 0) {
//           // 简化处理，实际应该使用 inArray
//           queryBuilder = queryBuilder.where(
//             eq(userRolesTable.factoryId, accessibleFactoryIds[0])
//           );
//         }
//       }

//       // 分页
//       const users = await queryBuilder
//         .limit(Number(limit))
//         .offset(offset)
//         .orderBy(usersTable.createdAt);

//       // 获取总数
//       const totalCount = users.length; // 简化处理

//       return commonRes(
//         {
//           users: users.map((user) => ({
//             ...user,
//             createdAt: user.createdAt?.toISOString().split("T")[0],
//           })),
//           pagination: {
//             page: Number(page),
//             limit: Number(limit),
//             total: totalCount,
//             totalPages: Math.ceil(totalCount / Number(limit)),
//           },
//         },
//         200,
//         "获取用户列表成功"
//       );
//     } catch (error) {
//       console.error("获取用户列表失败:", error);
//       return commonRes(null, 500, "获取用户列表失败，请稍后重试");
//     }
//   },
//   {
//     auth: true,
//     query: UserModel.UserListParams,
//     detail: {
//       summary: "获取用户列表",
//       description: "分页获取用户列表，支持搜索和角色过滤",
//       tags: ["User", "Admin"],
//     },
//   }
// )

// // 更新用户状态
// .patch(
//   "/:userId/status",
//   async ({ params, body, db, permissions }) => {
//     try {
//       // 权限检查
//       if (!permissions.includes("edit_users")) {
//         return commonRes(null, 403, "权限不足，无法修改用户状态");
//       }

//       const { userId } = params as { userId: string };
//       const { isActive } = body as { isActive: boolean };

//       // 更新用户档案状态
//       await db
//         .update(userProfilesTable)
//         .set({ isActive })
//         .where(eq(userProfilesTable.userId, userId));

//       return commonRes(
//         { userId, isActive },
//         200,
//         `用户${isActive ? "启用" : "停用"}成功`
//       );
//     } catch (error) {
//       console.error("更新用户状态失败:", error);
//       return commonRes(null, 500, "更新用户状态失败，请稍后重试");
//     }
//   },
//   {
//     auth: true,
//     params: t.Object({
//       userId: t.String(),
//     }),
//     body: UserModel.UpdateUserStatusRequest,
//     detail: {
//       summary: "更新用户状态",
//       description: "启用或停用用户账号",
//       tags: ["User", "Admin"],
//     },
//   }
// )

// // 更新用户信息
// .put(
//   "/:userId",
//   async ({ params, body, db, permissions }) => {
//     try {
//       // 权限检查
//       if (!permissions.includes("edit_users")) {
//         return commonRes(null, 403, "权限不足，无法编辑用户信息");
//       }

//       const { userId } = params as { userId: string };
//       const { name, phone, position, factoryId } = body as {
//         name?: string;
//         phone?: string;
//         position?: string;
//         factoryId?: string;
//       };

//       // 更新用户基本信息
//       if (name) {
//         await db
//           .update(usersTable)
//           .set({ name })
//           .where(eq(usersTable.id, userId));
//       }

//       // 更新用户档案
//       if (phone || position !== undefined) {
//         const updateData: any = {};
//         if (phone) updateData.phone = phone;
//         if (position !== undefined) updateData.position = position;

//         await db
//           .update(userProfilesTable)
//           .set(updateData)
//           .where(eq(userProfilesTable.userId, userId));
//       }

//       // 更新工厂关联
//       if (factoryId) {
//         await db
//           .update(userRolesTable)
//           .set({ factoryId })
//           .where(eq(userRolesTable.userId, userId));
//       }

//       return commonRes({ userId, updated: true }, 200, "用户信息更新成功");
//     } catch (error) {
//       console.error("更新用户信息失败:", error);
//       return commonRes(null, 500, "更新用户信息失败，请稍后重试");
//     }
//   },
//   {
//     auth: true,
//     params: t.Object({
//       userId: t.String(),
//     }),
//     body: UserModel.UpdateUserRequest,
//     detail: {
//       summary: "更新用户信息",
//       description: "更新用户的基本信息、联系方式或工厂关联",
//       tags: ["User", "Admin"],
//     },
//   }
// );

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
    return factories.map((f: { id: string }) => f.id);
  }
  if (roles.includes("factory_admin")) {
    // 工厂管理员只能访问自己管理的工厂
    // 这里需要在实际项目中根据具体的工厂-管理员关联关系来查询
    // 暂时返回空数组，需要在实际实现中完善
    return [];
  }
  return [];
}
