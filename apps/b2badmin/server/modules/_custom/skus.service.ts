/**
 * ✍️ 【B2B Service - 业务自定义】
 * --------------------------------------------------------
 * 💡 你可以在此重写基类方法或添加私有业务逻辑。
 * 🛡️ 自动化脚本永远不会覆盖此文件。
 * --------------------------------------------------------
 */
import {
  mediaTable,
  productSiteCategoriesTable,
  productsTable,
  salespersonAffiliationsTable,
  salespersonsTable,
  siteProductsTable,
  sitesTable,
  skuMediaTable,
  skusTable,
} from "@repo/contract";
import { and, desc, eq, inArray, like, sql } from "drizzle-orm";
import { HttpError } from "elysia-http-problem-json";
import { SkusGeneratedService } from "../_generated/skus.service";
import type { ServiceContext } from "../_lib/base-service";

export class SkusService extends SkusGeneratedService {
  async deleteMany(ctx: ServiceContext, ids: string[]) {
    const db = ctx.db;

    // 删除SKU
    const result = await db
      .delete(skusTable)
      .where(inArray(skusTable.id, ids))
      .returning();

    return { count: result.length };
  }

  // 验证商品是否存在
  async validateProductExists(
    ctx: ServiceContext,
    productId: string
  ): Promise<boolean> {
    const db = ctx.db;
    const [product] = await db
      .select({
        id: productsTable.id,
      })
      .from(productsTable)
      .where(eq(productsTable.id, productId))
      .limit(1);

    return !!product;
  }

  // 检查SKU编码是否重复
  async checkSkuCodeExists(
    ctx: ServiceContext,
    skuCode: string,
    productId: string,
    excludeId?: string
  ): Promise<boolean> {
    const db = ctx.db;
    const conditions = [
      eq(skusTable.productId, productId),
      eq(skusTable.skuCode, skuCode),
    ];

    if (excludeId) {
      conditions.push(sql`${skusTable.id} != ${excludeId}`);
    }

    const [existing] = await db
      .select({ id: skusTable.id })
      .from(skusTable)
      .where(and(...conditions))
      .limit(1);

    return !!existing;
  }

  // 验证媒体是否存在
  async validateMediaExists(
    ctx: ServiceContext,
    mediaId: string
  ): Promise<boolean> {
    const db = ctx.db;
    const [image] = await db
      .select({
        id: mediaTable.id,
      })
      .from(mediaTable)
      .where(eq(mediaTable.id, mediaId))
      .limit(1);

    return !!image;
  }

