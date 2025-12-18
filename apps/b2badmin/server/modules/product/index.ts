import { Elysia } from "elysia";
import { attributeRoute } from "./attribute";
import { attributeValueRoute } from "./attribute-value";
import { templateRoute } from "./template";
// import { HttpError } from "elysia-http-problem-json";
// import {
//   and,
//   count,
//   desc,
//   eq,
//   inArray,
//   like,
//   sql,
//   exists
// } from "drizzle-orm";

// import {
//   productsTable,
//   siteProductsTable,
//   sitesTable,
//   factoriesTable,
//   exportersTable,
//   salespersonsTable,
//   salespersonAffiliationsTable,
//   productMasterCategoriesTable,
//   productMediaTable,
//   skusTable,
//   siteCategoriesTable,
//   ProductTModel
// } from "@repo/contract";

// import { adminAuthPlugin } from "~/plugins/admin-auth.plugin";
// import { dbPlugin } from "~/db/connection";

// /**
//  * 商品管理接口
//  *
//  * 功能说明：
//  * 1. 工厂级管理：由工厂业务员管理自己工厂的商品
//  * 2. 出口商级站点聚合：出口商可以选择工厂商品并展示在自己的站点上，可以自定义价格、名称等
//  */

// export const productRouter = new Elysia({
//   prefix: "/product",
//   tags: ["商品管理"],
// })
//   .use(dbPlugin)
//   .use(adminAuthPlugin)

//   // ===== 工厂级商品管理 CRUD =====

//   .post(
//     "/",
//     async ({
//       body,
//       user,
//       db,
//       currentSite
//     }) => {
//       // 验证用户权限：必须是工厂业务员或超级管理员
//       if (user?.role !== 'salesperson' && user?.role !== 'super_admin') {
//         throw new HttpError.Forbidden("只有工厂业务员可以创建商品");
//       }

//       // 获取业务员关联的工厂
//       let factoryId: string | null = null;

//       if (user?.role === 'salesperson') {
//         const [salesperson] = await db
//           .select({
//             factoryId: salespersonAffiliationsTable.factoryId
//           })
//           .from(salespersonAffiliationsTable)
//           .innerJoin(
//             salespersonsTable,
//             eq(salespersonsTable.id, salespersonAffiliationsTable.salespersonId)
//           )
//           .where(
//             and(
//               eq(salespersonsTable.userId, user.user.id),
//               eq(salespersonAffiliationsTable.entityType, 'factory')
//             )
//           )
//           .limit(1);

//         if (!salesperson?.factoryId) {
//           throw new HttpError.Forbidden("您未关联到任何工厂，无法创建商品");
//         }
//         factoryId = salesperson.factoryId;
//       } else if (user?.role === 'super_admin') {
//         // 超级管理员需要指定工厂
//         if (!body.factoryId) {
//           throw new HttpError.BadRequest("超级管理员创建商品时必须指定工厂ID");
//         }
//         factoryId = body.factoryId;
//       }

//       const result = await db.transaction(async (tx) => {
//         // 创建商品
//         const productData = {
//           name: body.name,
//           spuCode: body.spuCode,
//           description: body.description,
//           status: body.status ?? 1,
//           factoryId: factoryId!,
//           units: body.units,
//         };

//         const [product] = await tx
//           .insert(productsTable)
//           .values(productData)
//           .returning();

//         // 关联分类
//         if (body.categoryIds && body.categoryIds.length > 0) {
//           await tx.insert(productMasterCategoriesTable).values(
//             body.categoryIds.map(categoryId => ({
//               productId: product.id,
//               categoryId,
//             }))
//           );
//         }

//         // 关联图片
//         if (body.imageIds && body.imageIds.length > 0) {
//           await tx.insert(productMediaTable).values(
//             body.imageIds.map((imageId, index) => ({
//               productId: product.id,
//               imageId,
//               isMain: index === 0, // 第一张图作为主图
//             }))
//           );
//         }

//         // 如果是业务员，需要创建站点商品关联
//         if (userInfo?.role === 'salesperson' && currentSite) {
//           // 获取站点的默认分类或创建一个
//           let siteCategoryId: string | null = null;

