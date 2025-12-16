import {
  factoriesTable,
  roleTable,
  salespersonAffiliationsTable,
  salespersonsTable,
  sitesTable,
  userSiteRolesTable,
  usersTable,
} from "@repo/contract/table";
import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { dbPlugin } from "~/db/connection";
import { auth } from "~/lib/auth";
import { adminAuthPlugin } from "~/plugins/admin-auth.plugin";

// 用户管理路由
export const userManagementController = new Elysia({
  prefix: "/user/management",
  tags: ["User Management"],
})
  .use(dbPlugin)
  .use(adminAuthPlugin)

  // 创建业务员账号（出口商/工厂管理员）
  .post(
    "/salesperson",
    async ({ body, db, role, tenantId }) => {
      // 出口商可以创建任何工厂的业务员，工厂管理员只能创建自己工厂的业务员
      const isExporterAdmin = role === "exporter_admin";
      const isFactoryAdmin = role === "factory_admin";

      if (!(isExporterAdmin || isFactoryAdmin)) {
        throw new HttpError.Forbidden("无权限创建业务员账号");
      }

      // 如果是工厂管理员，只能创建自己工厂的业务员
      if (isFactoryAdmin && body.factoryId !== tenantId) {
        throw new HttpError.Forbidden("只能在自己工厂创建业务员账号");
      }

      // 使用 Better Auth 创建用户
      const newUser = await auth.api.signUpEmail({
        body: {
          name: body.name,
          email: body.email,
          password: body.password,
        },
      });

      if (!newUser.user) {
        throw new Error("创建用户失败");
      }

      // 创建角色和业务员关联
      await db.transaction(async (tx) => {
        // 获取业务员角色
        const salespersonRole = await tx.query.roleTable.findFirst({
          where: { name: "salesperson" },
        });

        if (!salespersonRole) {
          throw new Error("业务员角色不存在");
        }

        // 先检查工厂是否存在
        const factory = await tx.query.factoriesTable.findFirst({
          where: { id: body.factoryId },
        });

        if (!factory) {
          throw new Error("工厂不存在");
        }

        // 获取工厂对应的站点信息，如果不存在则创建
        let factorySite = await tx.query.sitesTable.findFirst({
          where: {
            factoryId: body.factoryId,
          },
        });

        if (!factorySite) {
          // 为工厂创建站点
          const [newSite] = await tx.insert(sitesTable).values({
            name: factory.name,
            domain: factory.code.toLowerCase(),
            siteType: "factory",
            factoryId: body.factoryId,
            isActive: true,
          }).returning();
          factorySite = newSite;
        }

        // 创建用户-站点-角色关联
        await tx.insert(userSiteRolesTable).values({
          userId: newUser.user.id,
          siteId: factorySite.id,
          roleId: salespersonRole.id,
        });

        // 创建业务员记录
        const [salesperson] = await tx
          .insert(salespersonsTable)
          .values({
            userId: newUser.user.id,
          })
          .returning();

        // 创建业务员-工厂关联
        await tx.insert(salespersonAffiliationsTable).values({
          salespersonId: salesperson.id,
          factoryId: body.factoryId,
          entityType: "factory",
        });
      });

      return newUser;
    },
    {
      auth: true,
      body: t.Object({
        email: t.String({ format: "email" }),
        name: t.String(),
        password: t.String({ minLength: 6 }),
        factoryId: t.String(),
      }),
      detail: {
        summary: "创建业务员账号",
        description: "出口商或工厂管理员创建业务员账号",
      },
    }
  )

  // 创建工厂管理员账号（仅出口商）
  .post(
    "/factory-admin",
    async ({ body, db, role }) => {
      // 只有出口商可以创建工厂管理员
      if (role !== "exporter_admin") {
        throw new HttpError.Forbidden("只有出口商管理员可以创建工厂管理员账号");
      }

      // 使用 Better Auth 创建用户
      const newUser = await auth.api.signUpEmail({
        body: {
          name: body.name,
          email: body.email,
          password: body.password,
        },
      });

      if (!newUser.user) {
        throw new Error("创建用户失败");
      }

      // 创建角色和业务员关联
      await db.transaction(async (tx) => {
        // 获取工厂管理员角色
        const factoryAdminRole = await tx.query.roleTable.findFirst({
          where: { name: "factory_admin" },
        });

        if (!factoryAdminRole) {
          throw new Error("工厂管理员角色不存在");
        }

        // 先检查工厂是否存在
        const factory = await tx.query.factoriesTable.findFirst({
          where: { id: body.factoryId },
        });

        if (!factory) {
          throw new Error("工厂不存在");
        }

        // 获取工厂对应的站点信息，如果不存在则创建
        let factorySite = await tx.query.sitesTable.findFirst({
          where: {
            factoryId: body.factoryId,
          },
        });

        if (!factorySite) {
          // 为工厂创建站点
          const [newSite] = await tx.insert(sitesTable).values({
            name: factory.name,
            domain: factory.code.toLowerCase(),
            siteType: "factory",
            factoryId: body.factoryId,
            isActive: true,
          }).returning();
          factorySite = newSite;
        }

        // 创建用户-站点-角色关联
        await tx.insert(userSiteRolesTable).values({
          userId: newUser.user.id,
          siteId: factorySite.id,
          roleId: factoryAdminRole.id,
        });

        // 创建业务员记录（工厂管理员也是业务员的一种）
        const [salesperson] = await tx
          .insert(salespersonsTable)
          .values({
            userId: newUser.user.id,
          })
          .returning();

        // 创建业务员-工厂关联
        await tx.insert(salespersonAffiliationsTable).values({
          salespersonId: salesperson.id,
          factoryId: body.factoryId,
          entityType: "factory",
        });
      });

      return newUser;
    },
    {
      auth: true,
      body: t.Object({
        email: t.String({ format: "email" }),
        name: t.String(),
        password: t.String({ minLength: 6 }),
        factoryId: t.String(),
      }),
      detail: {
        summary: "创建工厂管理员账号",
        description: "出口商管理员创建工厂管理员账号",
      },
    }
  )

  // 获取当前用户可管理的用户列表
  .get(
    "/",
    async ({ db, role, tenantId, query }) => {
      const { page = 1, limit = 20, search } = query;
      const offset = (page - 1) * limit;

      // 构建查询条件
      const whereConditions: any[] = [];

      // 搜索条件
      if (search) {
        whereConditions.push({
          OR: [
            { name: { like: `%${search}%` } },
            { email: { like: `%${search}%` } },
          ],
        });
      }

      // 根据角色过滤
      if (role === "factory_admin") {
        // 工厂管理员只能看到自己工厂的业务员
        // 通过 salespersonAffiliationsTable 关联查询
        const factorySalespersonIds = await db
          .select({ userId: salespersonsTable.userId })
          .from(salespersonAffiliationsTable)
          .innerJoin(
            salespersonsTable,
            eq(salespersonAffiliationsTable.salespersonId, salespersonsTable.id)
          )
          .where(eq(salespersonAffiliationsTable.factoryId, tenantId!));

        const userIds = factorySalespersonIds.map((item) => item.userId);

        if (userIds.length > 0) {
          whereConditions.push({
            id: { in: userIds },
          });
        } else {
          // 如果没有业务员，返回空列表
          return {
            items: [],
            meta: { total: 0, page, limit, totalPages: 0 },
          };
        }
      } else if (role !== "exporter_admin" && role !== "super_admin") {
        // 其他角色没有管理权限
        return {
          items: [],
          meta: { total: 0, page, limit, totalPages: 0 },
        };
      }

      // 构建最终的 where 条件
      const whereClause =
        whereConditions.length > 0
          ? whereConditions.length === 1
            ? whereConditions[0]
            : { AND: whereConditions }
          : undefined;

      // 查询用户
      const users = await db.query.usersTable.findMany({
        where: whereClause,
        columns: {
          id: true,
          email: true,
          name: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        limit,
        offset,
        with: {
          salesperson: {
            with: {
              affiliations: {
                with: {
                  factory: {
                    columns: { id: true, name: true, code: true },
                  },
                  exporter: {
                    columns: { id: true, name: true, code: true },
                  },
                },
              },
            },
          },
          userSiteRoles: {
            with: {
              role: {
                columns: { id: true, name: true },
              },
              site: {
                columns: { id: true, name: true, siteType: true },
              },
            },
          },
        },
      });

      // 格式化数据
      const formattedUsers = users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
        createdAt: user.createdAt,
        roles: user.userSiteRoles
          ? [
            {
              role: user.userSiteRoles.role,
              site: user.userSiteRoles.site,
            },
          ]
          : [],
        factories:
          user.salesperson?.affiliations
            ?.filter((aff: any) => aff.factoryId)
            ?.map((aff: any) => aff.factory!) || [],
        exporters:
          user.salesperson?.affiliations
            ?.filter((aff: any) => aff.exporterId)
            ?.map((aff: any) => aff.exporter!) || [],
      }));

      // 获取总数
      const total = await db.query.usersTable
        .findMany({
          where: whereClause,
          columns: { id: true },
        })
        .then((res) => res.length);

      return {
        items: formattedUsers,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    },
    {
      auth: true,
      query: t.Object({
        page: t.Optional(t.Numeric()),
        limit: t.Optional(t.Numeric()),
        search: t.Optional(t.String()),
      }),
      detail: {
        summary: "获取可管理的用户列表",
        description: "获取当前用户有权限管理的用户列表",
      },
    }
  )

  // 更新用户状态（启用/禁用）
  .patch(
    "/:id/status",
    async ({ params: { id }, body, db, role, tenantId }) => {
      // 只有出口商、工厂管理员和超级管理员可以更新用户状态
      const canManage =
        role === "exporter_admin" ||
        role === "factory_admin" ||
        role === "super_admin";

      if (!canManage) {
        throw new HttpError.Forbidden("无权限更新用户状态");
      }

      // 检查用户是否存在
      const userRecord = await db.query.usersTable.findFirst({
        where: { id },
        with: {
          salesperson: {
            with: {
              affiliations: true,
            },
          },
        },
      });

      if (!userRecord) {
        throw new HttpError.NotFound("用户不存在");
      }

      // 工厂管理员只能管理自己工厂的用户
      if (role === "factory_admin") {
        // 检查该用户是否属于当前工厂管理员管理的工厂
        const affiliations = userRecord.salesperson?.affiliations;

        if (!(affiliations && Array.isArray(affiliations))) {
          throw new HttpError.Forbidden("只能管理自己工厂的用户");
        }

        const hasAffiliation = affiliations.some(
          (aff: any) => aff.factoryId === tenantId!
        );

        if (!hasAffiliation) {
          throw new HttpError.Forbidden("只能管理自己工厂的用户");
        }
      }

      // 更新用户状态
      const updatedUser = await db
        .update(usersTable)
        .set({ isActive: body.isActive })
        .where(eq(usersTable.id, id))
        .returning()
        .then((res) => res[0]);

      return updatedUser;
    },
    {
      auth: true,
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        isActive: t.Boolean(),
      }),
      detail: {
        summary: "更新用户状态",
        description: "启用或禁用用户账号",
      },
    }
  );
