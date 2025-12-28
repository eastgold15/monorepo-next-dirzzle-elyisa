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
      // 获取所有业务员列表（包含关联数据）
      const allSalespersons = await db.query.salespersonsTable.findMany({
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

      // 根据站点类型在内存中过滤
      let filteredSalespersons = allSalespersons;

      if (currentSite?.siteType === "exporter" && currentSite.exporterId) {
        // 出口商站点：显示该出口商的业务员
        filteredSalespersons = allSalespersons.filter((sp) =>
          sp.affiliations?.some(
            (aff) =>
              aff.entityType === "exporter" &&
              aff.exporterId === currentSite.exporterId
          )
        );
      } else if (currentSite?.siteType === "factory" && currentSite.factoryId) {
        // 工厂站点：只显示该工厂的业务员
        filteredSalespersons = allSalespersons.filter((sp) =>
          sp.affiliations?.some(
            (aff) =>
              aff.entityType === "factory" &&
              aff.factoryId === currentSite.factoryId
          )
        );
      }

      // 分页（page 从 1 开始，所以需要减 1）
      const limit = query.limit ? Number(query.limit) : 10;
      const page = query.page ? Number(query.page) : 1;
      const offset = (page - 1) * limit;

      const paginatedSalespersons = filteredSalespersons.slice(
        offset,
        offset + limit
      );

      return {
        data: paginatedSalespersons,
        total: filteredSalespersons.length,
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
      // 1. 使用 Better Auth 的 signUp.email 创建用户账号
      const res = await authserver.api.signUpEmail({
        body: {
          email: body.email,
          password: body.password,
          name: body.name,
        },
      });

      if (!res?.user) {
        throw new Error("用户创建失败");
      }

      const userId = res.user.id;

      // 2. 创建业务员记录
      const [salesperson] = await db
        .insert(salespersonsTable)
        .values({
          userId,
          phone: body.phone,
          whatsapp: body.whatsapp,
          position: body.position,
          department: body.department,
          avatar: body.avatar,
        })
        .returning();

      // 3. 自动创建归属关系（基于当前登录用户的站点）
      if (currentSite?.siteType === "exporter" && currentSite.exporterId) {
        await db.insert(salespersonAffiliationsTable).values({
          salespersonId: salesperson.id,
          entityType: "exporter",
          exporterId: currentSite.exporterId,
        });
      } else if (currentSite?.siteType === "factory" && currentSite.factoryId) {
        await db.insert(salespersonAffiliationsTable).values({
          salespersonId: salesperson.id,
          entityType: "factory",
          factoryId: currentSite.factoryId,
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
      await db
        .delete(salespersonsTable)
        .where(eq(salespersonsTable.id, params.id));

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
          masterCategories: true,
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