//           if (body.siteCategoryId) {
//             siteCategoryId = body.siteCategoryId;
//           } else {
//             // 获取或创建一个默认分类
//             const [defaultCategory] = await tx
//               .select({
//                 id: siteCategoriesTable.id,
//               })
//               .from(siteCategoriesTable)
//               .where(
//                 and(
//                   eq(siteCategoriesTable.siteId, currentSite.id),
//                   eq(siteCategoriesTable.parentId, null)
//                 )
//               )
//               .limit(1);

//             if (!defaultCategory) {
//               // 创建默认分类
//               const [newCategory] = await tx
//                 .insert(siteCategoriesTable)
//                 .values({
//                   siteId: currentSite.id,
//                   name: "默认分类",
//                   parentId: null,
//                   sortOrder: 0,
//                 })
//                 .returning();
//               siteCategoryId = newCategory.id;
//             } else {
//               siteCategoryId = defaultCategory.id;
//             }
//           }

//           // 创建站点商品关联
//           await tx.insert(siteProductsTable).values({
//             siteId: currentSite.id,
//             productId: product.id,
//             sitePrice: body.price?.toString(),
//             siteName: body.siteName || body.name,
//             siteDescription: body.siteDescription || body.description,
//             isFeatured: false,
//             sortOrder: 0,
//             isVisible: true,
//             seoTitle: body.seoTitle,
//             siteCategoryId,
//           });
//         }

//         return product;
//       });

//       return result;
//     },
//     {
//       auth: true,
//       body: ProductTModel.Create,
//       detail: {
//         summary: "创建商品",
//         description: "工厂业务员为自己工厂创建新商品",
//       },
//     }
//   )

//   .put(
//     "/:id",
//     async ({
//       params: { id },
//       body,
//       userInfo,
//       db
//     }) => {
//       // 检查商品是否存在并获取权限
//       const [existing] = await db
//         .select({
//           id: productsTable.id,
//           factoryId: productsTable.factoryId,
//         })
//         .from(productsTable)
//         .where(eq(productsTable.id, id))
//         .limit(1);

//       if (!existing) {
//         throw new HttpError.NotFound("商品不存在");
//       }

//       // 验证权限
//       if (userInfo?.role === 'salesperson') {
//         // 检查业务员是否属于该工厂
//         const [affiliation] = await db
//           .select({
//             id: salespersonAffiliationsTable.id
//           })
//           .from(salespersonAffiliationsTable)
//           .innerJoin(
//             salespersonsTable,
//             eq(salespersonsTable.id, salespersonAffiliationsTable.salespersonId)
//           )
//           .where(
//             and(
//               eq(salespersonsTable.userId, user.user.id),
//               eq(salespersonAffiliationsTable.factoryId, existing.factoryId),
//               eq(salespersonAffiliationsTable.entityType, 'factory')
//             )
//           )
//           .limit(1);

//         if (!affiliation) {
//           throw new HttpError.Forbidden("您只能管理自己工厂的商品");
//         }
//       }

//       const result = await db.transaction(async (tx) => {
//         // 更新商品基础信息
//         const updateData: any = {
//           name: body.name,
//           spuCode: body.spuCode,
//           description: body.description,
//           status: body.status,
//           units: body.units,
//         };

//         const [product] = await tx
//           .update(productsTable)
//           .set(updateData)
//           .where(eq(productsTable.id, id))
//           .returning();

//         // 更新分类关联
//         if (body.categoryIds !== undefined) {
//           await tx
//             .delete(productMasterCategoriesTable)
//             .where(eq(productMasterCategoriesTable.productId, id));

//           if (body.categoryIds.length > 0) {
//             await tx.insert(productMasterCategoriesTable).values(
//               body.categoryIds.map(categoryId => ({
//                 productId: id,
//                 categoryId,
//               }))
//             );
//           }
//         }

//         // 更新图片关联
//         if (body.imageIds !== undefined) {
//           await tx
//             .delete(productMediaTable)
//             .where(eq(productMediaTable.productId, id));

//           if (body.imageIds.length > 0) {
//             await tx.insert(productMediaTable).values(
//               body.imageIds.map((imageId, index) => ({
//                 productId: id,
//                 imageId,
//                 isMain: index === 0,
//               }))
//             );
//           }
//         }

//         return product;
//       });

//       return result;
//     },
//     {
//       auth: true,
//       body: ProductTModel.Update,
//       params: t.Object({
//         id: t.String({ format: "uuid" }),
//       }),
//       detail: {
//         summary: "更新商品",
//         description: "更新商品信息，业务员只能更新自己工厂的商品",
//       },
//     }
//   )

