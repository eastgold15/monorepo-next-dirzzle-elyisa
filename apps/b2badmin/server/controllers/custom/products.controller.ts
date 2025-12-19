import {
  attributeTable,
  attributeTemplateTable,
  attributeValueTable,
  mediaTable,
  ProductsContract,
  productMasterCategoriesTable,
  productMediaTable,
  productsTable,
  productTemplateTable,
  siteCategoriesTable,
  siteProductsTable,
} from "@repo/contract";
import { and, eq, inArray, like, or } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";
import { productsService } from "~/modules/index";

export const productsController = new Elysia({
  prefix: "/products",
  tags: ["Products"],
})
  .use(authGuardMid)
  .use(dbPlugin)

  // 获取所有可用的模板
  .get(
    "/templates",
    async ({ query, db }) => {
      const { search } = query || {};

      const templates = await db
        .select()
        .from(attributeTemplateTable)
        .where(
          search ? like(attributeTemplateTable.name, `%${search}%`) : undefined
        )
        .leftJoin(
          attributeTable,
          eq(attributeTemplateTable.id, attributeTable.templateId)
        );

      // 按模板分组
      const templateMap = new Map();

      for (const row of templates) {
        if (!templateMap.has(row.attribute_templates.id)) {
          templateMap.set(row.attribute_templates.id, {
            id: row.attribute_templates.id,
            name: row.attribute_templates.name,
            categoryId: row.attribute_templates.categoryId,
            categoryName: null,
            fields: [],
          });
        }

        if (row.attributes_table) {
          const template = templateMap.get(row.attribute_templates.id);
          template.fields.push({
            id: row.attributes_table.id,
            name: row.attributes_table.name,
            code: row.attributes_table.code,
            type: row.attributes_table.inputType,
            isRequired: row.attributes_table.isRequired,
            isSkuSpec: row.attributes_table.isSaleAttr,
            sortOrder: row.attributes_table.sortOrder,
          });
        }
      }

      // 为每个模板获取属性值
      const templateIds = Array.from(templateMap.keys());
      const attributeValues =
        templateIds.length > 0
          ? await db
            .select()
            .from(attributeValueTable)
            .where(
              inArray(
                attributeValueTable.attributeId,
                Array.from(templateMap.values()).flatMap((t: any) =>
                  t.fields.map((f: any) => f.id)
                )
              )
            )
          : [];

      // 构建属性值映射
      const valueMap = new Map();
      for (const value of attributeValues) {
        if (!valueMap.has(value.attributeId)) {
          valueMap.set(value.attributeId, []);
        }
        valueMap.get(value.attributeId).push(value.value);
      }

      // 补充 options
      for (const template of templateMap.values()) {
        for (const field of template.fields) {
          field.options = valueMap.get(field.id) || [];
        }
      }

      return Array.from(templateMap.values());
    },
    {
      detail: {
        summary: "获取所有可用模板",
        description: "获取系统中所有可用的属性模板列表（全局公用）",
        tags: ["Products"],
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
        const [siteCategory] = await tx
          .select()
          .from(siteCategoriesTable)
          .where(
            and(
              eq(siteCategoriesTable.id, siteCategoryId),
              eq(siteCategoriesTable.siteId, currentSite.id)
            )
          )
          .limit(1);

        if (!siteCategory) {
          throw new HttpError.NotFound("站点分类不存在");
        }

        // 2. 验证模板（如果提供）
        if (templateId) {
          const [template] = await tx
            .select()
            .from(attributeTemplateTable)
            .where(eq(attributeTemplateTable.id, templateId))
            .limit(1);

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
          const existingImages = await db
            .select()
            .from(mediaTable)
            .where(
              and(
                inArray(mediaTable.id, imageIds),
                eq(mediaTable.siteId, currentSite.id)
              )
            );

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
      detail: {
        summary: "创建商品",
        description: "创建新商品并绑定到站点分类，支持选择模板",
        tags: ["Products"],
      },
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
      const conditions = [
        eq(siteProductsTable.siteId, currentSite.id),
        eq(siteProductsTable.isVisible, true),
      ];

      if (search) {
        conditions.push(
          or(
            like(productsTable.name, `%${search}%`),
            like(productsTable.spuCode, `%${search}%`)
          )!
        );
      }

      if (categoryId) {
        conditions.push(eq(siteProductsTable.siteCategoryId, categoryId));
      }

      // 查询数据
      const result = await db
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
        .offset((page - 1) * limit)
        .where(and(...conditions));

      return result;
    },
    {
      query: t.Object({
        page: t.Optional(t.Number()),
        limit: t.Optional(t.Number()),
        search: t.Optional(t.String()),
        categoryId: t.Optional(t.String()),
      }),
      detail: {
        summary: "获取商品列表",
        description: "获取当前站点的商品列表",
        tags: ["Products"],
      },
    }
  )

  // 批量删除商品
  .delete(
    "/",
    async ({ body: { ids }, db, currentSite }) => {
      if (!currentSite) {
        throw new HttpError.Forbidden("请先选择站点");
      }

      await db.transaction(async (tx) => {
        // 1. 验证商品是否属于当前站点
        const siteProducts = await db
          .select()
          .from(siteProductsTable)
          .where(
            and(
              inArray(siteProductsTable.productId, ids),
              eq(siteProductsTable.siteId, currentSite.id)
            )
          );

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
      body: t.Object({
        ids: t.Array(t.String()),
      }),
      detail: {
        summary: "批量删除商品",
        description: "删除属于当前站点的商品",
        tags: ["Products"],
      },
    }
  )

  // 标准的 CRUD 操作
  .get(
    "/:id",
    ({ params, permissions, auth }) => {
      if (!permissions.includes("PRODUCTS_VIEW")) throw new Error("Forbidden");
      return productsService.findOne(params.id, auth);
    },
    {
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "获取商品详情",
        description: "获取指定商品的详细信息",
        tags: ["Products"],
      },
    }
  )

  .patch(
    "/:id",
    ({ params, body, permissions, auth }) => {
      if (!permissions.includes("PRODUCTS_EDIT")) throw new Error("Forbidden");
      return productsService.update(params.id, body, auth);
    },
    {
      params: t.Object({ id: t.String() }),
      body: ProductsContract.Patch,
      detail: {
        summary: "更新商品信息",
        description: "更新商品的基本信息",
        tags: ["Products"],
      },
    }
  )

  .delete(
    "/:id",
    ({ params, permissions, auth }) => {
      if (!permissions.includes("PRODUCTS_DELETE"))
        throw new Error("Forbidden");
      return productsService.delete(params.id, auth);
    },
    {
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "删除商品",
        description: "删除指定的商品",
        tags: ["Products"],
      },
    }
  );