  // 批量创建SKU
  async batchCreateSkus(ctx: ServiceContext, productId: string, skus: any[]) {
    const db = ctx.db;

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
        `SKU编码已存在: ${existingSkus.map((s: any) => s.skuCode).join(", ")}`
      );
    }

    // 创建SKU
    const result = await db.transaction(async (tx: any) => {
      const createdSkus = await tx
        .insert(skusTable)
        .values(
          skus.map((sku) => ({
            skuCode: sku.skuCode,
            productId,
            price: String(sku.price),
            stock: String(sku.stock || "0"),
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
            sku.mediaIds.map((mediaId: any, index: any) => ({
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
  }

  // 创建单个SKU
  async createSkuWithMedia(
    ctx: ServiceContext,
    skuData: any,
    productId: string,
    mediaId?: string
  ) {
    const db = ctx.db;

    // 创建SKU
    const result = await db.transaction(async (tx: any) => {
      const [sku] = await tx
        .insert(skusTable)
        .values({
          ...skuData,
          productId,
        })
        .returning();

      // 如果提供了mediaId，创建SKU和媒体的关联
      if (mediaId) {
        await tx.insert(skuMediaTable).values({
          skuId: sku.id,
          mediaId,
        });
      }

      return sku;
    });

    return result;
  }

  // 更新SKU及媒体关联
  async updateSkuWithMedia(ctx: ServiceContext, id: string, body: any) {
    const db = ctx.db;

    let updated;
    // 如果要更新mediaId
    if (body.mediaId !== undefined) {
      // 更新SKU的媒体关联
      await db.transaction(async (tx: any) => {
        // 删除原有的关联
        await tx.delete(skuMediaTable).where(eq(skuMediaTable.skuId, id));

        // 创建新的关联（如果mediaId不为空）
        if (body.mediaId) {
          await tx.insert(skuMediaTable).values({
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

    return updated[0];
  }
  /**
   * 🛡️ 核心：单个 SKU 更新（含媒体关联全量替换）
   */
  async updateSingleSku(ctx: ServiceContext, id: string, body: any) {
    const db = ctx.db;
    const { mediaIds, mainImageId, ...updateData } = body;

    return await db.transaction(async (tx) => {
      // 1. 安全性检查：确保 SKU 属于该站点（如果 SKU 表有 siteId）
      // 如果你的 SKU 表没有 siteId，需通过 productId 关联 productsTable 校验 siteId
      const [existingSku] = await tx
        .select()
        .from(skusTable)
        .where(eq(skusTable.id, id))
        .limit(1);

      if (!existingSku) {
        throw new HttpError.NotFound("SKU 不存在");
      }

      // 2. 更新 SKU 基础信息
      if (Object.keys(updateData).length > 0) {
        // 处理数值类型转换
        const formattedData = {
          ...updateData,
          price: updateData.price?.toString(),
          stock: updateData.stock?.toString(),
          marketPrice: updateData.marketPrice?.toString(),
          costPrice: updateData.costPrice?.toString(),
        };

        await tx
          .update(skusTable)
          .set(formattedData)
          .where(eq(skusTable.id, id));
      }

      // 3. 处理媒体关联更新 (如果传了 mediaIds)
      if (mediaIds !== undefined) {
        // a. 先删除该 SKU 旧的所有图片关联
        await tx.delete(skuMediaTable).where(eq(skuMediaTable.skuId, id));

        // b. 插入新的关联
        if (mediaIds.length > 0) {
          const mediaRelations = mediaIds.map(
            (mediaId: string, index: number) => ({
              skuId: id,
              mediaId,
              // 如果传了 mainImageId 则匹配，否则默认第一张为主图
              isMain: mainImageId ? mediaId === mainImageId : index === 0,
              sortOrder: index,
            })
          );

          await tx.insert(skuMediaTable).values(mediaRelations);
        }
      }

      return { success: true, id };
    });
  }
  // 获取业务员有权限的商品ID列表
  async getSalesmanProductIds(ctx: ServiceContext): Promise<string[]> {
    const db = ctx.db;

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
      .where(eq(salespersonsTable.userId, ctx.auth.userId));

    if (affiliations.length === 0) {
      return [];
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
          .innerJoin(sitesTable, eq(siteProductsTable.siteId, sitesTable.id))
          .where(eq(sitesTable.factoryId, affiliation.factoryId!));

        siteProducts.forEach((sp: any) => productIdsSet.add(sp.productId));
      } else if (affiliation.entityType === "exporter") {
        // 出口商业务员：获取该出口商站点的商品
        const siteProducts = await db
          .select({
            productId: siteProductsTable.productId,
          })
          .from(siteProductsTable)
          .where(eq(siteProductsTable.siteId, affiliation.exporterId!));

        siteProducts.forEach((sp: any) => productIdsSet.add(sp.productId));
      }
    }

    return Array.from(productIdsSet);
  }

  // 获取SKU列表
  async getSkusList(ctx: ServiceContext, query: any) {
    const db = ctx.db;
    const {
      page = 1,
      limit = 10,
      productId,
      search,
      status,
      sort = "createdAt",
      sortOrder = "desc",
    } = query;

    const { siteId } = ctx.auth;

    const baseConditions = [];

    // 1. 站点筛选 (必须)
    if (siteId) {
      baseConditions.push(eq(skusTable.siteId, siteId));
    }

    // 2. 商品筛选
    if (productId) {
      baseConditions.push(eq(skusTable.productId, productId));
    }

    // 3. 搜索条件 (SKU Code 或 商品名称)
    if (search) {
      baseConditions.push(like(skusTable.skuCode, `%${search}%`));
    }

    // 4. 状态筛选
    if (status !== undefined) {
      baseConditions.push(eq(skusTable.status, Number(status)));
    }

    // 排序处理
    const allowedSortFields = {
      id: skusTable.id,
      skuCode: skusTable.skuCode,
      price: skusTable.price,
      stock: skusTable.stock,
      status: skusTable.status,
      createdAt: skusTable.createdAt,
    };
    const orderByField =
      allowedSortFields[sort as keyof typeof allowedSortFields] ||
      skusTable.createdAt;

    // --- 构建主查询 ---
    let queryBuilder = db
      .select({
        // SKU 信息
        id: skusTable.id,
        skuCode: skusTable.skuCode,
        price: skusTable.price,
        stock: skusTable.stock,
        status: skusTable.status,
        specJson: skusTable.specJson,
        createdAt: skusTable.createdAt,
        // 补充商品信息
        product: {
          id: productsTable.id,
          name: productsTable.name,
          spuCode: productsTable.spuCode,
        },
        // 补充站点分类信息 (由于是多对多，这里通常取关联表的 categoryId)
        siteCategoryId: productSiteCategoriesTable.categoryId,
      })
      .from(skusTable)
      // 连商品表
      .innerJoin(productsTable, eq(skusTable.productId, productsTable.id))
      // 连商品站点分类关联表 (Left Join 以防万一没设分类也能查出来)
      .leftJoin(
        productSiteCategoriesTable,
        eq(productsTable.id, productSiteCategoriesTable.productId)
      )
      .$dynamic();

    if (baseConditions.length > 0) {
      queryBuilder = queryBuilder.where(and(...baseConditions));
    }

    // 排序与分页
    const items = await queryBuilder
      .orderBy(sortOrder === "desc" ? desc(orderByField) : orderByField)
      .limit(limit)
      .offset((page - 1) * limit);

    // --- 批量获取图片信息 (优化 N+1) ---
    const skuIds = items.map((item) => item.id);
    const images =
      skuIds.length > 0
        ? await db
          .select({
            skuId: skuMediaTable.skuId,
            mediaId: mediaTable.id,
            url: mediaTable.url,
            isMain: skuMediaTable.isMain,
          })
          .from(skuMediaTable)
          .innerJoin(mediaTable, eq(skuMediaTable.mediaId, mediaTable.id))
          .where(inArray(skuMediaTable.skuId, skuIds))
          .orderBy(skuMediaTable.sortOrder)
        : [];

    // 图片按 SKU 分组 Map
    const imageMap = images.reduce(
      (map: any, img: any) => {
        if (!map[img.skuId]) map[img.skuId] = [];
        map[img.skuId].push(img);
        return map;
      },
      {} as Record<string, any[]>
    );

    // --- 最终数据格式化 ---
    return items.map((item: any) => {
      const skuImages = imageMap[item.id] || [];
      return {
        ...item,
        price: Number(item.price),
        stock: Number(item.stock),
        // 提取该 SKU 的主图
        mainImage: skuImages.find((i) => i.isMain) || skuImages[0] || null,
        allImages: skuImages,
      };
    });
  }
  // 获取SKU详情
  async getSkuDetail(ctx: ServiceContext, id: string) {
    const db = ctx.db;

    // 获取SKU基本信息
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
      product: product
        ? {
          id: sku.productId,
          name: product.name,
        }
        : null,
      values: [], // 暂时返回空数组
      images: images.filter((img: any) => img.url), // 过滤掉没有URL的图片
      mainImage: images.find((img: any) => img.isMain) || images[0] || null, // 主图或第一张图
      specJson: sku.specJson ? sku.specJson : null,
      extraAttributes: sku.extraAttributes ? sku.extraAttributes : null,
      price: Number.parseFloat(sku.price || "0"),
      marketPrice: sku.marketPrice ? Number.parseFloat(sku.marketPrice) : null,
      costPrice: sku.costPrice ? Number.parseFloat(sku.costPrice) : null,
      weight: sku.weight ? Number.parseFloat(sku.weight) : null,
      volume: sku.volume ? Number.parseFloat(sku.volume) : null,
      stock: sku.stock ? Number.parseFloat(sku.stock) : null,
    };
  }

  // 获取商品下的SKU列表
  async getSkusByProduct(ctx: ServiceContext, productId: string) {
    const db = ctx.db;

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
    const skuIds = skus.map((s: any) => s.id);
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
      (map: any, img: any) => {
        if (img.url) {
          // 只有有URL的图片才添加
          if (!map[img.skuId]) {
            map[img.skuId] = [];
          }
          map[img.skuId].push(img);
        }
        return map;
      },
      {} as Record<string, any[]>
    );

    return skus.map((sku: any) => {
      const skuImages = imageMap[sku.id] || [];
      return {
        ...sku,
        images: skuImages,
        mainImage:
          skuImages.find((img: any) => img.isMain) || skuImages[0] || null,
        specJson: sku.specJson ? sku.specJson : null,
        price: Number.parseFloat(sku.price || "0"),
        marketPrice: sku.marketPrice
          ? Number.parseFloat(sku.marketPrice)
          : null,
        costPrice: sku.costPrice ? Number.parseFloat(sku.costPrice) : null,
        stock: sku.stock ? Number.parseFloat(sku.stock) : null,
      };
    });
  }

  // 更新SKU的媒体关联
  async updateSkuMedia(
    ctx: ServiceContext,
    id: string,
    mediaIds: string[],
    mainImageIndex?: number
  ) {
    const db = ctx.db;

    // 验证媒体文件是否存在
    if (mediaIds && mediaIds.length > 0) {
      const existingMedia = await db
        .select({
          id: mediaTable.id,
        })
        .from(mediaTable)
        .where(inArray(mediaTable.id, mediaIds));

      if (existingMedia.length !== mediaIds.length) {
        throw new HttpError.NotFound("部分媒体文件不存在");
      }
    }

    // 更新媒体关联
    await db.transaction(async (tx: any) => {
      // 删除原有的关联
      await tx.delete(skuMediaTable).where(eq(skuMediaTable.skuId, id));

      // 创建新的关联（如果提供了mediaIds）
      if (mediaIds && mediaIds.length > 0) {
        await tx.insert(skuMediaTable).values(
          mediaIds.map((mediaId, index) => ({
            skuId: id,
            mediaId,
            isMain: index === mainImageIndex || index === 0, // 根据指定索引或第一张作为主图
            sortOrder: index,
          }))
        );
      }
    });

    return {
      message: "媒体关联更新成功",
    };
  }
}