//   .delete(
//     "/",
//     async ({
//       body: { ids },
//       userInfo,
//       db
//     }) => {
//       // 获取要删除的商品列表
//       const products = await db
//         .select({
//           id: productsTable.id,
//           factoryId: productsTable.factoryId,
//         })
//         .from(productsTable)
//         .where(inArray(productsTable.id, ids));

//       if (products.length === 0) {
//         throw new HttpError.NotFound("未找到要删除的商品");
//       }

//       // 验证权限
//       if (userInfo?.role === 'salesperson') {
//         // 获取业务员关联的工厂
//         const [salesperson] = await db
//           .select({
//             factoryId: salespersonAffiliationsTable.factoryId
//           })
//           .from(salespersonAffiliationsTable)
//           .innerJoin(
//             salespersonsTable,
//             eq(salespersonsTable.id, salespersonAffiliationsTable.salespersonId)
//           )
//           .where(
//             and(
//               eq(salespersonsTable.userId, user.user.id),
//               eq(salespersonAffiliationsTable.entityType, 'factory')
//             )
//           )
//           .limit(1);

//         if (!salesperson?.factoryId) {
//           throw new HttpError.Forbidden("您未关联到任何工厂");
//         }

//         // 检查是否所有商品都属于该业务员的工厂
//         const hasUnauthorizedProduct = products.some(
//           p => p.factoryId !== salesperson.factoryId
//         );

//         if (hasUnauthorizedProduct) {
//           throw new HttpError.Forbidden("您只能删除自己工厂的商品");
//         }
//       }

//       await db.transaction(async (tx) => {
//         // 删除相关数据
//         await tx
//           .delete(productMasterCategoriesTable)
//           .where(inArray(productMasterCategoriesTable.productId, ids));

//         await tx
//           .delete(productMediaTable)
//           .where(inArray(productMediaTable.productId, ids));

//         await tx
//           .delete(skusTable)
//           .where(inArray(skusTable.productId, ids));

//         await tx
//           .delete(productsTable)
//           .where(inArray(productsTable.id, ids));
//       });

//       return null, 204);
//   },
// {
//   auth: true,
//     body: t.Object({
//       ids: t.Array(t.String({ format: "uuid" }), { minItems: 1 }),
//     }),
//       detail: {
//     summary: "批量删除商品",
//       description: "删除选中的商品，业务员只能删除自己工厂的商品",
//     },
// }
// )

//   // ===== 商品查询接口 =====

//   .get(
//   "/",
//   async ({
//     query,
//     userInfo,
//     db
//   }): Promise<CommonRes<PageData<any>>> => {
//     const {
//       page = 1,
//       limit = 10,
//       search,
//       factoryId,
//       status,
//     } = query;

//     let baseConditions: any[] = [];

//     // 根据用户角色过滤数据
//     if (userInfo?.role === 'salesperson') {
//       // 获取业务员关联的工厂
//       const [salesperson] = await db
//         .select({
//           factoryId: salespersonAffiliationsTable.factoryId
//         })
//         .from(salespersonAffiliationsTable)
//         .innerJoin(
//           salespersonsTable,
//           eq(salespersonsTable.id, salespersonAffiliationsTable.salespersonId)
//         )
//         .where(
//           and(
//             eq(salespersonsTable.userId, user.user.id),
//             eq(salespersonAffiliationsTable.entityType, 'factory')
//           )
//         )
//         .limit(1);

//       if (salesperson?.factoryId) {
//         baseConditions.push(eq(productsTable.factoryId, salesperson.factoryId));
//       } else {
//         // 如果没有关联工厂，返回空结果
//         return {
//           items: [],
//           meta: buildPageMeta(0, page, limit),
//         });
//         }
//       } else if (userInfo?.role === 'exporter_admin' && query.siteId) {
//   // 出口商管理员查看站点关联的商品
//   baseConditions.push(
//     exists(
//       db
//         .select({ id: siteProductsTable.id })
//         .from(siteProductsTable)
//         .where(
//           and(
//             eq(siteProductsTable.productId, productsTable.id),
//             eq(siteProductsTable.siteId, query.siteId)
//           )
//         )
//     )
//   );
// }

