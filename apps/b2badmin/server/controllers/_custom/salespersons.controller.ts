import {
  SalespersonsContract,
  salespersonAffiliationsTable,
  salespersonMasterCategoriesTable,
  salespersonsTable,
} from "@repo/contract";
import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { auth as authserver } from "~/lib/auth";
import { authGuardMid } from "~/middleware/auth";
export const salespersonsController = new Elysia({
  prefix: "/salespersons",
  tags: ["Salespersons"],
})
  .use(authGuardMid)
  .use(dbPlugin)

  // 获取业务员列表（带用户和归属信息）
  .get(
    "/",
    async ({ query, db, currentSite }) => {
      // 构建查询条件
      const whereCondition: Record<string, unknown> = {};

      // 根据站点类型过滤
      if (currentSite?.siteType === "exporter" && currentSite.exporterId) {
        // 出口商站点：显示该出口商的业务员
        whereCondition.exporterId = currentSite.exporterId;
      } else if (currentSite?.siteType === "factory" && currentSite.factoryId) {
        // 工厂站点：只显示该工厂的业务员
        whereCondition.factoryId = currentSite.factoryId;
      }

      // 获取业务员列表
      const salespersons = await db.query.salespersonsTable.findMany({
        where:
          Object.keys(whereCondition).length > 0 ? whereCondition : undefined,
        with: {
          user: true,
          affiliations: {
            with: {
              factory: true,
              exporter: true,
            },
          },
          masterCategories: true,
        },
        limit: query.limit ? Number(query.limit) : undefined,
        offset: query.page
          ? Number(query.page) * Number(query.limit || 10)
          : undefined,
      });

      // 获取总数
      const total = await db.query.salespersonsTable.findMany({
        where:
          Object.keys(whereCondition).length > 0 ? whereCondition : undefined,
      });

      return {
        data: salespersons,
        total: total.length,
      };
    },
    {
      query: SalespersonsContract.ListQuery,
      detail: {
        summary: "获取业务员列表",
        description:
          "获取当前站点可见的业务员列表，出口商可以看到自己及旗下工厂的业务员",
        tags: ["Salespersons"],
      },
    }
  )

  // 创建业务员（包含用户创建、归属和主分类分配）
  .post(
    "/",
    async ({ body, db, currentSite }) => {
      // 1. 创建用户账号（使用 signUp 而不是 signIn）
      const user = await authserver.api.signUpEmail({
        body: {
          email: body.email,
          password: body.password,
          name: body.name,
        },
      });

      // 2. 创建业务员记录
      const [salesperson] = await db
        .insert(salespersonsTable)
        .values({
          userId: user.user.id,
          phone: body.phone,
          whatsapp: body.whatsapp,
          position: body.position,
          department: body.department,
          avatar: body.avatar,
        })
        .returning();

      // 3. 创建归属关系
      if (body.entityType === "exporter" && body.exporterId) {
        await db.insert(salespersonAffiliationsTable).values({
          salespersonId: salesperson.id,
          entityType: "exporter",
          exporterId: body.exporterId,
        });
      } else if (body.entityType === "factory" && body.factoryId) {
        await db.insert(salespersonAffiliationsTable).values({
          salespersonId: salesperson.id,
          entityType: "factory",
          factoryId: body.factoryId,
        });
      }

      // 4. 分配主分类（如果提供了）
      if (body.masterCategoryIds && body.masterCategoryIds.length > 0) {
        await db.insert(salespersonMasterCategoriesTable).values(
          body.masterCategoryIds.map((masterCategoryId) => ({
            salespersonId: salesperson.id,
            masterCategoryId,
          }))
        );
      }

      // 返回完整的业务员信息
      const result = await db.query.salespersonsTable.findFirst({
        where: { id: salesperson.id },
        with: {
          user: true,
          affiliations: {
            with: {
              factory: true,
              exporter: true,
            },
          },
          masterCategories: true,
        },
      });

      return result;
    },
    {
      body: SalespersonsContract.Create,
      detail: {
        summary: "创建业务员",
        description:
          "创建一个新的业务员，包括用户账号、归属关系和主分类权限分配",
        tags: ["Salespersons"],
      },
    }
  )

  // 更新业务员信息
  .put(
    "/:id",
    async ({ params, body, db }) => {
      const [updated] = await db
        .update(salespersonsTable)
        .set({
          phone: body.phone,
          whatsapp: body.whatsapp,
          position: body.position,
          department: body.department,
          avatar: body.avatar,
          isActive: body.isActive,
        })
        .where(eq(salespersonsTable.id, params.id))
        .returning();

      return updated;
    },
    {
      params: t.Object({ id: t.String() }),
      body: SalespersonsContract.Update,
      detail: {
        summary: "更新业务员信息",
        description: "更新业务员的基本信息",
        tags: ["Salespersons"],
      },
    }
  )

  // 删除业务员
  .delete(
    "/:id",
    async ({ params, db }) => {
      await db.delete(salespersonsTable).where(eq(salespersonsTable.id, params.id));

      return { success: true };
    },
    {
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "删除业务员",
        description: "删除指定的业务员（级联删除关联数据）",
        tags: ["Salespersons"],
      },
    }
  )

  // 获取单个业务员详情
  .get(
    "/:id",
    async ({ params, db }) => {
      const salesperson = await db.query.salespersonsTable.findFirst({
        where: { id: params.id },
        with: {
          user: true,
          affiliations: {
            with: {
              factory: true,
              exporter: true,
            },
          },
          masterCategories: true
        },
      });

      return salesperson;
    },
    {
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "获取业务员详情",
        description: "获取指定业务员的完整信息",
        tags: ["Salespersons"],
      },
    }
  )

  // 更新业务员的主分类
  .put(
    "/:id/master-categories",
    async ({ params, body, db }) => {
      const { masterCategoryIds } = body;

      // 删除现有的主分类关联
      await db
        .delete(salespersonMasterCategoriesTable)
        .where(eq(salespersonMasterCategoriesTable.salespersonId, params.id));

      // 添加新的主分类关联
      if (masterCategoryIds && masterCategoryIds.length > 0) {
        await db.insert(salespersonMasterCategoriesTable).values(
          masterCategoryIds.map((masterCategoryId) => ({
            salespersonId: params.id,
            masterCategoryId,
          }))
        );
      }

      // 返回更新后的业务员信息
      const salesperson = await db.query.salespersonsTable.findFirst({
        where: { id: params.id },
        with: {
          masterCategories: true,
        },
      });

      return salesperson;
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        masterCategoryIds: t.Array(t.String()),
      }),
      detail: {
        summary: "更新业务员的主分类",
        description: "更新业务员负责的主分类列表",
        tags: ["Salespersons"],
      },
    }
  );
