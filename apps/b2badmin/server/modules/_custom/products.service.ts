/**
 * ✍️ 【B2B Service - 业务自定义】
 * --------------------------------------------------------
 * 💡 你可以在此重写基类方法或添加私有业务逻辑。
 * 🛡️ 自动化脚本永远不会覆盖此文件。
 * --------------------------------------------------------
 */

import {
  attributeTable,
  attributeTemplateTable,
  attributeValueTable,
  mediaTable,
  productMasterCategoriesTable,
  productMediaTable,
  productsTable,
  productTemplateTable,
  siteCategoriesTable,
  siteProductsTable,
} from "@repo/contract";
import { and, eq, inArray, like, or } from "drizzle-orm";
import { HttpError } from "elysia-http-problem-json";
import { ProductsGeneratedService } from "../_generated/products.service";
import type { ServiceContext } from "../_lib/base-service";

export class ProductsService extends ProductsGeneratedService {
  /**
   * 🛡️ 核心：获取所有可用的模板
   * 模板是全局公用的，不需要站点隔离
   */
  async getTemplates(ctx: ServiceContext, search?: string) {
    const templates = await ctx.db
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
        ? await ctx.db
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
  }

  /**
   * 🛡️ 核心：创建商品（支持站点隔离和模板绑定）
   */
  async createProduct(data: any, ctx: ServiceContext) {
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
      imageIds,
      mainImageId,
      seoTitle,
    } = data;

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
        const existingImages = await tx
          .select()
          .from(mediaTable)
          .where(
            and(
              inArray(mediaTable.id, imageIds),
              eq(mediaTable.siteId, ctx.auth.siteId)
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
        const productImageData = imageIds.map(
          (imageId: string, index: number) => ({
            productId: product.id,
            mediaId: imageId,
            isMain: imageId === mainImageId || (index === 0 && !mainImageId),
          })
        );
        await tx.insert(productMediaTable).values(productImageData);
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
   * 🛡️ 核心：获取站点商品列表
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

    // 查询数据
    const result = await ctx.db
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

    // 获取总数
    const totalSelect = ctx.db
      .select({ count: productsTable.id })
      .from(siteProductsTable)
      .innerJoin(
        productsTable,
        eq(siteProductsTable.productId, productsTable.id)
      );

    const totalResult = await this.withScope(totalSelect, ctx, conditions);
    const total = totalResult.length;

    return {
      data: result,
      total,
      page: Number(page),
      limit: Number(limit),
    };
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
