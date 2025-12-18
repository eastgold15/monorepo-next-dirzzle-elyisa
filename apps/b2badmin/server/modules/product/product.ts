import {
  productMasterCategoriesTable,
  productMediaTable,
  productsTable,
  productTemplateTable,
  siteProductsTable,
} from "@repo/contract";
import { and, desc, eq, inArray, like, or } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { dbPlugin } from "~/db/connection";
import { adminAuthPlugin } from "~/plugins/admin-auth.plugin";
import { localeMiddleware } from "~/plugins/locale";

/**
 * 商品管理接口
 * 支持站点隔离和模板绑定
 * 提供商品的增删改查功能
 */
export const productRoute = new Elysia({
  name: "product",
  prefix: "/product",
  tags: ["商品管理"],
})
  .use(dbPlugin)
  .use(adminAuthPlugin)
  .use(localeMiddleware)

  // 获取所有可用的模板
  .get(
    "/templates",
    async ({ query, db }) => {
      const { search } = query || {};

      // 获取所有模板
      const templates = await db.query.attributeTemplateTable.findMany({
        where: {
          name: {
            like: `%${search}%`,
          },
        },
        with: {
          category: {
            columns: {
              id: true,
              name: true,
            },
          },
          attributes: {
            with: {
              values: {
                orderBy: (values, { asc }) => [asc(values.sortOrder)],
              },
            },
            orderBy: (attributes, { asc }) => [asc(attributes.sortOrder)],
          },
        },
      });

      return templates.map((template) => ({
        id: template.id,
        name: template.name,
        categoryId: template.categoryId,
        categoryName: template.category?.name || "",
        fields: template.attributes.map((attr) => ({
          id: attr.id,
          name: attr.name,
          code: attr.code,
          type: attr.inputType,
          isRequired: attr.isRequired,
          isSkuSpec: attr.isSaleAttr,
          options: attr.values?.map((v) => v.value) || [],
          sortOrder: attr.sortOrder,
        })),
      }));
    },
    {
      auth: true,
      detail: {
        summary: "获取所有可用模板",
        description: "获取系统中所有可用的属性模板列表（全局公用）",
      },
      query: t.Optional(
        t.Object({
          search: t.Optional(t.String()),
        })
      ),
    }
  )

  // 创建商品（支持站点隔离和模板绑定）
  .post(
    "/",
    async ({
      body: {
        name,
        spuCode,
        description,
        status = 1,
        units,
        siteCategoryId,
        templateId,
        price,
        siteName,
        siteDescription,
        imageIds,
        mainImageId,
        seoTitle,
      },
      db,
      currentSite,
    }) => {
      if (!currentSite) {
        throw new HttpError.Forbidden("请先选择站点");
      }

      const result = await db.transaction(async (tx) => {
        // 1. 验证站点分类
        const siteCategory = await tx.query.siteCategoriesTable.findFirst({
          where: {
            id: siteCategoryId,
            siteId: currentSite.id,
          },
        });

        if (!siteCategory) {
          throw new HttpError.NotFound("站点分类不存在");
        }

        // 2. 验证模板（如果提供）
        if (templateId) {
          const template = await tx.query.attributeTemplateTable.findFirst({
            where: { id: templateId },
          });

          if (!template) {
            throw new HttpError.NotFound("模板不存在");
          }

          // 如果站点分类关联了主分类，验证模板是否属于该主分类
          if (
            siteCategory.masterCategoryId &&
            template.categoryId !== siteCategory.masterCategoryId
          ) {
            throw new HttpError.BadRequest("模板不属于该站点分类对应的主分类");
          }
        }

        // 3. 创建商品（全局商品）
        const [product] = await tx
          .insert(productsTable)
          .values({
            name,
            spuCode,
            description,
            status,
            units,
          })
          .returning();

        // 4. 关联模板（如果提供）
        if (templateId) {
          await tx.insert(productTemplateTable).values({
            productId: product.id,
            templateId,
          });
        }

        // 5. 关联主分类（如果站点分类关联了主分类）
        if (siteCategory.masterCategoryId) {
          await tx.insert(productMasterCategoriesTable).values({
            productId: product.id,
            categoryId: siteCategory.masterCategoryId,
          });
        }

        // 6. 关联图片（简化版，只需传递图片ID）
        if (imageIds && imageIds.length > 0) {
          // 验证图片是否存在且属于当前站点
          const existingImages = await tx.query.mediaTable.findMany({
            where: {
              id: { in: imageIds },
              siteId: currentSite.id,
            },
          });

          const foundIds = existingImages.map((img) => img.id);
          const notFound = imageIds.filter((id) => !foundIds.includes(id));

          if (notFound.length > 0) {
            throw new HttpError.NotFound(
              `图片 ID ${notFound.join(", ")} 不存在或不属于当前站点`
            );
          }

          // 添加图片关联
          const productImageData = imageIds.map((imageId, index) => ({
            productId: product.id,
            mediaId: imageId, // 使用正确的字段名 mediaId
            isMain: imageId === mainImageId || (index === 0 && !mainImageId),
          }));
          await tx.insert(productMediaTable).values(productImageData);
        }

        // 7. 创建站点商品关联
        const [siteProduct] = await tx
          .insert(siteProductsTable)
          .values({
            siteId: currentSite.id,
            productId: product.id,
            sitePrice: price ? price.toString() : null, // 转换为字符串以匹配decimal类型
            siteName: siteName || name,
            siteDescription: siteDescription || description,
            siteCategoryId,
            seoTitle,
            isVisible: true,
          })
          .returning();

        return {
          product,
          siteProduct,
        };
      });

      return {
        id: result.product.id,
        name: result.product.name,
        spuCode: result.product.spuCode,
        status: result.product.status,
        siteProductId: result.siteProduct.id,
        message: "商品创建成功",
      };
    },
    {
      auth: true,
      detail: {
        summary: "创建商品",
        description: "创建新商品并绑定到站点分类，支持选择模板",
        tags: ["商品管理"],
      },
      body: t.Object({
        // 商品基础信息
        name: t.String({ minLength: 1, maxLength: 255 }),
        spuCode: t.String({ minLength: 1, maxLength: 64 }),
        description: t.Optional(t.String()),
        status: t.Optional(t.Integer()),
        units: t.Optional(t.String()),

        // 站点分类（必选）
        siteCategoryId: t.String({ format: "uuid" }),

        // 模板（可选）
        templateId: t.Optional(t.String({ format: "uuid" })),

        // 站点商品配置
        price: t.Optional(t.Number()),
        siteName: t.Optional(t.String({ maxLength: 200 })),
        siteDescription: t.Optional(t.String()),
        seoTitle: t.Optional(t.String({ maxLength: 200 })),

        // 图片关联
        imageIds: t.Optional(t.Array(t.String({ format: "uuid" }))),
        mainImageId: t.Optional(t.String({ format: "uuid" })),
      }),
    }
  )

  // 获取商品列表（简化版）
  .get(
    "/",
    async ({
      query: { page = 1, limit = 10, search, categoryId },
      db,
      currentSite,
    }) => {
      if (!currentSite) {
        throw new HttpError.Forbidden("请先选择站点");
      }

      // 构建查询条件
      const conditions: any[] = [
        eq(siteProductsTable.siteId, currentSite.id),
        eq(siteProductsTable.isVisible, true),
      ];

      if (search) {
        conditions.push(
          or(
            like(productsTable.name, `%${search}%`),
            like(productsTable.spuCode, `%${search}%`)
          )
        );
      }

      if (categoryId) {
        conditions.push(eq(siteProductsTable.siteCategoryId, categoryId));
      }

      // 查询数据
      const baseQuery = db
        .select({
          id: productsTable.id,
          name: productsTable.name,
          spuCode: productsTable.spuCode,
          description: productsTable.description,
          status: productsTable.status,
          createdAt: productsTable.createdAt,
          updatedAt: productsTable.updatedAt,
          sitePrice: siteProductsTable.sitePrice,
          siteName: siteProductsTable.siteName,
          siteDescription: siteProductsTable.siteDescription,
          siteCategoryId: siteProductsTable.siteCategoryId,
        })
        .from(siteProductsTable)
        .innerJoin(
          productsTable,
          eq(siteProductsTable.productId, productsTable.id)
        )
        .limit(Number(limit))
        .orderBy(desc(productsTable.createdAt))
        .where(and(...conditions));

      // 分页
      const result = await baseQuery;

      return result;
    },
    {
      auth: true,
      detail: {
        summary: "获取商品列表",
        description: "获取当前站点的商品列表",
        tags: ["商品管理"],
      },
      query: t.Object({
        page: t.Optional(t.Number()),
        limit: t.Optional(t.Number()),
        search: t.Optional(t.String()),
        categoryId: t.Optional(t.String()),
      }),
    }
  )

  // 删除商品（批量）
  .delete(
    "/",
    async ({ body: { ids }, db, currentSite }) => {
      if (!currentSite) {
        throw new HttpError.Forbidden("请先选择站点");
      }

      await db.transaction(async (tx) => {
        // 1. 验证商品是否属于当前站点
        const siteProducts = await tx.query.siteProductsTable.findMany({
          where: {
            productId: { in: ids },
            siteId: currentSite.id,
          },
        });

        if (siteProducts.length !== ids.length) {
          throw new HttpError.Forbidden("部分商品不属于当前站点");
        }

        // 2. 删除站点商品关联
        await tx
          .delete(siteProductsTable)
          .where(
            and(
              eq(siteProductsTable.siteId, currentSite.id),
              inArray(siteProductsTable.productId, ids)
            )
          );

        // 3. 删除其他关联数据
        await tx
          .delete(productMediaTable)
          .where(inArray(productMediaTable.productId, ids));

        await tx
          .delete(productTemplateTable)
          .where(inArray(productTemplateTable.productId, ids));

        await tx
          .delete(productMasterCategoriesTable)
          .where(inArray(productMasterCategoriesTable.productId, ids));

        // 4. 删除商品
        await tx.delete(productsTable).where(inArray(productsTable.id, ids));
      });

      return { message: "删除成功" };
    },
    {
      auth: true,
      detail: {
        summary: "批量删除商品",
        description: "删除属于当前站点的商品",
        tags: ["商品管理"],
      },
      body: t.Object({
        ids: t.Array(t.String()),
      }),
    }
  );