// // 搜索条件
// if (search) {
//   baseConditions.push(
//     or(
//       like(productsTable.name, `%${search}%`),
//       like(productsTable.spuCode, `%${search}%`)
//     )
//   );
// }

// // 状态筛选
// if (status !== undefined) {
//   baseConditions.push(eq(productsTable.status, status));
// }

// // 工厂筛选
// if (factoryId) {
//   baseConditions.push(eq(productsTable.factoryId, factoryId));
// }

// // 构建查询
// let queryBuilder = db
//   .select({
//     id: productsTable.id,
//     name: productsTable.name,
//     spuCode: productsTable.spuCode,
//     description: productsTable.description,
//     status: productsTable.status,
//     factoryId: productsTable.factoryId,
//     units: productsTable.units,
//     createdAt: productsTable.createdAt,
//     updatedAt: productsTable.updatedAt,
//   })
//   .from(productsTable)
//   .$dynamic();

// if (baseConditions.length > 0) {
//   queryBuilder = queryBuilder.where(and(...baseConditions));
// }

// // 执行分页查询
// const result = await paginate(queryBuilder, {
//   page,
//   limit,
//   orderBy: productsTable.createdAt,
//   orderDirection: 'desc',
// });

// // 获取工厂信息
// const factoryIds = [...new Set(result.items.map(item => item.factoryId).filter(Boolean))];
// const factories = factoryIds.length > 0 ? await db
//   .select({
//     id: factoriesTable.id,
//     name: factoriesTable.name,
//   })
//   .from(factoriesTable)
//   .where(inArray(factoriesTable.id, factoryIds)) : [];

// const factoryMap = factories.reduce((map, factory) => {
//   map[factory.id] = factory.name;
//   return map;
// }, {} as Record<string, string>);

// // 格式化返回数据
// const items = result.items.map(item => ({
//   ...item,
//   factoryName: item.factoryId ? factoryMap[item.factoryId] || '未知工厂' : null,
// }));

// return {
//   items,
//   meta: buildPageMeta(result.total, page, limit),
// });
//     },
// {
//   auth: true,
//     query: ProductTModel.ListQuery,
//       detail: {
//     summary: "获取商品列表",
//       description: "根据用户权限返回商品列表。业务员只能看到自己工厂的商品，出口商可以看到站点关联的商品",
//       },
// }
//   )

//   .get(
//   "/:id",
//   async ({
//     params: { id },
//     userInfo,
//     db
//   }) => {
//     // 获取商品详情
//     const [product] = await db
//       .select({
//         id: productsTable.id,
//         name: productsTable.name,
//         spuCode: productsTable.spuCode,
//         description: productsTable.description,
//         status: productsTable.status,
//         factoryId: productsTable.factoryId,
//         units: productsTable.units,
//         createdAt: productsTable.createdAt,
//         updatedAt: productsTable.updatedAt,
//       })
//       .from(productsTable)
//       .where(eq(productsTable.id, id))
//       .limit(1);

//     if (!product) {
//       throw new HttpError.NotFound("商品不存在");
//     }

//     // 验证权限
//     if (userInfo?.role === 'salesperson') {
//       const [salesperson] = await db
//         .select({
//           factoryId: salespersonAffiliationsTable.factoryId
//         })
//         .from(salespersonAffiliationsTable)
//         .innerJoin(
//           salespersonsTable,
//           eq(salespersonsTable.id, salespersonAffiliationsTable.salespersonId)
//         )
//         .where(
//           and(
//             eq(salespersonsTable.userId, user.user.id),
//             eq(salespersonAffiliationsTable.factoryId, product.factoryId),
//             eq(salespersonAffiliationsTable.entityType, 'factory')
//           )
//         )
//         .limit(1);

//       if (!salesperson) {
//         throw new HttpError.Forbidden("您只能查看自己工厂的商品");
//       }
//     }

//     // 获取关联数据
//     const [categories, media, skuStats] = await Promise.all([
//       // 获取分类
//       db
//         .select({
//           categoryId: productMasterCategoriesTable.categoryId,
//         })
//         .from(productMasterCategoriesTable)
//         .where(eq(productMasterCategoriesTable.productId, id)),

