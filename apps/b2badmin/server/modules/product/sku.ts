import {
    mediaTable,
    productsTable,
    SkuTModel,
    salespersonAffiliationsTable,
    salespersonsTable,
    siteProductsTable,
    sitesTable,
    skusTable,
    skuMediaTable,
} from "@repo/contract";
import { and, eq, inArray, like, sql, desc } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { dbPlugin } from "~/db/connection";
import { adminAuthPlugin } from "~/plugins/admin-auth.plugin";

/**
 * 验证业务员是否可以管理指定商品
 * @param db 数据库连接
 * @param userId 用户ID
 * @param productId 商品ID
 * @param role 用户角色
 * @returns boolean 是否有权限
 */
async function validateSalespersonProductPermission(
    db: any,
    userId: string,
    productId: string,
    role: string
): Promise<boolean> {
    if (role !== "salesperson") {
        return true; // 非业务员角色不需要验证
    }

    // 获取业务员关联的信息
    const affiliations = await db
        .select({
            factoryId: salespersonAffiliationsTable.factoryId,
            exporterId: salespersonAffiliationsTable.exporterId,
            entityType: salespersonAffiliationsTable.entityType,
        })
        .from(salespersonAffiliationsTable)
        .innerJoin(
            salespersonsTable,
            eq(salespersonsTable.id, salespersonAffiliationsTable.salespersonId)
        )
        .where(eq(salespersonsTable.userId, userId));

    // 检查是否有权限
    for (const affiliation of affiliations) {
        if (affiliation.entityType === "factory") {
            // 工厂业务员：检查商品是否属于该工厂（通过siteProducts表关联）
            const hasPermission = await db
                .select({ count: sql`count(*)` })
                .from(siteProductsTable)
                .innerJoin(sitesTable, eq(siteProductsTable.siteId, sitesTable.id))
                .where(
                    and(
                        eq(siteProductsTable.productId, productId),
                        eq(sitesTable.factoryId, affiliation.factoryId)
                    )
                )
                .limit(1);

            if (hasPermission[0]?.count > 0) {
                return true;
            }
        } else if (affiliation.entityType === "exporter") {
            // 出口商业务员：检查商品是否属于该出口商的站点
            const hasPermission = await db
                .select({ count: sql`count(*)` })
                .from(siteProductsTable)
                .where(
                    and(
                        eq(siteProductsTable.productId, productId),
                        eq(siteProductsTable.siteId, affiliation.exporterId)
                    )
                )
                .limit(1);

            if (hasPermission[0]?.count > 0) {
                return true;
            }
        }
    }

    return false;
}

/**
 * 验证业务员是否可以管理指定SKU
 * @param db 数据库连接
 * @param userId 用户ID
 * @param skuId SKU ID
 * @param role 用户角色
 * @returns boolean 是否有权限
 */
async function validateSalespersonSkuPermission(
    db: any,
    userId: string,
    skuId: string,
    role: string
): Promise<boolean> {
    if (role !== "salesperson") {
        return true; // 非业务员角色不需要验证
    }

    // 获取SKU对应的商品ID
    const [sku] = await db
        .select({
            productId: skusTable.productId,
        })
        .from(skusTable)
        .where(eq(skusTable.id, skuId))
        .limit(1);

    if (!sku) {
        return false;
    }

    // 使用商品权限验证
    return await validateSalespersonProductPermission(
        db,
        userId,
        sku.productId,
        role
    );
}

/**
 * SKU管理接口
 * 支持站点隔离和模板绑定
 * 提供SKU的增删改查功能
 */
