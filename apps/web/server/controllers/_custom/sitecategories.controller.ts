import { productSiteCategoriesTable, productsTable } from "@repo/contract";
import { eq } from "drizzle-orm";
import Elysia, { t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { localeMiddleware } from "~/middleware/locale";
import { siteMiddleware } from "~/middleware/site";
import { siteCategoriesService } from "~/modules";

export const sitecategoriesController = new Elysia({
  prefix: "/sitecategories",
}) // 获取分类树形列表 - 前端用户使用
  .use(localeMiddleware)
  .use(dbPlugin)
  .use(siteMiddleware)
  .get(
    "/",
    ({ locale, db, siteId }) => {
      console.log("获取分类树形列表，当前语言:", locale, "站点ID:", siteId);
      // 调用 service 层的方法
      return siteCategoriesService.getTree({ db, siteId });
    },
    {
      detail: {
        tags: ["Categories"],
        summary: "获取站点分类树",
        description: "获取当前站点的分类树形结构，用于商品分类导航和筛选",
      },
    }
  )
  .get(
    "/:id",
    ({ params: { id }, db, siteId }) => {
      // 获取单个分类 - 前端用户使用
      return siteCategoriesService.getById(id, { db, siteId });
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Categories"],
        summary: "获取分类详情",
        description: "根据分类ID获取详细信息，包括名称、描述、父子关系等",
      },
    }
  )
  .get(
    "/category/:categoryId",
    async ({ params: { categoryId }, db, query }) => {
      const { page = 1, limit = 10 } = query;

      const products = await db
        .select({
          product: productsTable,
        })
        .from(productsTable)
        .innerJoin(
          productSiteCategoriesTable,
          eq(productsTable.id, productSiteCategoriesTable.productId)
        )
        .where(eq(productSiteCategoriesTable.siteCategoryId, categoryId))
        .limit(limit)
        .offset((page - 1) * limit);

      return {
        data: products.map((p) => p.product),
      };
    },
    {
      params: t.Object({
        categoryId: t.String(),
      }),
      query: t.Object({
        page: t.Optional(t.Number()),
        limit: t.Optional(t.Number()),
      }),
      detail: {
        tags: ["Products"],
        summary: "获取分类下的商品",
        description: "根据分类ID获取该分类下的所有商品",
      },
    }
  );
