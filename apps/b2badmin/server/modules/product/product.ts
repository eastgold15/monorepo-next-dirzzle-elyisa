import { ProductModel } from "@repo/contract";
import { and, count, desc, eq, inArray, like, max, or, sql } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { dbPlugin } from "@/server/db/connection";
import {
  productCategoriesTable,
  productMediaTable,
  productsTable,
  productTemplateTable,
  skusTable,
} from "@/server/db/schema";
import { localeMiddleware } from "@/server/plugins/locale";
import { type CommonRes, commonRes, type PageData } from "@/server/utils/Res";
import { buildPageMeta, paginate } from "@/server/utils/services";
import { translateService } from "../translations/translate.service";

/**
 * 商品管理接口
 * 后台管理使用全量更新，那么创建和更新可以共用schema
 * 提供商品的增删改查功能
 */
export const product2Route = new Elysia({
  name: "product",
  prefix: "/v2/products",
})
  .use(dbPlugin)
  .use(localeMiddleware)
  .post(
    "/",
    async ({
      body: {
        name,
        spuCode,
        categoryIds,
        templateId,
        description,
        status,
        imageIds,
        mainImageId,
      },
      db,
    }) => {
      const res = await db.transaction(async (tx) => {
        const [inserted] = await tx
          .insert(productsTable)
          .values({
            name,
            spuCode,
            description,
            status,
          })
          .returning();

        if (!inserted) {
          throw new HttpError.InternalServerError("创建失败");
        }

        // 填入模板
        await tx.insert(productTemplateTable).values({
          productId: inserted.id,
          templateId,
        });

        // 3. 关联分类
        if (categoryIds && categoryIds.length > 0) {
          await tx.insert(productCategoriesTable).values(
            categoryIds.map((categoryId) => ({
              productId: inserted.id,
              categoryId,
            }))
          );
        }

        // 4. 关联图片
        if (imageIds && imageIds.length > 0) {
          // 验证图片是否存在
          const existingImages = await tx.query.mediaTable.findMany({
            where: (media, { inArray }) => inArray(media.id, imageIds),
          });
          const foundIds = existingImages.map((img) => img.id);
          const notFound = imageIds.filter((id) => !foundIds.includes(id));

          if (notFound.length > 0) {
            throw new HttpError.NotFound(
              `图片 ID ${notFound.join(", ")} 不存在`
            );
          }

          // 添加图片关联
          const productImageData = imageIds.map((imageId, index) => ({
            productId: inserted.id,
            imageId,
            isMain: imageId === mainImageId || (index === 0 && !mainImageId),
          }));
          await tx.insert(productMediaTable).values(productImageData);
        }

        return inserted;
      });

      return commonRes(res);
    },
    {
      detail: {
        summary: "创建商品",
        description: "创建新商品，同时关联属性模板、分类和图片",
        tags: ["商品管理"],
      },
      body: ProductModel.Create,
    }
  )
  .delete(
    "/",
    ({ body: { ids }, db }) => {
      return db.transaction(async (tx) => {
        // 1. 删除分类关联
        await tx
          .delete(productCategoriesTable)
          .where(inArray(productCategoriesTable.productId, ids));

        // 2. 删除模板关联
        await tx
          .delete(productTemplateTable)
          .where(inArray(productTemplateTable.productId, ids));

        // 3. 删除商品本身
        const res = await tx
          .delete(productsTable)
          .where(inArray(productsTable.id, ids))
          .returning();

        if (!res.length) {
          throw new HttpError.NotFound("商品不存在");
        }
        return commonRes("删除成功", 204);
      });
    },
    {
      detail: {
        summary: "批量删除商品",
        description: "根据ID列表批量删除商品，会同时删除关联的分类和模板关系",
        tags: ["商品管理"],
      },
      body: t.Object({
        ids: t.Array(t.String({ description: "商品ID列表" })),
      }),
    }
  )

  .put(
    "update/:id",
    async ({ params: { id }, body, db }) => {
      const {
        name,
        spuCode,
        categoryIds,
        templateId,
        description,
        status,
        imageIds,
        mainImageId,
      } = body;

      const updated = await db.transaction(async (tx) => {
        // 1. 检查商品是否存在
        const [existing] = await tx
          .select()
          .from(productsTable)
          .where(eq(productsTable.id, id))
          .limit(1);

        if (!existing) {
          throw new HttpError.NotFound("商品不存在");
        }

        // 2. 更新商品基础信息
        const updateData: any = {};
        if (name !== undefined) {
          updateData.name = name;
        }
        if (spuCode !== undefined) {
          updateData.spuCode = spuCode;
        }
        if (description !== undefined) {
          updateData.description = description;
        }
        if (status !== undefined) {
          updateData.status = status;
        }

        const [updatedProduct] = await tx
          .update(productsTable)
          .set(updateData)
          .where(eq(productsTable.id, id))
          .returning();

        // 3. 更新模板（如果提供了 templateId）
        if (templateId !== undefined) {
          await tx
            .delete(productTemplateTable)
            .where(eq(productTemplateTable.productId, id));

          await tx.insert(productTemplateTable).values({
            productId: id,
            templateId,
          });
        }

        // 4. 更新分类（如果提供了 categoryIds）
        if (categoryIds !== undefined) {
          await tx
            .delete(productCategoriesTable)
            .where(eq(productCategoriesTable.productId, id));

          if (categoryIds.length > 0) {
            await tx.insert(productCategoriesTable).values(
              categoryIds.map((categoryId) => ({
                productId: id,
                categoryId,
              }))
            );
          }
        }

        // 5. 更新图片关联（如果提供了 imageIds）
        if (imageIds !== undefined) {
          // 验证图片是否存在
          if (imageIds.length > 0) {
            const existingImages = await tx.query.mediaTable.findMany({
              where: (images, { inArray }) => inArray(images.id, imageIds),
            });
            const foundIds = existingImages.map((img) => img.id);
            const notFound = imageIds.filter((id) => !foundIds.includes(id));

            if (notFound.length > 0) {
              throw new HttpError.NotFound(
                `图片 ID ${notFound.join(", ")} 不存在`
              );
            }
          }

          // 删除现有的图片关联
          await tx
            .delete(productMediaTable)
            .where(eq(productMediaTable.productId, id));

          // 添加新的图片关联
          if (imageIds.length > 0) {
            const productImageData = imageIds.map((imageId, index) => ({
              productId: id,
              imageId,
              isMain: imageId === mainImageId || (index === 0 && !mainImageId),
            }));
            await tx.insert(productMediaTable).values(productImageData);
          }
        }

        return updatedProduct;
      });

      return commonRes(updated);
    },
    {
      detail: {
        summary: "更新商品",
        description:
          "根据ID更新商品信息，支持更新基本信息、模板、分类关联和图片关联",
        tags: ["商品管理"],
      },
      params: t.Object({
        id: t.String({ description: "商品ID" }),
      }),
      body: ProductModel.Update,
    }
  )

  // 查
  .get(
    "/",
    async ({
      query,
      db,
    }): Promise<CommonRes<PageData<ProductModel["Entity"]>>> => {
      const {
        page = 1,
        limit = 10,
        sort = "createdAt",
        sortOrder = "desc",
        search,
        categoryId,
      } = query;

      // 基础查询：商品 + 模板ID + 分类信息 + 图片信息
      let baseQuery = db
        .select({
          id: productsTable.id,
          name: productsTable.name,
          spuCode: productsTable.spuCode,
          description: productsTable.description,
          status: productsTable.status,
          createdAt: productsTable.createdAt,
          updatedAt: productsTable.updatedAt,
          templateId: max(productTemplateTable.templateId),
          categoryIds: sql<string>`json_agg(${productCategoriesTable.categoryId})`,
          imageIds: sql<string>`json_agg(${productMediaTable.imageId})`,
          factoryId: productsTable.factoryId,
          units: productsTable.units,
        })
        .from(productsTable)
        .leftJoin(
          productTemplateTable,
          eq(productsTable.id, productTemplateTable.productId)
        )
        .leftJoin(
          productCategoriesTable,
          eq(productsTable.id, productCategoriesTable.productId)
        )
        .leftJoin(
          productMediaTable,
          eq(productsTable.id, productMediaTable.productId)
        )
        .groupBy(productsTable.id)
        .$dynamic();

      const finalConditions: any[] = [];

      if (search) {
        finalConditions.push(
          or(
            like(productsTable.name, `%${search}%`),
            like(productsTable.spuCode, `%${search}%`)
          )
        );
      }

      if (categoryId !== undefined) {
        finalConditions.push(eq(productCategoriesTable.categoryId, categoryId));
      }

      if (finalConditions.length > 0) {
        baseQuery = baseQuery.where(and(...finalConditions));
      }

      // 排序
      const allowedSortFields = {
        id: productsTable.id,
        name: productsTable.name,
        spuCode: productsTable.spuCode,
        createdAt: productsTable.createdAt,
        updatedAt: productsTable.updatedAt,
      };

      const orderBy =
        allowedSortFields[sort as keyof typeof allowedSortFields] ||
        productsTable.createdAt;
      const orderDirection = sortOrder === "desc" ? "desc" : "asc";

      // 分页
      const result = await paginate(baseQuery, {
        page,
        limit,
        orderBy,
        orderDirection,
      });

      const res = result.items.map((item) => {
        // 处理图片ID数组，过滤null值并转换为字符串
        let imageIds: string[] = [];
        if (item.imageIds) {
          try {
            // 检查是否已经是数组
            if (Array.isArray(item.imageIds)) {
              imageIds = item.imageIds.filter((id) => id !== null).map(String);
            } else if (
              typeof item.imageIds === "string" &&
              item.imageIds.trim() !== "" &&
              item.imageIds.trim() !== "null"
            ) {
              // 如果是字符串且不为空且不是"null"，尝试解析
              const parsed = JSON.parse(item.imageIds);
              if (Array.isArray(parsed)) {
                imageIds = parsed.filter((id) => id !== null).map(String);
              }
            }
          } catch (error) {
            console.error(
              "解析图片ID数组失败:",
              error,
              "原始数据:",
              item.imageIds
            );
          }
        }

        // 处理分类ID数组，过滤null值并转换为字符串
        let categoryIds: string[] = [];
        if (item.categoryIds) {
          try {
            // 检查是否已经是数组
            if (Array.isArray(item.categoryIds)) {
              categoryIds = item.categoryIds
                .filter((id) => id !== null)
                .map(String);
            } else if (
              typeof item.categoryIds === "string" &&
              item.categoryIds.trim() !== "" &&
              item.categoryIds.trim() !== "null"
            ) {
              // 如果是字符串且不为空且不是"null"，尝试解析
              const parsed = JSON.parse(item.categoryIds);
              if (Array.isArray(parsed)) {
                categoryIds = parsed.filter((id) => id !== null).map(String);
              }
            }
          } catch (error) {
            console.error(
              "解析分类ID数组失败:",
              error,
              "原始数据:",
              item.categoryIds
            );
          }
        }

        return {
          ...item,
          imageIds,
          categoryIds,
          factoryId: item.factoryId ?? null,
          units: item.units ?? null,
        };
      });

      return commonRes({
        items: res,
        meta: buildPageMeta(result.total, page, limit),
      });
    },
    {
      detail: {
        summary: "获取商品列表",
        description: "分页获取商品列表，支持按分类筛选、搜索和排序",
        tags: ["商品管理"],
      },
      query: ProductModel.ListQuery,
    }
  )

  // .get(
  //   "/simple",
  //   async ({ query, db }) => {
  //     const { page = 1, limit = 10, categoryId, status = 1 } = query;

  //     // 基础查询：商品 + 模板ID + 分类信息 + 图片信息
  //     let baseQuery = db
  //       .select({
  //         id: productsTable2.id,
  //         name: productsTable2.name,
  //         spuCode: productsTable2.spuCode,
  //         description: productsTable2.description,
  //         status: productsTable2.status,
  //         createdAt: productsTable2.createdAt,
  //         updatedAt: productsTable2.updatedAt,
  //         templateId: max(productTemplateTable.templateId),
  //         categoryIds: sql<string>`json_agg(${productCategoriesTable2.categoryId})`,
  //         // 获取第一张图片
  //         firstImage: sql<string>`(
  // 					SELECT json_build_object(
  // 						'id', ${imagesTable.id},
  // 						'imageUrl', ${imagesTable.imageUrl},
  // 						'fileName', ${imagesTable.fileName},
  // 						'alt', COALESCE(${imagesTable.alt}, ${productsTable2.name})
  // 					)
  // 					FROM ${productImages2Table}
  // 					LEFT JOIN ${imagesTable} ON ${productImages2Table.imageId} = ${imagesTable.id}
  // 					WHERE ${productImages2Table.productId} = ${productsTable2.id}
  // 					ORDER BY ${productImages2Table.isMain} DESC, ${productImages2Table.imageId} ASC
  // 					LIMIT 1
  // 				)`,
  //         // 获取最低SKU价格
  //         minPrice: sql<string>`(
  // 					SELECT COALESCE(MIN(price), '0')
  // 					FROM ${skusTable2}
  // 					WHERE ${skusTable2.productId} = ${productsTable2.id}
  // 					AND ${skusTable2.status} = 1
  // 				)`,
  //       })
  //       .from(productsTable2)
  //       .leftJoin(
  //         productTemplateTable,
  //         eq(productsTable2.id, productTemplateTable.productId),
  //       )
  //       .leftJoin(
  //         productCategoriesTable2,
  //         eq(productsTable2.id, productCategoriesTable2.productId),
  //       )
  //       .groupBy(productsTable2.id)
  //       .$dynamic();

  //     const finalConditions: any[] = [];

  //     // 按状态筛选（1=上架，0=下架）
  //     if (status !== undefined) {
  //       finalConditions.push(eq(productsTable2.status, status));
  //     }

  //     // 按分类筛选
  //     if (categoryId !== undefined) {
  //       finalConditions.push(
  //         sql`EXISTS (
  // 					SELECT 1 FROM ${productCategoriesTable2}
  // 					WHERE ${productCategoriesTable2.productId} = ${productsTable2.id}
  // 					AND ${productCategoriesTable2.categoryId} = ${categoryId}
  // 				)`,
  //       );
  //     }

  //     if (finalConditions.length > 0) {
  //       baseQuery = baseQuery.where(and(...finalConditions));
  //     }

  //     // 排序（按创建时间倒序）
  //     baseQuery = baseQuery.orderBy(desc(productsTable2.createdAt));

  //     // 分页
  //     const offset = (page - 1) * limit;
  //     baseQuery = baseQuery.limit(limit).offset(offset);

  //     // 执行查询
  //     const products = await baseQuery;

  //     // 获取总数
  //     const countQuery = db
  //       .select({ count: sql`count(*)`.mapWith(Number) })
  //       .from(productsTable2);

  //     const countConditions = [];
  //     if (status !== undefined) {
  //       countConditions.push(eq(productsTable2.status, status));
  //     }
  //     if (categoryId !== undefined) {
  //       countConditions.push(
  //         sql`EXISTS (
  // 					SELECT 1 FROM ${productCategoriesTable2}
  // 					WHERE ${productCategoriesTable2.productId} = ${productsTable2.id}
  // 					AND ${productCategoriesTable2.categoryId} = ${categoryId}
  // 				)`,
  //       );
  //     }

  //     if (countConditions.length > 0) {
  //       countQuery.where(and(...countConditions));
  //     }

  //     const countResult = await countQuery;
  //     const total = countResult[0]?.count || 0;

  //     // 格式化数据，返回简单的商品信息
  //     const formattedProducts = products.map((product: any) => {
  //       // 解析图片信息
  //       let image =
  //         "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800";
  //       if (product.firstImage) {
  //         try {
  //           const imageData = JSON.parse(product.firstImage);
  //           image = imageData.imageUrl || image;
  //         } catch (error) {
  //           console.error("解析图片信息失败:", error);
  //         }
  //       }

  //       // 解析分类ID数组
  //       let categoryIds = [];
  //       if (product.categoryIds && product.categoryIds !== null) {
  //         try {
  //           categoryIds = JSON.parse(product.categoryIds) || [];
  //         } catch (error) {
  //           console.error("解析分类ID失败:", error);
  //         }
  //       }

  //       return {
  //         id: product.id,
  //         name: product.name,
  //         shortDescription: product.description || "",
  //         price: `¥${parseFloat(product.minPrice || "0").toFixed(2)}`,
  //         image: image,
  //         categoryIds: categoryIds,
  //         spuCode: product.spuCode,
  //         status: product.status,
  //       };
  //     });

  //     const result = {
  //       items: formattedProducts,
  //       meta: {
  //         total,
  //         page,
  //         limit,
  //         totalPages: Math.ceil(total / limit),
  //       },
  //     };

  //     return commonRes(result);
  //   },
  //   {
  //     detail: {
  //       summary: "获取简洁商品列表",
  //       description: "获取简洁商品列表，只返回首页展示所需的基本信息",
  //       tags: ["商品管理"],
  //     },
  //     query: ProductsModel2.ListQuery,
  //   },
  // )

  // 获取简洁商品列表 - 专为首页分类设计
  // .get(
  //   "/simple",
  //   async ({ query, locale, db }) => {

  //     const { page = 1, limit = 10, categoryId, status } = query;

  //     // === 1. 构建可复用的 WHERE 条件 ===
  //     let baseConditions: any = undefined;

  //     const conditions: any = []

  //     // 只获取激活的商品
  //     if (status) {
  //       conditions.push(eq(productsTable2.status, 1));
  //     }

  //     // 分类筛选
  //     if (categoryId) {
  //       conditions.push(
  //         exists(
  //           db
  //             .select()
  //             .from(productCategoriesTable2)
  //             .where(
  //               and(
  //                 eq(productCategoriesTable2.productId, productsTable2.id),
  //                 eq(productCategoriesTable2.categoryId, categoryId),
  //               ),
  //             ),
  //         ),
  //       );
  //     }

  //     if (conditions.length > 0) baseConditions = and(...conditions);

  //     // 使用Drizzle ORM的关联查询功能，只查询必要字段
  //     const products = await db.query.productsTable2.findMany({
  //       with: {
  //         productImages: {
  //           with: {
  //             image: true,
  //           },
  //           limit: 1, // 只取第一张图片
  //         },
  //         productCategories: {
  //           with: {
  //             category: true,
  //           },
  //           limit: 1, // 只取第一个分类
  //         },
  //       },
  //       where: (productsTable2, { eq, and, inArray }) => {
  //         const conditions: any = []

  //         // 只获取激活的商品
  //         if (status) {
  //           conditions.push(eq(productsTable2.status, 1));
  //         }

  //         // 分类筛选
  //         if (categoryId) {
  //           conditions.push(
  //             exists(
  //               db
  //                 .select()
  //                 .from(productCategoriesTable2)
  //                 .where(
  //                   and(
  //                     eq(productCategoriesTable2.productId, productsTable2.id),
  //                     eq(productCategoriesTable2.categoryId, categoryId),
  //                   ),
  //                 ),
  //             ),
  //           );
  //         }

  //         if (conditions.length > 0) baseConditions = and(...conditions);

  //         return baseConditions
  //       },
  //       orderBy: (products, { desc }) => desc(products.createdAt),
  //       limit: limit,
  //       offset: (page - 1) * limit,
  //     });

  //     const [res] = await db
  //       .select({ count: count() })
  //       .from(productsTable2)
  //       .where(baseConditions);

  //     const total = Number(res?.count || 0);

  //     console.log("products", products);

  //     // return products

  //     // 格式化数据，只返回必要字段
  //     const formattedProducts = await Promise.all(
  //       products.map(async (product: any) => {
  //         // 获取第一张图片
  //         const mainImage = product.productImages[0]?.image;
  //         const imageUrl =
  //           mainImage?.imageUrl ||
  //           "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800";

  //         // 获取第一个分类名称（从多语言字段获取）
  //         const category = product.productCategories[0]?.category;
  //         const categoryName = category
  //           ? getCategoryName(category, locale)
  //           : "未分类";

  //         // 使用通用翻译方法处理商品字段
  //         const { translatedName, translatedDescription } =
  //           await translateService.translateProductFields(
  //             product.name,
  //             product.description,
  //             null,
  //             locale,
  //           );

  //         return {
  //           id: product.id,
  //           name: translatedName,
  //           description: translatedDescription,
  //           image: imageUrl,
  //           category: categoryName,
  //         };
  //       }),
  //     );

  //     return commonRes({
  //       items: formattedProducts,
  //       meta: {
  //         total,
  //         page,
  //         limit,
  //         totalPages: Math.ceil(total / limit),
  //       },
  //     }, 200, "获取简洁商品列表成功");
  //   },
  //   {
  //     query: ProductsModel2.ListQuery,
  //     detail: {
  //       tags: ["Products"],
  //       summary: "获取简洁商品列表",
  //       description: "获取简洁商品列表，只返回首页展示所需的基本信息",
  //     },
  //   },
  // )

  .get(
    "/simple",
    async ({ query, locale, db }) => {
      const { page = 1, limit = 10, categoryId, status, search } = query;

      // ===== 1. 主查询：使用 findMany + where 回调（正确使用别名） =====
      const products = await db.query.productsTable.findMany({
        with: {
          productMedia: { with: { media: true }, limit: 1 },
          productCategories: { with: { category: true }, limit: 1 },
        },
        where: (product, { and, eq, exists }) => {
          const conditions: any[] = [];

          if (status) {
            conditions.push(eq(product.status, 1));
          }
          if (search) {
            conditions.push(
              or(
                like(product.name, `%${search}%`),
                like(product.description, `%${search}%`)
              )
            );
          }

          if (categoryId) {
            conditions.push(
              exists(
                db
                  .select({ id: productCategoriesTable.productId })
                  .from(productCategoriesTable)
                  .where(
                    and(
                      eq(productCategoriesTable.productId, product.id), // ✅ 用回调参数 product
                      eq(productCategoriesTable.categoryId, categoryId)
                    )
                  )
              )
            );
          }

          return conditions.length > 0 ? and(...conditions) : undefined;
        },
        orderBy: (product, { desc }) => desc(product.createdAt),
        limit,
        offset: (page - 1) * limit,
      });

      // ===== 2. 计数查询：用 JOIN 替代 exists，避免别名问题 =====
      const countQuery = db.select({ count: count() }).from(productsTable);

      if (status || categoryId) {
        const whereConditions: any[] = [];
        if (status) {
          whereConditions.push(eq(productsTable.status, 1));
        }

        if (categoryId) {
          // 使用 innerJoin 实现分类筛选
          countQuery.innerJoin(
            productCategoriesTable,
            eq(productCategoriesTable.productId, productsTable.id)
          );
          whereConditions.push(
            eq(productCategoriesTable.categoryId, categoryId)
          );
        }

        if (whereConditions.length > 0) {
          countQuery.where(and(...whereConditions));
        }
      }

      const [res] = await countQuery;
      const total = Number(res?.count || 0);

      // ===== 3. 格式化数据（不变） =====
      const formattedProducts = await Promise.all(
        products.map(async (product: any) => {
          const mainImage = product.productImages[0]?.image;
          const imageUrl =
            mainImage?.imageUrl ||
            "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800";

          const category = product.productCategories[0]?.category;

          const translate = await translateService.translateCategory(
            category,
            locale
          );

          const categoryName = translate.name || "未分类";

          const { translatedName, translatedDescription } =
            await translateService.translateProduct2Fields(
              product.name,
              product.description,
              locale
            );

          return {
            id: product.id,
            name: translatedName,
            description: translatedDescription,
            image: imageUrl,
            category: categoryName,
          };
        })
      );

      return commonRes(
        {
          items: formattedProducts,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
        200,
        "获取简洁商品列表成功"
      );
    },
    {
      query: ProductModel.ListQuery,
      detail: {
        tags: ["Products"],
        summary: "获取简洁商品列表",
        description: "获取简洁商品列表，只返回首页展示所需的基本信息",
      },
    }
  )

  .get(
    "/:id",
    async ({ params: { id }, locale, db }) => {
      // 1. 获取商品基础信息
      const [product] = await db
        .select({
          id: productsTable.id,
          name: productsTable.name,
          spuCode: productsTable.spuCode,
          description: productsTable.description,
          status: productsTable.status,
          createdAt: productsTable.createdAt,
          updatedAt: productsTable.updatedAt,
          templateId: productTemplateTable.templateId,
        })
        .from(productsTable)
        .leftJoin(
          productTemplateTable,
          eq(productsTable.id, productTemplateTable.productId)
        )
        .where(eq(productsTable.id, id));

      if (!product) {
        throw new HttpError.NotFound("商品不存在");
      }

      // 2. 获取所有分类
      const categories = await db
        .select({ categoryId: productCategoriesTable.categoryId })
        .from(productCategoriesTable)
        .where(eq(productCategoriesTable.productId, id));

      // 3. 获取所有图片
      const productImages = await db
        .select({
          imageId: productMediaTable.imageId,
          isMain: productMediaTable.isMain,
        })
        .from(productMediaTable)
        .where(eq(productMediaTable.productId, id))
        .orderBy(
          productMediaTable.isMain
            ? desc(productMediaTable.isMain)
            : desc(productMediaTable.imageId)
        );

      // 4. 获取商品SKU数量统计
      const [skuStats] = await db
        .select({
          totalSkus: sql`count(*)`.mapWith(Number),
          activeSkus:
            sql`count(case when ${skusTable.status} = 1 then 1 end)`.mapWith(
              Number
            ),
        })
        .from(skusTable)
        .where(eq(skusTable.productId, id));

      // 处理图片数据
      const imageIds = productImages.map((img) => img.imageId);
      const mainImageId =
        productImages.find((img) => img.isMain)?.imageId || null;

      // 翻译商品名称和描述
      const { translatedName, translatedDescription } =
        await translateService.translateProduct2Fields(
          product.name,
          product.description,
          locale
        );

      return commonRes({
        ...product,
        name: translatedName,
        description: translatedDescription,
        categoryIds: categories.map((c) => c.categoryId),
        imageIds,
        mainImageId,
        skuStats: {
          total: skuStats?.totalSkus || 0,
          active: skuStats?.activeSkus || 0,
        },
      });
    },
    {
      detail: {
        summary: "获取商品详情",
        description: "根据ID获取商品详情，包含关联的模板、分类信息和SKU统计",
        tags: ["商品管理"],
      },
      params: t.Object({
        id: t.String(),
      }),
    }
  );
