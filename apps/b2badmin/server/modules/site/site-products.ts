import {
  productsTable,
  siteCategoriesTable,
  siteProductsTable,
} from "@repo/contract";
import { and, eq, sql } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { dbPlugin } from "~/db/connection";
import { adminAuthPlugin } from "~/plugins/admin-auth.plugin";

/**
 * 站点商品管理路由
 *
 * 功能说明：
 * 1. 简化的站点商品管理
 * 2. 认证即授权，有currentSite就能操作
 */
export const siteProductsRoute = new Elysia({
  name: "Controller.siteProducts",
  prefix: "/site/products",
  tags: ["站点商品管理"],
})
  .use(dbPlugin)
  .use(adminAuthPlugin)

  // 获取站点商品列表
  .get(
    "/",
    async ({ query, currentSite, db }) => {
      const whereConditions = [eq(siteProductsTable.siteId, currentSite.id)];

      if (query.isVisible !== undefined) {
        whereConditions.push(eq(siteProductsTable.isVisible, query.isVisible));
      }

      if (query.isFeatured !== undefined) {
        whereConditions.push(
          eq(siteProductsTable.isFeatured, query.isFeatured)
        );
      }

      if (query.categoryId) {
        whereConditions.push(
          eq(siteProductsTable.siteCategoryId, query.categoryId)
        );
      }

      const siteProducts = await db
        .select({
          id: siteProductsTable.id,
          siteId: siteProductsTable.siteId,
          productId: siteProductsTable.productId,
          sitePrice: siteProductsTable.sitePrice,
          siteName: siteProductsTable.siteName,
          siteDescription: siteProductsTable.siteDescription,
          isFeatured: siteProductsTable.isFeatured,
          sortOrder: siteProductsTable.sortOrder,
          isVisible: siteProductsTable.isVisible,
          seoTitle: siteProductsTable.seoTitle,
          createdAt: siteProductsTable.createdAt,
          updatedAt: siteProductsTable.updatedAt,
          // 商品信息
          product: {
            id: productsTable.id,
            name: productsTable.name,
            spuCode: productsTable.spuCode,
            description: productsTable.description,
            status: productsTable.status,
          },
          // 分类信息
          category: {
            id: siteCategoriesTable.id,
            name: siteCategoriesTable.name,
          },
        })
        .from(siteProductsTable)
        .innerJoin(
          productsTable,
          eq(productsTable.id, siteProductsTable.productId)
        )
        .leftJoin(
          siteCategoriesTable,
          eq(siteCategoriesTable.id, siteProductsTable.siteCategoryId)
        )
        .where(and(...whereConditions))
        .orderBy(siteProductsTable.sortOrder, siteProductsTable.createdAt)
        .limit(query.limit || 20)
        .offset(query.offset || 0);

      return { data: siteProducts };
    },
    {
      auth: true,
      query: t.Object({
        limit: t.Optional(t.Integer()),
        offset: t.Optional(t.Integer()),
        isVisible: t.Optional(t.Boolean()),
        isFeatured: t.Optional(t.Boolean()),
        categoryId: t.Optional(t.String({ format: "uuid" })),
      }),
      detail: {
        summary: "获取站点商品列表",
        description: "获取当前站点的商品列表",
      },
    }
  )

  // 添加商品到站点
  .post(
    "/",
    async ({ body, currentSite, db }) => {
      // 验证商品存在
      const [product] = await db
        .select({ id: productsTable.id })
        .from(productsTable)
        .where(eq(productsTable.id, body.productId))
        .limit(1);

      if (!product) {
        throw new HttpError.NotFound("商品不存在");
      }

      // 验证分类（如果有）
      if (body.siteCategoryId) {
        const [category] = await db
          .select({ id: siteCategoriesTable.id })
          .from(siteCategoriesTable)
          .where(
            and(
              eq(siteCategoriesTable.id, body.siteCategoryId),
              eq(siteCategoriesTable.siteId, currentSite.id)
            )
          )
          .limit(1);

        if (!category) {
          throw new HttpError.NotFound("分类不存在");
        }
      }

      // 检查是否已存在
      const [existing] = await db
        .select({ id: siteProductsTable.id })
        .from(siteProductsTable)
        .where(
          and(
            eq(siteProductsTable.siteId, currentSite.id),
            eq(siteProductsTable.productId, body.productId)
          )
        )
        .limit(1);

      if (existing) {
        throw new HttpError.BadRequest("商品已存在于站点中");
      }

      const [siteProduct] = await db
        .insert(siteProductsTable)
        .values({
          siteId: currentSite.id,
          productId: body.productId,
          siteCategoryId: body.siteCategoryId || null,
          siteName: body.siteName || null,
          siteDescription: body.siteDescription || null,
          sitePrice: body.sitePrice ? body.sitePrice.toString() : null,
          sortOrder: body.sortOrder || 0,
          isVisible: body.isVisible ?? true,
          isFeatured: body.isFeatured ?? false,
          seoTitle: body.seoTitle || null,
        })
        .returning();

      return { data: siteProduct };
    },
    {
      auth: true,
      body: t.Object({
        productId: t.String({ format: "uuid" }),
        siteCategoryId: t.Optional(t.String({ format: "uuid" })),
        siteName: t.Optional(t.String()),
        siteDescription: t.Optional(t.String()),
        sitePrice: t.Optional(t.Number()),
        sortOrder: t.Optional(t.Integer()),
        isVisible: t.Optional(t.Boolean()),
        isFeatured: t.Optional(t.Boolean()),
        seoTitle: t.Optional(t.String()),
      }),
      detail: {
        summary: "添加商品到站点",
        description: "将商品添加到当前站点",
      },
    }
  )

  // 更新站点商品
  .put(
    "/:siteProductId",
    async ({ params: { siteProductId }, body, currentSite, db }) => {
      const [updated] = await db
        .update(siteProductsTable)
        .set({
          siteCategoryId: body.siteCategoryId,
          siteName: body.siteName,
          siteDescription: body.siteDescription,
          sitePrice: body.sitePrice ? body.sitePrice.toString() : null,
          sortOrder: body.sortOrder,
          isVisible: body.isVisible,
          isFeatured: body.isFeatured,
          seoTitle: body.seoTitle,
        })
        .where(
          and(
            eq(siteProductsTable.id, siteProductId),
            eq(siteProductsTable.siteId, currentSite.id)
          )
        )
        .returning();

      if (!updated) {
        throw new HttpError.NotFound("商品不存在或无权限修改");
      }

      return { data: updated };
    },
    {
      auth: true,
      params: t.Object({
        siteProductId: t.String({ format: "uuid" }),
      }),
      body: t.Object({
        siteCategoryId: t.Optional(t.String({ format: "uuid" })),
        siteName: t.Optional(t.String()),
        siteDescription: t.Optional(t.String()),
        sitePrice: t.Optional(t.Number()),
        sortOrder: t.Optional(t.Integer()),
        isVisible: t.Optional(t.Boolean()),
        isFeatured: t.Optional(t.Boolean()),
        seoTitle: t.Optional(t.String()),
      }),
      detail: {
        summary: "更新站点商品",
        description: "更新商品在站点中的展示信息",
      },
    }
  )

  // 从站点移除商品
  .delete(
    "/:siteProductId",
    async ({ params: { siteProductId }, currentSite, db, status }) => {
      const result = await db
        .delete(siteProductsTable)
        .where(
          and(
            eq(siteProductsTable.id, siteProductId),
            eq(siteProductsTable.siteId, currentSite.id)
          )
        );

      return status(204);
    },
    {
      auth: true,
      params: t.Object({
        siteProductId: t.String({ format: "uuid" }),
      }),
      detail: {
        summary: "移除商品",
        description: "从站点中移除商品",
      },
    }
  )

  // 批量删除站点商品
  .post(
    "/batch-delete",
    async ({ body: { ids }, currentSite, db, status }) => {
      if (!ids || ids.length === 0) {
        throw new HttpError.BadRequest("请选择要删除的商品");
      }

      const result = await db
        .delete(siteProductsTable)
        .where(
          and(
            sql`${siteProductsTable.id} IN (${sql.join(ids, sql`, `)})`,
            eq(siteProductsTable.siteId, currentSite.id)
          )
        );

      return status(204);
    },
    {
      auth: true,
      body: t.Object({
        ids: t.Array(t.String({ format: "uuid" }), { minItems: 1 }),
      }),
      detail: {
        summary: "批量移除商品",
        description: "批量从站点中移除商品",
      },
    }
  );
