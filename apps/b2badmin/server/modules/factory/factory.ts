import type { FactoryTModel as FactoryType } from "@repo/contract";
import { FactoryTModel, factoriesTable, sitesTable, roleTable, userSiteRolesTable } from "@repo/contract";
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { dbPlugin } from "~/db/connection";
import { adminAuthPlugin } from "~/plugins/admin-auth.plugin";

export const factoryRoute = new Elysia({
  prefix: "/factory",
  tags: ["工厂管理"],
})
  .use(dbPlugin)
  .use(adminAuthPlugin)
  // 获取工厂列表
  .get(
    "/list",
    async ({ db, role, tenantId, tenantType }) => {
      // 根据用户权限过滤工厂
      let factories: FactoryType["Entity"][] = [];

      if (role === "super_admin") {
        // 超级管理员可以看到所有工厂
        factories = await db.query.factoriesTable.findMany({
          orderBy: { createdAt: "desc" },
        });
      } else if (role === "exporter_admin") {
        // 出口商管理员可以看到自己名下的工厂
        factories = await db.query.factoriesTable.findMany({
          where: {
            exporterId: tenantId!,
          },
          orderBy: { createdAt: "desc" },
        });
      } else if (role === "factory_admin") {
        // 工厂管理员只能看到自己的工厂
        factories = await db.query.factoriesTable.findMany({
          where: {
            id: tenantId!,
          },
          orderBy: { createdAt: "desc" },
        });
      }

      return {
        factories,
        total: factories.length,
      };
    },
    {
      auth: true,
      detail: {
        summary: "获取工厂列表",
        description: "根据用户权限获取可访问的工厂列表",
      },
    }
  )
  // 创建工厂（仅超级管理员和出口商管理员）
  .post(
    "/",
    async ({ db, body, role, tenantId, user }) => {
      // 只有超级管理员和出口商管理员可以创建工厂
      if (role !== "super_admin" && role !== "exporter_admin") {
        throw new Error("没有权限创建工厂");
      }

      // 创建工厂和对应的站点
      const factory = await db.transaction(async (tx) => {
        // 准备工厂数据，处理可选字段
        const factoryData = {
          name: body.name,
          code: body.code,
          description: body.description || null,
          website: body.website || `https://${body.code.toLowerCase()}.example.com`,
          address: body.address,
          contactPhone: body.contactPhone,
          logo: body.logo || null,
          businessLicense: body.businessLicense || null,
          mainProducts: body.mainProducts || null,
          annualRevenue: body.annualRevenue ? body.annualRevenue.toString() : null,
          employeeCount: body.employeeCount || null,
          // 确保 exporterId 要么是有效值，要么是 null
          exporterId: role === "exporter_admin"
            ? tenantId
            : (body.exporterId ? body.exporterId : null),
          isActive: true,
          isVerified: false, // 默认未认证
        };

        // 创建工厂
        const [newFactory] = await tx
          .insert(factoriesTable)
          .values(factoryData)
          .returning();

        // 为工厂创建站点
        const [newSite] = await tx.insert(sitesTable).values({
          name: body.name,
          domain: body.code.toLowerCase(),
          siteType: "factory",
          factoryId: newFactory.id,
          isActive: true,
        }).returning();

        // 为创建者自动分配权限到新站点
        let creatorRole;
        if (role === "super_admin") {
          creatorRole = await tx.query.roleTable.findFirst({
            where: { name: "super_admin" }
          });
        } else if (role === "exporter_admin") {
          // 出口商管理员创建工厂时，默认获得该工厂的管理员权限
          creatorRole = await tx.query.roleTable.findFirst({
            where: { name: "factory_admin" }
          });
        }

        if (creatorRole) {
          // 创建用户-站点-角色关联
          await tx.insert(userSiteRolesTable).values({
            userId: user.id,
            siteId: newSite.id,
            roleId: creatorRole.id,
          });
        }

        return newFactory;
      });

      return factory;
    },
    {
      auth: true,
      body: FactoryTModel.Create,
      detail: {
        summary: "创建工厂",
        description: "创建新的工厂（仅超级管理员和出口商管理员）",
      },
    }
  )
  // 更新工厂
  .patch(
    "/factoryId/:factoryId",
    async ({ db, body, role, tenantId, params }) => {
      const { factoryId } = params;

      // 先检查工厂是否存在
      let factory;
      if (role === "super_admin") {
        factory = await db.query.factoriesTable.findFirst({
          where: {
            id: factoryId,
          },
        });
      } else if (role === "exporter_admin") {
        factory = await db.query.factoriesTable.findFirst({
          where: {
            id: factoryId,
            exporterId: tenantId!,
          },
        });
      } else if (role === "factory_admin") {
        factory = await db.query.factoriesTable.findFirst({
          where: {
            id: tenantId!,
          },
        });
      } else {
        throw new Error("没有权限更新工厂");
      }

      if (!factory) {
        throw new Error("工厂不存在或无权访问");
      }

      // 更新工厂
      const [updatedFactory] = await db
        .update(factoriesTable)
        .set({
          ...body,
          updatedAt: new Date(),
        })
        .where(eq(factoriesTable.id, factory.id))
        .returning();

      return updatedFactory;
    },
    {
      auth: true,
      body: FactoryTModel.Patch,
      detail: {
        summary: "更新工厂",
        description: "更新工厂信息",
      },
    }
  );
