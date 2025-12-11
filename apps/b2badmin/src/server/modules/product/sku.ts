import { SkuModel } from "@repo/contract";
import { and, eq, inArray, like, or } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import z from "zod/v4";
import { dbPlugin } from "@/server/db/connection";
import {
  attributeTable,
  attributeValueTable,
  mediaTable,
  productTemplateTable,
  skusTable,
} from "@/server/db/schema";
import { type CommonRes, commonRes, type PageData } from "@/server/utils/Res";
import { buildPageMeta, paginate } from "@/server/utils/services";

export const skuRoute = new Elysia({ name: "sku", prefix: "/v2/sku" })
  .use(dbPlugin)
  // 创建商品的sku
  .post(
    "/batchCreate/:productId",
    async ({ params: { productId }, body: skus, db }) => {
      const productTemplate = await db.query.productTemplateTable.findFirst({
        where: eq(productTemplateTable.productId, productId),
        with: { template: true },
      });

      if (!productTemplate) {
        throw new HttpError.NotFound("商品模板不存在");
      }

      const templateId = productTemplate.templateId;

      const saleAttributes = await db.query.attributeTable.findMany({
        where: and(
          eq(attributeTable.templateId, templateId),
          eq(attributeTable.isSaleAttr, true)
        ),
        columns: {
          id: true,
          code: true,
        },
      });

      const attrCodeToId = new Map(
        saleAttributes.map((attr) => [attr.code, attr.id])
      );
      const expectedCodes = new Set(saleAttributes.map((attr) => attr.code));

      // 3. 获取所有合法的 valueCode 集合（按 attributeId 分组）
      const attributeIds = saleAttributes.map((a) => a.id);
      const validValues = await db.query.attributeValueTable.findMany({
        where: inArray(attributeValueTable.attributeId, attributeIds),
        columns: {
          valueCode: true,
          attributeId: true,
        },
      });

      const validValueCodes = new Map<string, Set<string>>();
      for (const v of validValues) {
        if (!validValueCodes.has(v.attributeId)) {
          validValueCodes.set(v.attributeId, new Set());
        }
        validValueCodes.get(v.attributeId)?.add(v.valueCode);
      }

      // 4. 校验每个 SKU 的 specJson
      for (const sku of skus) {
        const { specJson } = sku;

        // 4.1 必须包含所有销售属性
        if (Object.keys(specJson).length !== expectedCodes.size) {
          throw new Error(
            `SKU 规格必须包含所有销售属性: ${Array.from(expectedCodes).join(", ")}`
          );
        }

        // 4.2 每个属性值必须合法
        for (const [code, valueCode] of Object.entries(specJson)) {
          if (!expectedCodes.has(code)) {
            throw new Error(`未知销售属性: ${code}`);
          }

          const attrId = attrCodeToId.get(code);
          if (!attrId) {
            throw new Error(`未知销售属性: ${code}`);
          }
          const allowed = validValueCodes.get(attrId);
          if (!allowed?.has(valueCode)) {
            throw new Error(`属性 "${code}" 的值 "${valueCode}" 不合法`);
          }
        }
      }

      // 5. 检查是否已存在相同 specJson 的 SKU（防重复）
      const existingSkus = await db.query.skusTable.findMany({
        where: eq(skusTable.productId, productId),
        columns: { id: true, specJson: true },
      });

      const existingSpecs = new Set(
        existingSkus.map((s) =>
          JSON.stringify(
            s.specJson,
            Object.keys(s.specJson as Record<string, unknown>).sort()
          )
        )
      );

      const newSkusToInsert = skus.filter((sku) => {
        const key = JSON.stringify(
          sku.specJson,
          Object.keys(sku.specJson).sort()
        );
        return !existingSpecs.has(key);
      });

      if (newSkusToInsert.length === 0) {
        return new HttpError.NotFound("无新 SKU 需要创建");
      }

      // 6. 批量插入
      const inserted = await db
        .insert(skusTable)
        .values(
          newSkusToInsert.map((sku) => ({
            productId,
            skuCode: sku.skuCode,
            price: sku.price,
            stock: sku.stock ?? "0",
            specJson: sku.specJson, // Drizzle 会自动序列化为 JSON
            extraAttributes: {}, // 默认空对象
            status: 0, // 默认状态为 0（不展示）
          }))
        )
        .returning();

      return commonRes(inserted);
    },
    {
      params: z.object({
        productId: z.string(),
      }),
      body: SkuModel.BatchCreate,
      detail: {
        tags: ["批量创建商品SKU"],
        summary: "批量创建商品SKU",
      },
    }
  )

  .delete(
    "/",
    async ({ body: { ids }, db }) => {
      const res = await db
        .delete(skusTable)
        .where(inArray(skusTable.id, ids))
        .returning();

      if (!res.length) {
        throw new HttpError.NotFound("SKU不存在");
      }

      return commonRes("删除成功", 204);
    },
    {
      detail: {
        summary: "批量删除SKU",
        description: "根据ID列表批量删除SKU",
        tags: ["SKU管理"],
      },
      body: t.Object({
        ids: t.Array(t.String()),
      }),
    }
  )

  .put(
    "/update/:id",
    async ({ params: { id }, body, db }) => {
      // 1. 检查 SKU 是否存在
      const existing = await db
        .select()
        .from(skusTable)
        .where(eq(skusTable.id, id))
        .limit(1);

      if (!existing[0]) {
        throw new HttpError.NotFound("SKU 不存在");
      }

      // 2. 不允许修改 specJson（销售属性）
      if (
        body.specJson &&
        JSON.stringify(body.specJson) !== JSON.stringify(existing[0].specJson)
      ) {
        throw new HttpError.BadRequest("销售属性不可修改，只能修改其他属性");
      }

      // 3. 准备更新数据
      const updateData: any = {
        ...body,
      };

      // 处理 imageId
      if (body.imageId && Array.isArray(body.imageId)) {
        updateData.imageId = body.imageId[0];
      } else if (body.imageId === undefined) {
        // 如果没有传入 imageId，则不更新
        updateData.imageId = undefined;
      }

      // 处理 extraAttributes
      if (body.extraAttributes === undefined) {
        updateData.extraAttributes = existing[0].extraAttributes || {};
      }

      // 排除不应该更新的字段
      updateData.id = undefined;
      updateData.productId = undefined;
      updateData.skuCode = undefined;
      updateData.createdAt = undefined;
      updateData.updatedAt = undefined;
      updateData.specJson = undefined; // 不允许修改销售属性

      // 4. 执行更新
      const updated = await db
        .update(skusTable)
        .set(updateData)
        .where(eq(skusTable.id, id))
        .returning();

      return commonRes(updated[0]);
    },
    {
      detail: {
        summary: "更新SKU",
        description: "根据ID更新SKU信息，支持部分更新",
        tags: ["SKU管理"],
      },
      params: t.Object({
        id: t.String(),
      }),
      body: SkuModel.Update, // 使用新的前端友好的 schema
    }
  )

  .get(
    "/",
    async ({ query, db }): Promise<CommonRes<PageData<SkuModel["Entity"]>>> => {
      const {
        page = 1,
        limit = 10,
        sort = "createdAt",
        sortOrder = "desc",
        search,
        status,
        productId,
      } = query;

      // 构建查询：选择字段（排除 imageId，改用关联图片对象）
      const baseQuery = db
        .select()
        .from(skusTable)
        .leftJoin(mediaTable, eq(skusTable.imageId, mediaTable.id))
        .$dynamic();

      // 构建 WHERE 条件
      const conditions = [];

      if (search) {
        // 搜索 skuCode 或 productId（productId 转为字符串模糊匹配）
        conditions.push(or(like(skusTable.skuCode, `%${search}%`)));
      }

      if (status !== undefined) {
        conditions.push(eq(skusTable.status, status));
      }

      if (productId !== undefined) {
        conditions.push(eq(skusTable.productId, productId));
      }

      if (conditions.length > 0) {
        baseQuery.where(and(...conditions));
      }

      // 排序字段白名单
      const allowedSortFields = {
        skuCode: skusTable.skuCode,
        price: skusTable.price,
        stock: skusTable.stock,
        createdAt: skusTable.createdAt,
        updatedAt: skusTable.updatedAt,
      };

      const orderBy =
        allowedSortFields[sort as keyof typeof allowedSortFields] ||
        skusTable.createdAt;
      const orderDirection = sortOrder;

      // 执行分页，并转换数据格式
      const result = await paginate(baseQuery, {
        page,
        limit,
        orderBy,
        orderDirection,
      });

      const transformedData = result.items.map((item) => {
        // 解构赋值获取 skus_table
        const { skus_table, media } = item;

        // 创建一个新的对象，展开 skus_table 的所有属性
        const transformedItem = {
          ...skus_table,
          imageId: media ? [media.id] : [], // 始终返回数组
          specJson:
            typeof skus_table.specJson === "object" &&
            skus_table.specJson !== null
              ? (skus_table.specJson as Record<string, string>)
              : {},
          extraAttributes:
            typeof skus_table.extraAttributes === "object" &&
            skus_table.extraAttributes !== null
              ? (skus_table.extraAttributes as Record<string, any>)
              : {},
        };

        return transformedItem;
      });

      return commonRes({
        items: transformedData,
        meta: buildPageMeta(result.total, page, limit),
      });
    },
    {
      detail: {
        summary: "获取SKU列表",
        description: "分页获取SKU列表，支持按商品筛选、搜索和排序",
        tags: ["SKU管理"],
      },
      query: SkuModel.ListQuery,
    }
  )

  .get(
    "/detail/:id",
    async ({ params: { id }, db }) => {
      const res = await db
        .select()
        .from(skusTable)
        .leftJoin(mediaTable, eq(skusTable.imageId, mediaTable.id))
        .where(eq(skusTable.id, id));

      if (!res[0]) {
        throw new HttpError.NotFound("SKU不存在");
      }

      const sku = res[0].skus_table;

      // 手动转换，避免 Zod 验证错误
      const transformed = {
        ...sku,
        imageId: sku.imageId ? [sku.imageId] : [], // 始终返回数组
        // 将 decimal 字段转换为字符串
        marketPrice: sku.marketPrice?.toString() || undefined,
        costPrice: sku.costPrice?.toString() || undefined,
        weight: sku.weight?.toString() || undefined,
        volume: sku.volume?.toString() || undefined,
        specJson: sku.specJson ? (sku.specJson as Record<string, string>) : {}, // 确保不为 undefined
        extraAttributes: sku.extraAttributes
          ? (sku.extraAttributes as Record<string, any>)
          : {}, // 处理 extraAttributes
      };

      return commonRes(transformed);
    },
    {
      detail: {
        summary: "获取SKU详情",
        description: "根据ID获取SKU详情",
        tags: ["SKU管理"],
      },
      params: t.Object({
        id: t.String(),
      }),
    }
  )

  // 获取指定商品的所有SKU
  .get(
    "/product/:productId",
    async ({ params: { productId }, query, db }) => {
      const { status } = query;

      const baseQuery = db
        .select({
          id: skusTable.id,
          skuCode: skusTable.skuCode,
          price: skusTable.price,
          stock: skusTable.stock,
          status: skusTable.status,
          specJson: skusTable.specJson,
          extraAttributes: skusTable.extraAttributes,
          imageId: skusTable.imageId,
          createdAt: skusTable.createdAt,
        })
        .from(skusTable)
        .leftJoin(mediaTable, eq(skusTable.imageId, mediaTable.id))
        .where(eq(skusTable.productId, productId))
        .$dynamic();

      if (status !== undefined) {
        baseQuery.where(eq(skusTable.status, status));
      }

      const skus = await baseQuery;

      const transformedSkus = skus.map((sku) => {
        return {
          ...sku,
          imageId: sku.imageId ? [sku.imageId] : [], // 始终返回数组
          specJson: sku.specJson
            ? (sku.specJson as Record<string, string>)
            : {}, // 确保不为 undefined
          extraAttributes: sku.extraAttributes
            ? (sku.extraAttributes as Record<string, any>)
            : {}, // 处理 extraAttributes
        };
      });

      return commonRes(transformedSkus);
    },
    {
      detail: {
        summary: "获取商品SKU列表",
        description: "获取指定商品的所有SKU",
        tags: ["SKU管理"],
      },
      params: z.object({
        productId: z.string(),
      }),
      query: z.object({
        status: z.optional(z.coerce.number()),
      }),
    }
  );