//       // 获取图片
//       db
//         .select({
//           imageId: productMediaTable.imageId,
//           isMain: productMediaTable.isMain,
//         })
//         .from(productMediaTable)
//         .where(eq(productMediaTable.productId, id))
//         .orderBy(productMediaTable.isMain ? desc(productMediaTable.isMain) : desc(productMediaTable.imageId)),

//       // 获取SKU统计
//       db
//         .select({
//           total: count(),
//           active: sql`count(case when ${skusTable.status} = 1 then 1 end)`.mapWith(Number),
//         })
//         .from(skusTable)
//         .where(eq(skusTable.productId, id))
//     ]);

//     // 获取工厂信息
//     const [factory] = await db
//       .select({
//         id: factoriesTable.id,
//         name: factoriesTable.name,
//       })
//       .from(factoriesTable)
//       .where(eq(factoriesTable.id, product.factoryId))
//       .limit(1);

//     return {
//       ...product,
//       factory: factory || null,
//       categoryIds: categories.map(c => c.categoryId),
//       imageIds: media.map(m => m.imageId),
//       mainImageId: media.find(m => m.isMain)?.imageId || null,
//       skuStats: {
//         total: skuStats[0]?.total || 0,
//         active: skuStats[0]?.active || 0,
//       },
//     });
//     },
// {
//   auth: true,
//     params: t.Object({
//       id: t.String({ format: "uuid" }),
//     }),
//       detail: {
//     summary: "获取商品详情",
//       description: "获取商品详细信息，包括关联的分类、图片和SKU统计",
//       },
// }
//   )

//   // ===== 出口商级站点商品聚合管理 =====

//   .post(
//   "/site-product",
//   async ({
//     body,
//     userInfo,
//     db,
//     currentSite
//   }) => {
//     // 验证用户权限：出口商管理员或超级管理员
//     if (userInfo?.role !== 'exporter_admin' && userInfo?.role !== 'super_admin') {
//       throw new HttpError.Forbidden("只有出口商管理员可以将商品添加到站点");
//     }

//     // 验证站点权限
//     if (userInfo?.role === 'exporter_admin') {
//       if (!currentSite || currentSite.siteType !== 'exporter') {
//         throw new HttpError.Forbidden("您只能在出口商站点操作");
//       }
//     }

//     // 验证商品是否存在
//     const [product] = await db
//       .select({
//         id: productsTable.id,
//         name: productsTable.name,
//       })
//       .from(productsTable)
//       .where(eq(productsTable.id, body.productId))
//       .limit(1);

//     if (!product) {
//       throw new HttpError.NotFound("商品不存在");
//     }

//     // 检查是否已经关联
//     const [existing] = await db
//       .select({
//         id: siteProductsTable.id,
//       })
//       .from(siteProductsTable)
//       .where(
//         and(
//           eq(siteProductsTable.siteId, body.siteId),
//           eq(siteProductsTable.productId, body.productId)
//         )
//       )
//       .limit(1);

//     if (existing) {
//       throw new HttpError.Conflict("商品已经添加到该站点");
//     }

//     // 创建站点商品关联
//     const [siteProduct] = await db
//       .insert(siteProductsTable)
//       .values({
//         siteId: body.siteId,
//         productId: body.productId,
//         sitePrice: body.sitePrice,
//         siteName: body.siteName,
//         siteDescription: body.siteDescription,
//         isFeatured: body.isFeatured ?? false,
//         sortOrder: body.sortOrder ?? 0,
//         isVisible: body.isVisible ?? true,
//         seoTitle: body.seoTitle,
//         siteCategoryId: body.siteCategoryId,
//       })
//       .returning();

//     return siteProduct);
//     },
// {
//   auth: true,
//     body: ProductTModel.SiteProductCreate,
//       detail: {
//     summary: "将商品添加到站点",
//       description: "出口商管理员将工厂商品添加到自己的站点，并设置站点特定的展示信息",
//       },
// }
//   )

//   .put(
//   "/site-product/:id",
//   async ({
//     params: { id },
//     body,
//     userInfo,
//     db,
//     currentSite
//   }) => {
//     // 获取站点商品关联信息
//     const [siteProduct] = await db
//       .select({
//         id: siteProductsTable.id,
//         siteId: siteProductsTable.siteId,
//         productId: siteProductsTable.productId,
//       })
//       .from(siteProductsTable)
//       .where(eq(siteProductsTable.id, id))
//       .limit(1);

//     if (!siteProduct) {
//       throw new HttpError.NotFound("站点商品关联不存在");
//     }

