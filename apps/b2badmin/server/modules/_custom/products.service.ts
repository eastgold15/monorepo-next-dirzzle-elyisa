/**
 * ✍️ 【B2B Service - 业务自定义】
 * --------------------------------------------------------
 * 💡 你可以在此重写基类方法或添加私有业务逻辑。
 * 🛡️ 自动化脚本永远不会覆盖此文件。
 * --------------------------------------------------------
 */

import {
  attributeTemplateTable,
  mediaTable,
  productMasterCategoriesTable,
  productMediaTable,
  productsTable,
  productTemplateTable,
  siteCategoriesTable,
  siteProductsTable,
  skusTable,
} from "@repo/contract";
import { and, asc, eq, inArray, like, or, sql } from "drizzle-orm";
import { HttpError } from "elysia-http-problem-json";
import { ProductsGeneratedService } from "../_generated/products.service";
import type { ServiceContext } from "../_lib/base-service";

export class ProductsService extends ProductsGeneratedService {
  /**
   * 🛡️ 核心：创建商品（支持站点隔离和模板绑定）
   */
  async createProduct(body: any, ctx: ServiceContext) {
    const {
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
      seoTitle,
      // 媒体字段
      mediaIds, // 商品图片ID列表
      mainImageId, // 主图ID
      videoIds, // 视频ID列表
    } = body;

    return await ctx.db.transaction(async (tx) => {
      // 1. 验证站点分类
      const [siteCategory] = await tx
        .select()
        .from(siteCategoriesTable)
        .where(
          and(
            eq(siteCategoriesTable.id, siteCategoryId),
            eq(siteCategoriesTable.siteId, ctx.auth.siteId)
          )
        )
        .limit(1);

      if (!siteCategory) {
        throw new HttpError.NotFound(`站点分类不存在${siteCategoryId}，站点ID:${ctx.auth.siteId}`,);
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
          template.masterCategoryId !== siteCategory.masterCategoryId
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
          siteId: ctx.auth.siteId,
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
          masterCategoryId: siteCategory.masterCategoryId,
        });
      }

      // 6. 关联媒体（图片和视频）
      const allMediaIds = [...(mediaIds || []), ...(videoIds || [])];

      if (allMediaIds.length > 0) {
        // 验证媒体是否存在
        const existingMedia = await tx
          .select()
          .from(mediaTable)
          .where(inArray(mediaTable.id, allMediaIds));

        const foundIds = existingMedia.map((m) => m.id);
        const notFound = allMediaIds.filter((id) => !foundIds.includes(id));

        if (notFound.length > 0) {
          throw new HttpError.NotFound(`媒体 ID ${notFound.join(", ")} 不存在`);
        }

        // 构建媒体关联数据
        const mediaRelations: any[] = [];

        // 处理图片（sortOrder 从 0 开始）
        if (mediaIds && mediaIds.length > 0) {
          mediaIds.forEach((mediaId: string, index: number) => {
            mediaRelations.push({
              productId: product.id,
              mediaId,
              isMain: mediaId === mainImageId,
              sortOrder: index,
            });
          });
        }

        // 处理视频（sortOrder 设为 -1）
        if (videoIds && videoIds.length > 0) {
          videoIds.forEach((mediaId: string, index: number) => {
            mediaRelations.push({
              productId: product.id,
              mediaId,
              isMain: false,
              sortOrder: -1 - index, // -1, -2, -3... 保持顺序
            });
          });
        }

        if (mediaRelations.length > 0) {
          await tx.insert(productMediaTable).values(mediaRelations);
        }
      }

      // 7. 创建站点商品关联
      const [siteProduct] = await tx
        .insert(siteProductsTable)
        .values({
          siteId: ctx.auth.siteId,
          productId: product.id,
          sitePrice: price ? price.toString() : null,
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
  }

  /**
   * 🛡️ 核心：获取站点商品列表（包含媒体和SKU）
   */
  async getSiteProducts(query: any, ctx: ServiceContext) {
    const { page = 1, limit = 10, search, categoryId } = query;

    // 构建查询条件
    const conditions = [
      eq(siteProductsTable.siteId, ctx.auth.siteId),
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

    // 查询商品数据
    const result = await ctx.db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        spuCode: productsTable.spuCode,
        description: productsTable.description,
        status: productsTable.status,
        units: productsTable.units,
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

    // 获取商品ID列表
    const productIds = result.map((p) => p.id);

    // 批量查询商品媒体（图片和视频）
    const mediaMap = new Map<
      string,
      { images: any[]; videos: any[]; mainImage: any }
    >();
    if (productIds.length > 0) {
      const mediaRelations = await ctx.db
        .select({
          productId: productMediaTable.productId,
          mediaId: productMediaTable.mediaId,
          isMain: productMediaTable.isMain,
          sortOrder: productMediaTable.sortOrder,
          // 媒体信息
          mediaUrl: mediaTable.url,
          mediaOriginalName: mediaTable.originalName,
          mediaMimeType: mediaTable.mimeType,
          mediaType: mediaTable.mediaType,
          thumbnailUrl: mediaTable.thumbnailUrl,
        })
        .from(productMediaTable)
        .innerJoin(mediaTable, eq(productMediaTable.mediaId, mediaTable.id))
        .where(inArray(productMediaTable.productId, productIds))
        .orderBy(asc(productMediaTable.sortOrder));

      // 整理媒体数据
      for (const product of result) {
        mediaMap.set(product.id, { images: [], videos: [], mainImage: null });
      }

      for (const media of mediaRelations) {
        const productMedia = mediaMap.get(media.productId);
        if (!productMedia) continue;

        const mediaInfo = {
          id: media.mediaId,
          url: media.mediaUrl,
          originalName: media.mediaOriginalName,
          mimeType: media.mediaMimeType,
          mediaType: media.mediaType,
          thumbnailUrl: media.thumbnailUrl,
          isMain: media.isMain,
          sortOrder: media.sortOrder,
        };

        // sortOrder >= 0 是图片，< 0 是视频
        if (media.sortOrder >= 0) {
          productMedia.images.push(mediaInfo);
          if (media.isMain) {
            productMedia.mainImage = mediaInfo;
          }
        } else {
          productMedia.videos.push(mediaInfo);
        }
      }

      // 如果没有主图，使用第一张图片
      for (const product of result) {
        const productMedia = mediaMap.get(product.id);
        if (
          productMedia &&
          !productMedia.mainImage &&
          productMedia.images.length > 0
        ) {
          productMedia.mainImage = productMedia.images[0];
        }
      }
    }

    // 批量查询 SKU 数据
    const skuMap = new Map<string, any[]>();
    // 批量查询模板关联
    const templateMap = new Map<string, string>();
    if (productIds.length > 0) {
      // 查询模板
      const templates = await ctx.db
        .select({
          productId: productTemplateTable.productId,
          templateId: productTemplateTable.templateId,
        })
        .from(productTemplateTable)
        .where(inArray(productTemplateTable.productId, productIds));

      for (const template of templates) {
        templateMap.set(template.productId, template.templateId);
      }

      // 查询 SKU
      const skus = await ctx.db
        .select({
          id: skusTable.id,
          productId: skusTable.productId,
          skuCode: skusTable.skuCode,
          price: skusTable.price,
          marketPrice: skusTable.marketPrice,
          costPrice: skusTable.costPrice,
          stock: skusTable.stock,
          specJson: skusTable.specJson,
          status: skusTable.status,
        })
        .from(skusTable)
        .where(inArray(skusTable.productId, productIds));

      for (const sku of skus) {
        if (!skuMap.has(sku.productId)) {
          skuMap.set(sku.productId, []);
        }
        skuMap.get(sku.productId)!.push(sku);
      }
    }

    // 组合数据
    const enrichedResult = result.map((product) => {
      const media = mediaMap.get(product.id) || {
        images: [],
        videos: [],
        mainImage: null,
      };
      const skus = skuMap.get(product.id) || [];
      // 提取 mediaIds 和 videoIds
      const mediaIds = media.images.map((img: any) => img.id);
      const videoIds = media.videos.map((vid: any) => vid.id);

      return {
        ...product,
        // 模板 ID
        templateId: templateMap.get(product.id) || null,
        // 媒体 ID 列表（用于编辑）
        mediaIds,
        videoIds,
        // 媒体数据（用于展示）
        images: media.images,
        videos: media.videos,
        mainImage: media.mainImage?.url || null,
        mainImageId: media.mainImage?.id || null,
        // SKU 数据
        skus,
        skuCount: skus.length,
      };
    });



    // 替换 getSiteProducts 最后的总数计算部分
    const [{ count }] = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(siteProductsTable)
      .innerJoin(productsTable, eq(siteProductsTable.productId, productsTable.id))
      .where(and(...conditions));
    return {
      data: enrichedResult,
      total: Number(count), // 这里的 count 是真实的数据库总数
      page: Number(page),
      limit: Number(limit),
    };
  }


  /**
     * 🛡️ 核心：更新商品（全量关联更新）
     */
  async updateProduct(productId: string, body: any, ctx: ServiceContext) {
    const {
      // 1. 基础信息
      name, spuCode, description, status, units,
      // 2. 站点特定信息
      price, siteName, siteDescription, seoTitle, siteCategoryId,
      // 3. 关联 ID
      templateId,
      // 4. 媒体数据
      mediaIds, mainImageId, videoIds,
      // 5. SKU 列表 (全量覆盖更新方案)
      skus
    } = body;

    return await ctx.db.transaction(async (tx) => {
      // --- 阶段 A: 权限与存在性验证 ---
      const [siteProduct] = await tx
        .select()
        .from(siteProductsTable)
        .where(
          and(
            eq(siteProductsTable.productId, productId),
            eq(siteProductsTable.siteId, ctx.auth.siteId)
          )
        )
        .limit(1);

      if (!siteProduct) {
        throw new HttpError.NotFound("商品不存在或无权访问");
      }

      // --- 阶段 B: 更新基础表 (productsTable) ---
      const productUpdate: any = {};
      if (name !== undefined) productUpdate.name = name;
      if (spuCode !== undefined) productUpdate.spuCode = spuCode;
      if (description !== undefined) productUpdate.description = description;
      if (status !== undefined) productUpdate.status = status;
      if (units !== undefined) productUpdate.units = units;

      if (Object.keys(productUpdate).length > 0) {
        await tx.update(productsTable).set(productUpdate).where(eq(productsTable.id, productId));
      }

      // --- 阶段 C: 更新站点商品表与分类联动 ---
      const siteUpdate: any = {
        siteName: siteName || name,
        siteDescription: siteDescription || description,
        sitePrice: price ? price.toString() : null,
        seoTitle,
        siteCategoryId
      };

      await tx.update(siteProductsTable)
        .set(siteUpdate)
        .where(and(eq(siteProductsTable.productId, productId), eq(siteProductsTable.siteId, ctx.auth.siteId)));

      // 如果更新了站点分类，同步更新主分类关联
      if (siteCategoryId) {
        const [category] = await tx.select().from(siteCategoriesTable).where(eq(siteCategoriesTable.id, siteCategoryId)).limit(1);
        if (category?.masterCategoryId) {
          await tx.delete(productMasterCategoriesTable).where(eq(productMasterCategoriesTable.productId, productId));
          await tx.insert(productMasterCategoriesTable).values({
            productId,
            masterCategoryId: category.masterCategoryId
          });
        }
      }

      // --- 阶段 D: 媒体全量替换 (Images & Videos) ---
      if (mediaIds !== undefined || videoIds !== undefined) {
        await tx.delete(productMediaTable).where(eq(productMediaTable.productId, productId));

        const allMediaIds = [...(mediaIds || []), ...(videoIds || [])];
        if (allMediaIds.length > 0) {
          const mediaRelations: any[] = [];
          // 图片处理 (sortOrder >= 0)
          mediaIds?.forEach((id: string, idx: number) => {
            mediaRelations.push({
              productId,
              mediaId: id,
              isMain: id === mainImageId,
              sortOrder: idx
            });
          });
          // 视频处理 (sortOrder < 0)
          videoIds?.forEach((id: string, idx: number) => {
            mediaRelations.push({
              productId,
              mediaId: id,
              isMain: false,
              sortOrder: -1 - idx
            });
          });
          await tx.insert(productMediaTable).values(mediaRelations);
        }
      }

      // --- 阶段 E: SKU 全量替换 ---
      // 逻辑：先删除该商品下所有旧 SKU，再插入新 SKU。这是保持数据清洁最简单的方式。
      if (skus && Array.isArray(skus)) {
        await tx.delete(skusTable).where(eq(skusTable.productId, productId));
        if (skus.length > 0) {
          const skuValues = skus.map(s => ({
            productId,
            skuCode: s.skuCode,
            price: s.price?.toString(),
            stock: s.stock || 0,
            specJson: s.specJson || {},
            status: s.status ?? 1
          }));
          await tx.insert(skusTable).values(skuValues);
        }
      }

      // --- 阶段 F: 模板关联更新 ---
      if (templateId !== undefined) {
        await tx.delete(productTemplateTable).where(eq(productTemplateTable.productId, productId));
        if (templateId) {
          await tx.insert(productTemplateTable).values({ productId, templateId });
        }
      }

      return { success: true, id: productId };
    });
  }

  /**
   * 🛡️ 核心：批量删除商品
   */
  async batchDelete(ids: string[], ctx: ServiceContext) {
    await ctx.db.transaction(async (tx) => {
      // 1. 验证商品是否属于当前站点
      const siteProducts = await tx
        .select()
        .from(siteProductsTable)
        .where(
          and(
            inArray(siteProductsTable.productId, ids),
            eq(siteProductsTable.siteId, ctx.auth.siteId)
          )
        );

      if (siteProducts.length === 0) {
        throw new HttpError.NotFound("未找到可删除的商品");
      }

      // 2. 删除站点商品关联
      await tx
        .delete(siteProductsTable)
        .where(
          and(
            eq(siteProductsTable.siteId, ctx.auth.siteId),
            inArray(siteProductsTable.productId, ids)
          )
        );
      await tx
        .delete(skusTable)
        .where(inArray(skusTable.productId, ids));

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

    return { count: ids.length, message: `成功删除 ${ids.length} 个商品` };
  }
}
