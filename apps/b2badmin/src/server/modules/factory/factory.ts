// 工厂控制器

import {
  factoriesTable,
  factoryCategoryTable,
  roleTable,
  userResourceRolesTable,
  usersTable,
} from "@repo/contract/table";
import { CreateFactoryWithAdminRequest } from "@repo/contract/typebox";
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { authClient } from "@/lib/auth-client";
import { dbPlugin } from "@/server/db/connection";
import { commonRes } from "@/server/utils/Res";
import { betterAuthPlugin } from "../auth/auth.plugin";

export const factoryRoute = new Elysia({
  prefix: "/factory",
  tags: ["Factory"],
})
  .use(dbPlugin)
  .use(betterAuthPlugin)

  // 创建工厂和工厂管理员
  .post(
    "/create-with-admin",
    async ({ body, userInfo, db }) => {
      try {
        // 权限检查：只有出口商管理员可以创建工厂
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

        const userRole = userResources.find((r) => r.isPrimary)?.roleName;

        if (userRole !== "exporter_admin") {
          return commonRes(null, 403, "权限不足，只有出口商管理员可以创建工厂");
        }

        const primaryExporter = userResources.find(
          (r) => r.resourceType === "exporter" && r.isPrimary
        );

        if (!primaryExporter) {
          return commonRes(null, 403, "未找到出口商信息");
        }

        const { factory: factoryData, admin: adminData } =
          body as CreateFactoryWithAdminRequest;

        // 检查工厂编码是否已存在
        const existingFactory = await db
          .select()
          .from(factoriesTable)
          .where(eq(factoriesTable.code, factoryData.code))
          .limit(1);

        if (existingFactory.length > 0) {
          return commonRes(null, 400, "工厂编码已存在");
        }

        // 检查管理员邮箱是否已存在
        const existingUser = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, adminData.email))
          .limit(1);

        if (existingUser.length > 0) {
          return commonRes(null, 400, "管理员邮箱已被使用");
        }

        // 获取工厂管理员角色ID
        const factoryAdminRole = await db
          .select()
          .from(roleTable)
          .where(eq(roleTable.name, "factory_admin"))
          .limit(1);

        if (factoryAdminRole.length === 0) {
          return commonRes(null, 500, "系统错误：找不到工厂管理员角色");
        }

        // 使用事务创建工厂和管理员
        const result = await db.transaction(async (tx) => {
          // 1. 创建工厂
          const [newFactory] = await tx
            .insert(factoriesTable)
            .values({
              name: factoryData.name,
              code: factoryData.code,
              description: factoryData.description,
              website: factoryData.website,
              address: factoryData.address,
              contactPhone: factoryData.contactPhone,
              logo: factoryData.logo,
              businessLicense: factoryData.businessLicense,
              mainProducts: factoryData.mainProducts,
              annualRevenue: factoryData.annualRevenue,
              employeeCount: factoryData.employeeCount,
              exporterId: primaryExporter.resourceId,
              isActive: true,
              isVerified: false,
            })
            .returning();

          // 2. 创建工厂管理员用户
          const { data: newUser, error } = await authClient.signUp.email({
            email: adminData.email,
            password: adminData.password,
            name: adminData.name,
          });

          if (!newUser || error) {
            throw new Error("创建用户失败");
          }

          // 3. 分配角色和资源
          await tx.insert(userResourceRolesTable).values({
            userId: newUser.user.id,
            resourceType: "factory",
            resourceId: newFactory.id,
            roleId: factoryAdminRole[0].id,
            isPrimary: true,
          });

          // 4. 同时关联到出口商（非主要）
          await tx.insert(userResourceRolesTable).values({
            userId: newUser.user.id,
            resourceType: "exporter",
            resourceId: primaryExporter.resourceId,
            roleId: factoryAdminRole[0].id,
            isPrimary: false,
          });

          // 5. 关联分类
          if (factoryData.categoryIds && factoryData.categoryIds.length > 0) {
            await tx.insert(factoryCategoryTable).values(
              factoryData.categoryIds.map((categoryId: string) => ({
                factoryId: newFactory.id,
                categoryId,
              }))
            );
          }

          return {
            factory: newFactory,
            admin: {
              id: newUser.user.id,
              name: newUser.user.name,
              email: newUser.user.email,
              role: "factory_admin",
            },
          };
        });

        return commonRes(result, 201, "工厂和管理员创建成功");
      } catch (error) {
        console.error("创建工厂失败:", error);
        return commonRes(null, 500, "创建工厂失败，请稍后重试");
      }
    },
    {
      auth: true,
      body: CreateFactoryWithAdminRequest,
      detail: {
        summary: "创建工厂和工厂管理员",
        description: "出口商管理员创建新工厂，并自动生成一个工厂管理员账号",
      },
    }
  )

  // 获取工厂列表
  .get(
    "/list",
    async ({ userInfo, db, query }) => {
      try {
        // 权限检查：获取用户资源角色
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

        const userRole = userResources.find((r) => r.isPrimary)?.roleName;

        if (!userRole) {
          return commonRes(null, 403, "未找到用户角色");
        }

        const {
          page = 1,
          limit = 20,
          search,
          isActive,
          isVerified,
        } = query as any;
        const offset = (Number(page) - 1) * Number(limit);

        let queryBuilder = db.select().from(factoriesTable).$dynamic();

        // 根据角色过滤数据
        if (userRole === "exporter_admin") {
          const primaryExporter = userResources.find(
            (r) => r.resourceType === "exporter" && r.isPrimary
          );
          if (primaryExporter) {
            queryBuilder.where(
              eq(factoriesTable.exporterId, primaryExporter.resourceId)
            );
          }
        } else if (userRole === "factory_admin") {
          // 工厂管理员只能看到自己管理的工厂
          const primaryFactory = userResources.find(
            (r) => r.resourceType === "factory" && r.isPrimary
          );
          if (primaryFactory) {
            queryBuilder.where(
              eq(factoriesTable.id, primaryFactory.resourceId)
            );
          } else {
            // 如果没有分配工厂，返回空
            return commonRes({
              factories: [],
              pagination: {
                page: Number(page),
                limit: Number(limit),
                total: 0,
                totalPages: 0,
              },
            });
          }
        } else {
          // 其他角色无权查看
          return commonRes(null, 403, "权限不足");
        }

        // 应用搜索和过滤条件
        if (search) {
          queryBuilder = queryBuilder.where(
            eq(factoriesTable.name, `%${search}%`)
          );
        }
        if (isActive !== undefined) {
          queryBuilder = queryBuilder.where(
            eq(factoriesTable.isActive, isActive)
          );
        }
        if (isVerified !== undefined) {
          queryBuilder = queryBuilder.where(
            eq(factoriesTable.isVerified, isVerified)
          );
        }

        // 获取总数
        const totalCountQuery = queryBuilder;
        const factoriesCount = await totalCountQuery;

        // 获取分页数据
        const factories = await queryBuilder
          .limit(Number(limit))
          .offset(offset)
          .orderBy(factoriesTable.createdAt);

        return commonRes({
          factories,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: factoriesCount.length,
            totalPages: Math.ceil(factoriesCount.length / Number(limit)),
          },
        });
      } catch (error) {
        console.error("获取工厂列表失败:", error);
        return commonRes(null, 500, "获取工厂列表失败，请稍后重试");
      }
    },
    {
      auth: true,
      detail: {
        summary: "获取工厂列表",
        description: "根据用户权限获取可访问的工厂列表",
      },
    }
  );