//     // 验证权限
//     if (userInfo?.role === 'exporter_admin') {
//       if (!currentSite || currentSite.id !== siteProduct.siteId) {
//         throw new HttpError.Forbidden("您只能管理自己站点的商品");
//       }
//     }

//     // 更新站点商品信息
//     const [updated] = await db
//       .update(siteProductsTable)
//       .set({
//         sitePrice: body.sitePrice,
//         siteName: body.siteName,
//         siteDescription: body.siteDescription,
//         isFeatured: body.isFeatured,
//         sortOrder: body.sortOrder,
//         isVisible: body.isVisible,
//         seoTitle: body.seoTitle,
//         siteCategoryId: body.siteCategoryId,
//       })
//       .where(eq(siteProductsTable.id, id))
//       .returning();

//     return updated);
//     },
// {
//   auth: true,
//     body: ProductTModel.SiteProductUpdateBody,
//       params: t.Object({
//         id: t.String({ format: "uuid" }),
//       }),
//         detail: {
//     summary: "更新站点商品信息",
//       description: "更新站点特定的商品展示信息",
//       },
// }
//   )

//   .delete (
//   "/site-product",
//   async ({
//     body: { ids },
//     userInfo,
//     db,
//     currentSite
//   }) => {
//     // 获取要删除的站点商品关联
//     const siteProducts = await db
//       .select({
//         id: siteProductsTable.id,
//         siteId: siteProductsTable.siteId,
//       })
//       .from(siteProductsTable)
//       .where(inArray(siteProductsTable.id, ids));

//     if (siteProducts.length === 0) {
//       throw new HttpError.NotFound("未找到要删除的站点商品");
//     }

//     // 验证权限
//     if (userInfo?.role === 'exporter_admin') {
//       if (!currentSite) {
//         throw new HttpError.Forbidden("您没有操作权限");
//       }

//       // 检查是否都属于当前用户的站点
//       const hasUnauthorizedProduct = siteProducts.some(
//         sp => sp.siteId !== currentSite.id
//       );

//       if (hasUnauthorizedProduct) {
//         throw new HttpError.Forbidden("您只能删除自己站点的商品");
//       }
//     }

//     // 删除站点商品关联
//     await db
//       .delete(siteProductsTable)
//       .where(inArray(siteProductsTable.id, ids));

//     return null, 204);
//   },
//   {
//     auth: true,
//     body: t.Object({
//       ids: t.Array(t.String({ format: "uuid" }), { minItems: 1 }),
//     }),
//     detail: {
//       summary: "批量删除站点商品",
//       description: "从站点中移除商品关联",
//     },
//   }
// )

//   .get(
//     "/site-product",
//     async ({
//       query,
//       userInfo,
//       db,
//       currentSite
//     }): Promise<CommonRes<PageData<any>>> => {
//       const {
//         page = 1,
//         limit = 10,
//         siteId,
//         isVisible,
//         isFeatured,
//       } = query;

//       let baseConditions: any[] = [];

//       // 根据用户角色过滤数据
//       if (userInfo?.role === 'exporter_admin') {
//         if (!currentSite) {
//           throw new HttpError.Forbidden("您没有访问权限");
//         }
//         baseConditions.push(eq(siteProductsTable.siteId, currentSite.id));
//       } else if (siteId) {
//         baseConditions.push(eq(siteProductsTable.siteId, siteId));
//       }

//       // 状态筛选
//       if (isVisible !== undefined) {
//         baseConditions.push(eq(siteProductsTable.isVisible, isVisible));
//       }

//       if (isFeatured !== undefined) {
//         baseConditions.push(eq(siteProductsTable.isFeatured, isFeatured));
//       }

//       // 构建查询
//       let queryBuilder = db
//         .select({
//           id: siteProductsTable.id,
//           siteId: siteProductsTable.siteId,
//           productId: siteProductsTable.productId,
//           sitePrice: siteProductsTable.sitePrice,
//           siteName: siteProductsTable.siteName,
//           siteDescription: siteProductsTable.siteDescription,
//           isFeatured: siteProductsTable.isFeatured,
//           sortOrder: siteProductsTable.sortOrder,
//           isVisible: siteProductsTable.isVisible,
//           seoTitle: siteProductsTable.seoTitle,
//           siteCategoryId: siteProductsTable.siteCategoryId,
//           createdAt: siteProductsTable.createdAt,
//           updatedAt: siteProductsTable.updatedAt,
//         })
//         .from(siteProductsTable)
//         .$dynamic();

