import {
  FactoriesContract,
  factoriesTable,
  sitesTable,
  userSiteRolesTable,
} from "@repo/contract";
import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";
import { factoriesService } from "~/modules/index";

export const factoriesController = new Elysia({
  prefix: "/factories",
  tags: ["Factories"],
})
  .use(authGuardMid)
  .use(dbPlugin)

  // 获取工厂列表（包含业务逻辑）
  .get(
    "/list",
    async ({ db, role, exporterId, factoryId }) => {
      let factories: any[] = [];

      if (role.name === "SUPER_ADMIN") {
        // 超级管理员可以看到所有工厂
        factories = await db.query.factoriesTable.findMany({
          orderBy: { createdAt: "desc" },
          with: {
            sites: {
              where: {
                siteType: "factory",
              },
              columns: {
                id: true,
                name: true,
                domain: true,
                isActive: true,
              },
            },
          },
        });
      } else if (role.name === "EXPORTER_ADMIN") {
        // 出口商管理员可以看到自己名下的工厂
        factories = await db.query.factoriesTable.findMany({
          where: {
            exporterId: exporterId!,
          },
          orderBy: { createdAt: "desc" },
          with: {
            sites: {
              where: {
                siteType: "factory",
              },
              columns: {
                id: true,
                name: true,
                domain: true,
                isActive: true,
              },
            },
          },
        });
      } else if (role.name === "FACTORY_ADMIN") {
        // 工厂管理员只能看到自己的工厂
        factories = await db.query.factoriesTable.findMany({
          where: {
            id: factoryId!,
          },
          orderBy: { createdAt: "desc" },
          with: {
            sites: {
              where: {
                siteType: "factory",
              },
              columns: {
                id: true,
                name: true,
                domain: true,
                isActive: true,
              },
            },
          },
        });
      }

      return factories;
    },
    {
      detail: {
        summary: "获取工厂列表",
        description: "根据用户权限获取可访问的工厂列表",
        tags: ["Factories"],
      },
    }
  )

  // 创建工厂（包含业务逻辑）
  .post(
    "/",
    async ({ db, body, role, exporterId, user }) => {
      // 创建工厂和对应的站点
      const factory = await db.transaction(async (tx) => {
        // 准备工厂数据
        const factoryData = {
          name: body.name,
          code: body.code,
          description: body.description || null,
          website:
            body.website || `https://${body.code.toLowerCase()}.example.com`,
          address: body.address,
          contactPhone: body.contactPhone,
          logo: body.logo || null,
          businessLicense: body.businessLicense || null,
          mainProducts: body.mainProducts || null,
          annualRevenue: body.annualRevenue
            ? body.annualRevenue.toString()
            : null,
          employeeCount: body.employeeCount || null,
          exporterId,
          isActive: true,
          isVerified: false, // 默认未认证
        };

        // 创建工厂
        const [newFactory] = await tx
          .insert(factoriesTable)
          .values(factoryData)
          .returning();

        // 为工厂创建站点
        const [newSite] = await tx
          .insert(sitesTable)
          .values({
            name: body.name,
            domain: body.code.toLowerCase(),
            siteType: "factory",
            factoryId: newFactory.id,
            isActive: true,
          })
          .returning();

        // 为创建者自动分配权限到新站点
        let creatorRole;
        if (role.name === "SUPER_ADMIN") {
          creatorRole = await tx.query.roleTable.findFirst({
            where: { name: "SUPER_ADMIN" },
          });
        } else if (role.name === "EXPORTER_ADMIN") {
          // 出口商管理员创建工厂时，默认获得该工厂的管理员权限
          creatorRole = await tx.query.roleTable.findFirst({
            where: { name: "FACTORY_ADMIN" },
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
      body: FactoriesContract.Create,
      detail: {
        summary: "创建工厂",
        description: "创建新的工厂（仅超级管理员和出口商管理员）",
        tags: ["Factories"],
      },
    }
  )

  // 更新工厂（包含业务逻辑）
  .put(
    "/:id",
    async ({ db, body, role, exporterId, factoryId, params }) => {
      const { factoryId: paramFactoryId } = params;

      // 先检查工厂是否存在
      let factory;
      if (role.name === "SUPER_ADMIN") {
        factory = await db.query.factoriesTable.findFirst({
          where: {
            id: paramFactoryId,
          },
        });
      } else if (role.name === "EXPORTER_ADMIN") {
        factory = await db.query.factoriesTable.findFirst({
          where: {
            id: paramFactoryId,
            exporterId: exporterId!,
          },
        });
      } else if (role.name === "FACTORY_ADMIN") {
        factory = await db.query.factoriesTable.findFirst({
          where: {
            id: factoryId!,
          },
        });
      } else {
        throw new HttpError.Forbidden("没有权限更新工厂");
      }

      if (!factory) {
        throw new HttpError.NotFound("工厂不存在或无权访问");
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
      params: t.Object({
        factoryId: t.String(),
      }),
      body: FactoriesContract.Update,
      detail: {
        summary: "更新工厂信息",
        description: "更新工厂信息，需要相应的权限",
        tags: ["Factories"],
      },
    }
  )

  // 标准的 CRUD 操作
  // .get(
  //   "/",
  //   ({ query, permissions, auth, db }) =>
  //     factoriesService.findAll(query, { auth, db }),
  //   {
  //     allPermission: "FACTORIES_VIEW",
  //     query: FactoriesContract.ListQuery,
  //     detail: {
  //       summary: "获取工厂分页列表",
  //       description: "分页获取工厂列表，支持复杂的查询条件",
  //       tags: ["Factories"],
  //     },
  //   }
  // )

  .delete(
    "/:id",
    ({ params, permissions, auth, db }) =>
      factoriesService.delete(params.id, { db, auth }),
    {
      allPermission: "FACTORIES_DELETE",
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "删除工厂",
        description: "删除指定的工厂，需要相应的权限",
        tags: ["Factories"],
      },
    }
  )

  // 获取工厂详情（包含站点信息）
  .get(
    "/detail/:id/",
    async ({ params, db, role, exporterId, factoryId }) => {
      const { id } = params;

      let whereCondition = {};
      if (role.name === "SUPER_ADMIN") {
        whereCondition = { id };
      } else if (role.name === "EXPORTER_ADMIN") {
        whereCondition = { id, exporterId: exporterId! };
      } else if (role.name === "FACTORY_ADMIN") {
        whereCondition = { id: factoryId! };
      } else {
        throw new HttpError.Forbidden("没有权限查看工厂详情");
      }

      const factory = await db.query.factoriesTable.findFirst({
        where: whereCondition,
        with: {
          sites: {
            where: {
              siteType: "factory",
            },
            with: {
              userSiteRoles: {
                with: {
                  user: {
                    columns: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                  role: {
                    columns: {
                      id: true,
                      name: true,
                      priority: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!factory) {
        throw new HttpError.NotFound("工厂不存在或无权访问");
      }

      return { data: factory };
    },
    {
      allPermission: "FACTORIES_VIEW",
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: "获取工厂详情",
        description: "获取工厂的详细信息，包括关联的站点和用户",
        tags: ["Factories"],
      },
    }
  );