export const skuRoute = new Elysia({
    name: "sku",
    prefix: "/product/sku",
    tags: ["SKU管理"],
})
    .use(dbPlugin)
    .use(adminAuthPlugin)

    // 批量创建SKU
    .post(
        "/batch",
        async ({ body: { productId, skus }, db, user, role, currentSite }) => {
            // 验证商品是否存在
            const [product] = await db
                .select({
                    id: productsTable.id,
                })
                .from(productsTable)
                .where(eq(productsTable.id, productId))
                .limit(1);

            if (!product) {
                throw new HttpError.NotFound("商品不存在");
            }

            // 验证业务员权限
            const hasPermission = await validateSalespersonProductPermission(
                db,
                user.id,
                productId,
                role.name
            );

            if (!hasPermission) {
                throw new HttpError.Forbidden("您没有权限管理该商品的SKU");
            }

            // 检查SKU编码是否重复
            const skuCodes = skus.map((s) => s.skuCode);
            const existingSkus = await db
                .select({
                    skuCode: skusTable.skuCode,
                })
                .from(skusTable)
                .where(
                    and(
                        eq(skusTable.productId, productId),
                        inArray(skusTable.skuCode, skuCodes)
                    )
                );

            if (existingSkus.length > 0) {
                throw new HttpError.Conflict(
                    `SKU编码已存在: ${existingSkus.map((s) => s.skuCode).join(", ")}`
                );
            }

            // 创建SKU
            const result = await db.transaction(async (tx) => {
                const createdSkus = await tx
                    .insert(skusTable)
                    .values(
                        skus.map((sku) => ({
                            skuCode: sku.skuCode,
                            productId,
                            siteId: currentSite.id,
                            price: sku.price,
                            stock: sku.stock || "0",
                            specJson: JSON.stringify(sku.specJson),
                            status: 1,
                        }))
                    )
                    .returning();

                // 批量创建SKU和媒体的关联
                for (let i = 0; i < skus.length; i++) {
                    const sku = skus[i];
                    const createdSku = createdSkus[i];

                    if (sku.mediaIds && sku.mediaIds.length > 0) {
                        await tx.insert(skuMediaTable).values(
                            sku.mediaIds.map((mediaId, index) => ({
                                skuId: createdSku.id,
                                mediaId,
                                isMain: index === 0, // 第一张作为主图
                                sortOrder: index,
                            }))
                        );
                    }
                }

                return createdSkus;
            });

            return result;
        },
        {
            auth: true,
            body: t.Object({
                productId: t.String(),
                skus: SkuTModel.BatchCreate,
            }),
            detail: {
                summary: "批量创建SKU",
                description: "为商品批量创建SKU",
            },
        }
    )

    // 创建单个SKU
    .post(
        "/",
        async ({ body, db, user, role }) => {
            const { productId, mediaId, ...skuData } = body;

            // 验证商品是否存在
            const [product] = await db
                .select({
                    id: productsTable.id,
                })
                .from(productsTable)
                .where(eq(productsTable.id, productId))
                .limit(1);

            if (!product) {
                throw new HttpError.NotFound("商品不存在");
            }

            // 验证业务员权限
            const hasPermission = await validateSalespersonProductPermission(
                db,
                user.id,
                productId,
                role.name
            );

            if (!hasPermission) {
                throw new HttpError.Forbidden("您没有权限管理该商品的SKU");
            }

            // 检查SKU编码是否重复
            const [existing] = await db
                .select({
                    id: skusTable.id,
                })
                .from(skusTable)
                .where(eq(skusTable.skuCode, skuData.skuCode))
                .limit(1);

            if (existing) {
                throw new HttpError.Conflict("SKU编码已存在");
            }

            // 验证图片是否存在（如果提供了mediaId）
            if (mediaId) {
                const [image] = await db
                    .select({
                        id: mediaTable.id,
                    })
                    .from(mediaTable)
                    .where(eq(mediaTable.id, mediaId))
                    .limit(1);

                if (!image) {
                    throw new HttpError.NotFound("图片不存在");
                }
            }

            // 创建SKU
            const result = await db.transaction(async (tx) => {
                const [sku] = await tx
                    .insert(skusTable)
                    .values({
                        ...skuData,
                        productId,
                    })
                    .returning();

                // 如果提供了mediaId，创建SKU和媒体的关联
                if (mediaId) {
                    await tx
                        .insert(skuMediaTable)
                        .values({
                            skuId: sku.id,
                            mediaId,
                        });
                }

                return sku;
            });

            return result;
        },
        {
            auth: true,
            body: SkuTModel.Create,
            detail: {
                summary: "创建SKU",
                description: "为商品创建SKU，包含价格、库存、规格等信息",
            },
        }
    )

    // 更新SKU
    .put(
        "/:id",
        async ({ params: { id }, body, db, user, role }) => {
            // 验证SKU是否存在
            const [sku] = await db
                .select({
                    id: skusTable.id,
                    productId: skusTable.productId,
                })
                .from(skusTable)
                .where(eq(skusTable.id, id))
                .limit(1);

            if (!sku) {
                throw new HttpError.NotFound("SKU不存在");
            }

            // 验证业务员权限
            const hasPermission = await validateSalespersonSkuPermission(
                db,
                user.id,
                id,
                role.name
            );

            if (!hasPermission) {
                throw new HttpError.Forbidden("您没有权限管理该SKU");
            }

            // 检查SKU编码是否重复（如果要更新的话）
            if (body.skuCode) {
                const [duplicate] = await db
                    .select({
                        id: skusTable.id,
                    })
                    .from(skusTable)
                    .where(
                        and(
                            eq(skusTable.skuCode, body.skuCode),
                            sql`${skusTable.id} != ${id}`
                        )
                    )
                    .limit(1);

                if (duplicate) {
                    throw new HttpError.Conflict("SKU编码已存在");
                }
            }


            let updated
            // 如果要更新mediaId
            if (body.mediaId !== undefined) {
                // 验证媒体是否存在
                if (body.mediaId) {
                    const [image] = await db
                        .select({
                            id: mediaTable.id,
                        })
                        .from(mediaTable)
                        .where(eq(mediaTable.id, body.mediaId))
                        .limit(1);

                    if (!image) {
                        throw new HttpError.NotFound("图片不存在");
                    }
                }

                // 更新SKU的媒体关联
                await db.transaction(async (tx) => {
                    // 删除原有的关联
                    await tx
                        .delete(skuMediaTable)
                        .where(eq(skuMediaTable.skuId, id));

                    // 创建新的关联（如果mediaId不为空）
                    if (body.mediaId) {
                        await tx
                            .insert(skuMediaTable)
                            .values({
                                skuId: id,
                                mediaId: body.mediaId,
                            });
                    }
                });

                // 从body中移除mediaId，因为它不应该更新到skus表中
                const { mediaId: _, ...updateData } = body;

                // 更新SKU
                updated = await db
                    .update(skusTable)
                    .set(updateData)
                    .where(eq(skusTable.id, id))
                    .returning();
            } else {
                // 更新SKU
                updated = await db
                    .update(skusTable)
                    .set(body)
                    .where(eq(skusTable.id, id))
                    .returning();
            }

            return updated;
        },
        {
            auth: true,
            body: SkuTModel.Create,
            params: t.Object({
                id: t.String(),
            }),
            detail: {
                summary: "更新SKU",
                description: "更新SKU信息",
            },
        }
    )

    // 删除SKU
    .delete(
        "/",
        async ({ body: { ids }, db, user, role }) => {
            // 验证每个SKU的权限
            for (const skuId of ids) {
                const hasPermission = await validateSalespersonSkuPermission(
                    db,
                    user.id,
                    skuId,
                    role.name
                );

                if (!hasPermission) {
                    throw new HttpError.Forbidden("您没有权限删除某些SKU");
                }
            }

            // 删除SKU
            const result = await db
                .delete(skusTable)
                .where(inArray(skusTable.id, ids))
                .returning();

            return result;
        },
        {
            auth: true,
            body: t.Object({
                ids: t.Array(t.String(), { minItems: 1 }),
            }),
            detail: {
                summary: "批量删除SKU",
                description: "删除选中的SKU",
            },
        }
    )

    // 获取SKU列表
    .get(
        "/",
        async ({ query, db, user, role }) => {
            const {
                page = 1,
                limit = 10,
                productId,
                search,
                status,
                sort = "createdAt",
                sortOrder = "desc",
            } = query;

            const baseConditions: any[] = [];

            // 根据用户角色过滤数据
            if (role.name === "salesperson") {
                // 获取业务员关联的工厂和出口商信息
                const affiliations = await db
                    .select({
                        factoryId: salespersonAffiliationsTable.factoryId,
                        exporterId: salespersonAffiliationsTable.exporterId,
                        entityType: salespersonAffiliationsTable.entityType,
                    })
                    .from(salespersonAffiliationsTable)
                    .innerJoin(
                        salespersonsTable,
                        eq(salespersonsTable.id, salespersonAffiliationsTable.salespersonId)
                    )
                    .where(eq(salespersonsTable.userId, user.id));

                if (affiliations.length === 0) {
                    return []
                }

                // 获取有权限的商品ID列表
                const productIdsSet = new Set<string>();
                for (const affiliation of affiliations) {
                    if (affiliation.entityType === "factory") {
                        // 工厂业务员：获取该工厂所有站点的商品
                        const siteProducts = await db
                            .select({
                                productId: siteProductsTable.productId,
                            })
                            .from(siteProductsTable)
                            .innerJoin(
                                sitesTable,
                                eq(siteProductsTable.siteId, sitesTable.id)
                            )
                            .where(eq(sitesTable.factoryId, affiliation.factoryId!));

                        siteProducts.forEach((sp) => productIdsSet.add(sp.productId));
                    } else if (affiliation.entityType === "exporter") {
                        // 出口商业务员：获取该出口商站点的商品
                        const siteProducts = await db
                            .select({
                                productId: siteProductsTable.productId,
                            })
                            .from(siteProductsTable)
                            .where(eq(siteProductsTable.siteId, affiliation.exporterId!));

                        siteProducts.forEach((sp) => productIdsSet.add(sp.productId));
                    }
                }

                if (productIdsSet.size === 0) {
                    return []
                }

                baseConditions.push(
                    inArray(skusTable.productId, Array.from(productIdsSet))
                );
            }

            // 商品筛选
            if (productId) {
                baseConditions.push(eq(skusTable.productId, productId));
            }

            // 搜索条件
            if (search) {
                baseConditions.push(like(skusTable.skuCode, `%${search}%`));
            }

            // 状态筛选
            if (status !== undefined) {
                baseConditions.push(eq(skusTable.status, status));
            }

            // 排序字段白名单
            const allowedSortFields = {
                id: skusTable.id,
                skuCode: skusTable.skuCode,
                price: skusTable.price,
                stock: skusTable.stock,
                status: skusTable.status,
                createdAt: skusTable.createdAt,
                updatedAt: skusTable.updatedAt,
            };

            const orderBy =
                allowedSortFields[sort as keyof typeof allowedSortFields] ||
                skusTable.createdAt;
            const orderDirection = sortOrder === "desc" ? desc(orderBy) : undefined;

            // 构建查询
            let queryBuilder = db
                .select({
                    id: skusTable.id,
                    skuCode: skusTable.skuCode,
                    productId: skusTable.productId,
                    price: skusTable.price,
                    marketPrice: skusTable.marketPrice,
                    costPrice: skusTable.costPrice,
                    weight: skusTable.weight,
                    volume: skusTable.volume,
                    stock: skusTable.stock,
                    specJson: skusTable.specJson,
                    extraAttributes: skusTable.extraAttributes,
                    status: skusTable.status,
                    createdAt: skusTable.createdAt,
                    updatedAt: skusTable.updatedAt,
                    productName: productsTable.name,
                })
                .from(skusTable)
                .innerJoin(productsTable, eq(skusTable.productId, productsTable.id))
                .$dynamic();

            if (baseConditions.length > 0) {
                queryBuilder = queryBuilder.where(and(...baseConditions))
            }

            // 添加排序
            if (orderDirection) {
                queryBuilder = queryBuilder.orderBy(orderBy);
            }

            // 执行查询
            const items = await queryBuilder.limit(limit).offset((page - 1) * limit);

            // 获取SKU的图片信息
            const skuIds = items.map((item) => item.id);
            const images =
                skuIds.length > 0
                    ? await db
                        .select({
                            skuId: skuMediaTable.skuId,
                            mediaId: mediaTable.id,
                            imageUrl: mediaTable.url,
                            imageKey: mediaTable.storageKey,
                        })
                        .from(skuMediaTable)
                        .leftJoin(mediaTable, eq(skuMediaTable.mediaId, mediaTable.id))
                        .where(inArray(skuMediaTable.skuId, skuIds))
                    : [];

            const imageMap = images.reduce(
                (map, img) => {
                    if (img.mediaId) {
                        map[img.skuId] = {
                            id: img.mediaId,
                            url: img.imageUrl,
                            key: img.imageKey,
                        };
                    }
                    return map;
                },
                {} as Record<string, any>
            );

            // 格式化返回数据
            return items.map((item) => ({
                ...item,
                image: imageMap[item.id] || null,
                specJson: item.specJson ? item.specJson : null,
                extraAttributes: item.extraAttributes
                    ? item.extraAttributes
                    : null,
                price: Number.parseFloat(item.price || "0"),
                marketPrice: item.marketPrice
                    ? Number.parseFloat(item.marketPrice)
                    : null,
                costPrice: item.costPrice ? Number.parseFloat(item.costPrice) : null,
                weight: item.weight ? Number.parseFloat(item.weight) : null,
                volume: item.volume ? Number.parseFloat(item.volume) : null,
                stock: item.stock ? Number.parseFloat(item.stock) : null,
            }));
        },
        {
            auth: true,
            query: SkuTModel.ListQuery,
            detail: {
                summary: "获取SKU列表",
                description: "分页获取SKU列表，业务员只能看到自己工厂商品的SKU",
            },
        }
    )

    // 获取SKU详情
    .get(
        "/:id",
        async ({ params: { id }, db, user, role }) => {
            // 验证SKU是否存在
            const [sku] = await db
                .select({
                    id: skusTable.id,
                    skuCode: skusTable.skuCode,
                    productId: skusTable.productId,
                    price: skusTable.price,
                    marketPrice: skusTable.marketPrice,
                    costPrice: skusTable.costPrice,
                    weight: skusTable.weight,
                    volume: skusTable.volume,
                    stock: skusTable.stock,
                    specJson: skusTable.specJson,
                    extraAttributes: skusTable.extraAttributes,
                    status: skusTable.status,
                    createdAt: skusTable.createdAt,
                    updatedAt: skusTable.updatedAt,
                })
                .from(skusTable)
                .where(eq(skusTable.id, id))
                .limit(1);

            if (!sku) {
                throw new HttpError.NotFound("SKU不存在");
            }

            // 验证权限
            const hasPermission = await validateSalespersonSkuPermission(
                db,
                user.id,
                id,
                role.name
            );

            if (!hasPermission) {
                throw new HttpError.Forbidden("您没有权限查看该SKU");
            }

            // 获取商品名称
            const [product] = await db
                .select({
                    name: productsTable.name,
                })
                .from(productsTable)
                .where(eq(productsTable.id, sku.productId))
                .limit(1);

            // 获取所有关联的图片
            const images = await db
                .select({
                    id: mediaTable.id,
                    url: mediaTable.url,
                    storageKey: mediaTable.storageKey,
                    category: mediaTable.category,
                    isMain: skuMediaTable.isMain,
                    sortOrder: skuMediaTable.sortOrder,
                })
                .from(skuMediaTable)
                .leftJoin(mediaTable, eq(skuMediaTable.mediaId, mediaTable.id))
                .where(eq(skuMediaTable.skuId, sku.id))
                .orderBy(skuMediaTable.sortOrder);

            return {
                ...sku,
                productName: product?.name || "",
                images: images.filter(img => img.url), // 过滤掉没有URL的图片
                mainImage: images.find(img => img.isMain) || images[0] || null, // 主图或第一张图
                specJson: sku.specJson ? sku.specJson : null,
                extraAttributes: sku.extraAttributes
                    ? sku.extraAttributes
                    : null,
                price: Number.parseFloat(sku.price || "0"),
                marketPrice: sku.marketPrice
                    ? Number.parseFloat(sku.marketPrice)
                    : null,
                costPrice: sku.costPrice ? Number.parseFloat(sku.costPrice) : null,
                weight: sku.weight ? Number.parseFloat(sku.weight) : null,
                volume: sku.volume ? Number.parseFloat(sku.volume) : null,
                stock: sku.stock ? Number.parseFloat(sku.stock) : null,
            };
        },
        {
            auth: true,
            params: t.Object({
                id: t.String(),
            }),
            detail: {
                summary: "获取SKU详情",
                description: "获取SKU详细信息",
            },
        }
    )

    // 获取商品下的SKU列表（用于商品详情页）
    .get(
        "/by-product/:productId",
        async ({ params: { productId }, db, user, role }) => {
            // 验证权限
            const hasPermission = await validateSalespersonProductPermission(
                db,
                user.id,
                productId,
                role.name
            );

            if (!hasPermission && role.name !== "super_admin") {
                throw new HttpError.Forbidden("您没有权限查看该商品的SKU");
            }

            const skus = await db
                .select({
                    id: skusTable.id,
                    skuCode: skusTable.skuCode,
                    price: skusTable.price,
                    marketPrice: skusTable.marketPrice,
                    costPrice: skusTable.costPrice,
                    stock: skusTable.stock,
                    specJson: skusTable.specJson,
                    status: skusTable.status,
                })
                .from(skusTable)
                .where(eq(skusTable.productId, productId))
                .orderBy(skusTable.createdAt);

            // 获取图片信息
            const skuIds = skus.map((s) => s.id);
            const images =
                skuIds.length > 0
                    ? await db
                        .select({
                            skuId: skuMediaTable.skuId,
                            id: mediaTable.id,
                            url: mediaTable.url,
                            storageKey: mediaTable.storageKey,
                            category: mediaTable.category,
                            isMain: skuMediaTable.isMain,
                            sortOrder: skuMediaTable.sortOrder,
                        })
                        .from(skuMediaTable)
                        .leftJoin(mediaTable, eq(skuMediaTable.mediaId, mediaTable.id))
                        .where(inArray(skuMediaTable.skuId, skuIds))
                        .orderBy(skuMediaTable.sortOrder)
                    : [];

            // 将图片按 SKU ID 分组
            const imageMap = images.reduce(
                (map, img) => {
                    if (img.url) { // 只有有URL的图片才添加
                        if (!map[img.skuId]) {
                            map[img.skuId] = [];
                        }
                        map[img.skuId].push(img);
                    }
                    return map;
                },
                {} as Record<string, any[]>
            );

            return skus.map((sku) => {
                const skuImages = imageMap[sku.id] || [];
                return {
                    ...sku,
                    images: skuImages,
                    mainImage: skuImages.find(img => img.isMain) || skuImages[0] || null,
                    specJson: sku.specJson ? sku.specJson : null,
                    price: Number.parseFloat(sku.price || "0"),
                    marketPrice: sku.marketPrice
                        ? Number.parseFloat(sku.marketPrice)
                        : null,
                    costPrice: sku.costPrice ? Number.parseFloat(sku.costPrice) : null,
                    stock: sku.stock ? Number.parseFloat(sku.stock) : null,
                };
            });
        },
        {
            auth: true,
            params: t.Object({
                productId: t.String(),
            }),
            detail: {
                summary: "获取商品SKU列表",
                description: "获取指定商品下的所有SKU",
            },
        }
    )

    // 更新SKU的媒体关联
    .put(
        "/:id/media",
        async ({ params: { id }, body, db, user, role }) => {
            // 验证SKU存在
            const [sku] = await db
                .select({
                    id: skusTable.id,
                    productId: skusTable.productId,
                })
                .from(skusTable)
                .where(eq(skusTable.id, id))
                .limit(1);

            if (!sku) {
                throw new HttpError.NotFound("SKU不存在");
            }

            // 验证权限
            const hasPermission = await validateSalespersonProductPermission(
                db,
                user.id,
                sku.productId,
                role.name
            );

            if (!hasPermission && role.name !== "super_admin") {
                throw new HttpError.Forbidden("您没有权限管理该商品的SKU");
            }

            // 验证媒体文件是否存在
            if (body.mediaIds && body.mediaIds.length > 0) {
                const existingMedia = await db
                    .select({
                        id: mediaTable.id,
                    })
                    .from(mediaTable)
                    .where(inArray(mediaTable.id, body.mediaIds));

                if (existingMedia.length !== body.mediaIds.length) {
                    throw new HttpError.NotFound("部分媒体文件不存在");
                }
            }

            // 更新媒体关联
            await db.transaction(async (tx) => {
                // 删除原有的关联
                await tx
                    .delete(skuMediaTable)
                    .where(eq(skuMediaTable.skuId, id));

                // 创建新的关联（如果提供了mediaIds）
                if (body.mediaIds && body.mediaIds.length > 0) {
                    await tx
                        .insert(skuMediaTable)
                        .values(
                            body.mediaIds.map((mediaId, index) => ({
                                skuId: id,
                                mediaId,
                                isMain: index === body.mainImageIndex || index === 0, // 根据指定索引或第一张作为主图
                                sortOrder: index,
                            }))
                        );
                }
            });

            return {
                message: "媒体关联更新成功",
            };
        },
        {
            auth: true,
            params: t.Object({
                id: t.String(),
            }),
            body: t.Object({
                mediaIds: t.Array(t.String()),
                mainImageIndex: t.Optional(t.Number()), // 指定哪张图片作为主图
            }),
            detail: {
                summary: "更新SKU媒体关联",
                description: "更新SKU的图片关联，支持多张图片",
            },
        }
    );
