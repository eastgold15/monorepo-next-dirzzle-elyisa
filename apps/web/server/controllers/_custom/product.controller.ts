import {
  mediaTable,
  ProductsContract,
  productMasterCategoriesTable,
  productMediaTable,
  productsTable,
  skusTable,
} from "@repo/contract";
import { and, eq, exists, like, type SQL, sql } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { localeMiddleware } from "~/plugins/locale";
import { buildPageMeta, paginate } from "~/utils/services/pagination";

export const productController = new Elysia({ prefix: "/product" })
  .use(localeMiddleware)
  .use(dbPlugin)
  .get(
    "/",
    async ({ db, query }) => {
      const {
        page = 1,
        limit = 10,
        sort = "createdAt",
        sortOrder = "desc",
        name,
        categoryId,
      } = query;

      // 1. 严格限制排序字段和排序方向
      const validSortColumns = [
        "id",
        "createdAt",
        "updatedAt",
        "status",
      ] as const;
      type ValidSortColumn = (typeof validSortColumns)[number];
      const sortColumn = validSortColumns.includes(sort as ValidSortColumn)
        ? (sort as ValidSortColumn)
        : "createdAt";
      const validSortOrders = ["asc", "desc"] as const;
      const orderDirection = validSortOrders.includes(
        sortOrder as (typeof validSortOrders)[number]
      )
        ? (sortOrder as (typeof validSortOrders)[number])
        : "desc";

      // 2. 构建类型安全的查询条件
      const conditions: SQL[] = [];
      if (name) {
        conditions.push(like(productsTable.name, `%${name}%`));
      }
      // 修正分类筛选逻辑（避免一对多重复）
      if (categoryId !== undefined) {
        conditions.push(
          exists(
            db
              .select({})
              .from(productMasterCategoriesTable)
              .where(
                and(
                  eq(productMasterCategoriesTable.productId, productsTable.id),
                  eq(productMasterCategoriesTable.categoryId, categoryId)
                )
              )
          )
        );
      }

      // 3. 精准选择需要的字段，避免冲突
      const baseQuery = db
        .select({
          id: productsTable.id,
          name: productsTable.name,
          price: sql<number>`(select min(${skusTable.price}) from ${skusTable} where ${skusTable.productId} = ${productsTable.id}) as price`,
          status: productsTable.status,
          createdAt: productsTable.createdAt,
          updatedAt: productsTable.updatedAt,
          // 关联字段按需选择，重命名避免冲突
          categoryId: productMasterCategoriesTable.categoryId,
          imageUrl: mediaTable.url,
        })
        .from(productsTable)
        .leftJoin(
          productMasterCategoriesTable,
          eq(productsTable.id, productMasterCategoriesTable.productId)
        )
        // 先关联商品图片表，再关联媒体表（链式LEFT JOIN，逻辑上是一个关联单元）
        .leftJoin(
          productMediaTable,
          eq(productsTable.id, productMediaTable.productId)
        )
        .leftJoin(mediaTable, eq(productMediaTable.mediaId, mediaTable.id))
        .$dynamic();

      if (conditions.length > 0) {
        baseQuery.where(and(...conditions));
      }

      // 4. 安全的分页排序
      const paginatedData = await paginate(baseQuery, {
        page: Number(page),
        limit: Number(limit),
        orderBy: productsTable[sortColumn],
        orderDirection,
      });

      return {
        items: paginatedData.items,
        meta: buildPageMeta(paginatedData.total, page, limit),
      };
    },
    {
      query: ProductsContract.ListQuery,
      detail: {
        tags: ["Products"],
        summary: "获取商品列表",
        description: "获取商品列表，支持分页、搜索和筛选",
      },
    }
  )
  .get(
    "/:id",
    async ({ params: { id }, db }) => {
      const product = await db.query.productsTable.findFirst({
        where: { id },
        with: {
          productMedia: {
            with: {
              media: {
                columns: {
                  id: true,
                  mimeType: true,
                  category: true,
                },
              },
            },
          },
          productCategories: {
            columns: {
              categoryId: true,
            },
            with: {
              category: {
                columns: {
                  id: true,
                  name: true,
                  slug: true,
                  description: true,
                },
              },
            },
          },
          skus: {
            with: {
              media: {
                columns: {
                  id: true,
                  url: true,
                  mimeType: true,
                  category: true,
                },
              },
            },
          }, // 添加 SKU 关联查询
        },
      });

      if (!product) {
        throw new Error("商品不存在");
      }

      return product;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Products"],
        summary: "获取商品详情",
        description: "根据ID获取商品详细信息（包含 SKU、图片、分类）",
      },
    }
  );