//       if (baseConditions.length > 0) {
//         queryBuilder = queryBuilder.where(and(...baseConditions));
//       }

//       // 执行分页查询
//       const result = await paginate(queryBuilder, {
//         page,
//         limit,
//         orderBy: siteProductsTable.sortOrder,
//         orderDirection: 'asc',
//       });

//       // 获取关联的商品和站点信息
//       const productIds = [...new Set(result.items.map(item => item.productId))];
//       const siteIds = [...new Set(result.items.map(item => item.siteId))];

//       const [products, sites] = await Promise.all([
//         productIds.length > 0 ? db
//           .select({
//             id: productsTable.id,
//             name: productsTable.name,
//             spuCode: productsTable.spuCode,
//             factoryId: productsTable.factoryId,
//           })
//           .from(productsTable)
//           .where(inArray(productsTable.id, productIds)) : [],

//         siteIds.length > 0 ? db
//           .select({
//             id: sitesTable.id,
//             name: sitesTable.name,
//             siteType: sitesTable.siteType,
//           })
//           .from(sitesTable)
//           .where(inArray(sitesTable.id, siteIds)) : []
//       ]);

//       const productMap = products.reduce((map, product) => {
//         map[product.id] = product;
//         return map;
//       }, {} as Record<string, any>);

//       const siteMap = sites.reduce((map, site) => {
//         map[site.id] = site;
//         return map;
//       }, {} as Record<string, any>);

//       // 格式化返回数据
//       const items = result.items.map(item => ({
//         ...item,
//         product: productMap[item.productId] || null,
//         site: siteMap[item.siteId] || null,
//       }));

//       return {
//         items,
//         meta: buildPageMeta(result.total, page, limit),
//       });
//     },
// {
//   auth: true,
//     query: ProductTModel.SiteProductQuery,
//       detail: {
//     summary: "获取站点商品列表",
//       description: "获取站点关联的商品列表，出口商管理员只能看到自己站点的商品",
//       },
// }
//   )

//   // ===== 批量操作 =====

//   .patch(
//   "/batch-status",
//   async ({
//     body: { ids, isActive },
//     userInfo,
//     db
//   }) => {
//     // 获取商品列表
//     const products = await db
//       .select({
//         id: productsTable.id,
//         factoryId: productsTable.factoryId,
//       })
//       .from(productsTable)
//       .where(inArray(productsTable.id, ids));

//     if (products.length === 0) {
//       throw new HttpError.NotFound("未找到要更新的商品");
//     }

//     // 验证权限
//     if (userInfo?.role === 'salesperson') {
//       const [salesperson] = await db
//         .select({
//           factoryId: salespersonAffiliationsTable.factoryId
//         })
//         .from(salespersonAffiliationsTable)
//         .innerJoin(
//           salespersonsTable,
//           eq(salespersonsTable.id, salespersonAffiliationsTable.salespersonId)
//         )
//         .where(
//           and(
//             eq(salespersonsTable.userId, user.user.id),
//             eq(salespersonAffiliationsTable.entityType, 'factory')
//           )
//         )
//         .limit(1);

//       if (!salesperson?.factoryId) {
//         throw new HttpError.Forbidden("您未关联到任何工厂");
//       }

//       const hasUnauthorizedProduct = products.some(
//         p => p.factoryId !== salesperson.factoryId
//       );

//       if (hasUnauthorizedProduct) {
//         throw new HttpError.Forbidden("您只能更新自己工厂的商品");
//       }
//     }

//     // 更新商品状态
//     const [updated] = await db
//       .update(productsTable)
//       .set({ status: isActive ? 1 : 0 })
//       .where(inArray(productsTable.id, ids))
//       .returning();

//     return updated);
//     },
// {
//   auth: true,
//     body: ProductTModel.BatchStatusUpdate,
//       detail: {
//     summary: "批量更新商品状态",
//       description: "批量上架或下架商品",
//       },
// }
//   );


// 导出产品属性相关的路由
export const productAttributeRoutes = new Elysia()
  .use(attributeRoute)
  .use(attributeValueRoute)
  .use(templateRoute);
