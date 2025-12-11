import {
  AttributeModel,
  AttributeTemplateModel,
  AttributeValueModel,
} from "@repo/contract";
import { and, eq, inArray, like, or } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import z from "zod/v4";
import { dbPlugin } from "@/server/db/connection";
import {
  attributeTable,
  attributeTemplateTable,
  attributeValueTable,
} from "@/server/db/schema";
import { type CommonRes, commonRes, type PageData } from "@/server/utils/Res";
import { buildPageMeta, paginate } from "@/server/utils/services";

/**
 * 属性模板管理接口
 * 提供属性模板的增删改查功能
 */
export const templateRoute = new Elysia({
  name: "template",
  prefix: "/template",
})
  .use(dbPlugin)
  .post(
    "/",
    async ({ body: { name, categoryId }, db }) => {
      const res = await db.insert(attributeTemplateTable).values({
        name,
        categoryId,
      });
      return commonRes(res, 201);
    },
    {
      detail: {
        summary: "创建属性模板",
        description: "创建新的属性模板，用于组织和管理相关属性",
        tags: ["属性模板管理"],
      },
      body: AttributeTemplateModel.Create,
    }
  )
  .delete(
    "/",
    async ({ body: { ids }, db }) => {
      const res = await db
        .delete(attributeTemplateTable)
        .where(inArray(attributeTemplateTable.id, ids))
        .returning();
      if (!res.length) {
        throw new HttpError.InternalServerError("未找到该属性模板");
      }
      return commonRes("删除成功", 204);
    },
    {
      detail: {
        summary: "批量删除属性模板",
        description: "根据ID列表批量删除属性模板，会同时删除关联的属性和属性值",
        tags: ["属性模板管理"],
      },
      body: t.Object({
        ids: t.Array(t.String()),
      }),
    }
  )

  .put(
    "/:id",
    async ({ params: { id }, body, db }) => {
      const res = await db
        .update(attributeTemplateTable)
        .set(body)
        .where(eq(attributeTemplateTable.id, id))
        .returning();

      if (!res.length) {
        throw new HttpError.NotFound("未找到该属性模板");
      }
      return commonRes(res[0]);
    },
    {
      detail: {
        summary: "更新属性模板",
        description: "根据ID更新属性模板信息，支持部分更新",
        tags: ["属性模板管理"],
      },
      params: z.object({
        id: z.string(),
      }),
      body: AttributeTemplateModel.Update,
    }
  )
  .get(
    "/",
    async ({
      query,
      db,
    }): Promise<CommonRes<PageData<AttributeTemplateModel["Entity"]>>> => {
      const {
        page = 1,
        limit = 10,
        sort = "name",
        sortOrder = "asc",
        search,
      } = query;

      // 构建基础查询（动态查询）
      const baseQuery = db.select().from(attributeTemplateTable).$dynamic();

      // 构建搜索条件
      const conditions = [];
      if (search) {
        conditions.push(
          or(
            like(attributeTemplateTable.name, `%${search}%`),
            like(attributeTemplateTable.id, `%${search}%`) // 注意：id 是 number，like 会自动转字符串
          )
        );
      }

      if (conditions.length > 0) {
        baseQuery.where(and(...conditions));
      }

      // 排序字段白名单
      const allowedSortFields = {
        name: attributeTemplateTable.name,
        categoryId: attributeTemplateTable.categoryId,
        id: attributeTemplateTable.id,
      };

      const orderBy =
        allowedSortFields[sort as keyof typeof allowedSortFields] ||
        attributeTemplateTable.name;

      const orderDirection = sortOrder === "desc" ? "desc" : "asc";

      // 使用 paginate 工具
      const result = await paginate(baseQuery, {
        page,
        limit,
        orderBy,
        orderDirection,
      });
      return commonRes({
        items: result.items,
        meta: buildPageMeta(result.total, page, limit),
      });
    },
    {
      detail: {
        summary: "获取属性模板列表",
        description: "分页获取属性模板列表，支持搜索和排序",
        tags: ["属性模板管理"],
      },
      query: AttributeTemplateModel.ListQuery,
    }
  );

/**
 * 属性管理接口
 * 提供属性的增删改查功能
 */
export const attributeRoute = new Elysia({ name: "attr", prefix: "/attribute" })
  .use(dbPlugin)
  .post(
    "/",
    async ({ body: { templateId, name, code, inputType, isSaleAttr }, db }) => {
      const res = await db.insert(attributeTable).values({
        templateId,
        name,
        code,
        inputType,
        isSaleAttr,
      });
      return commonRes(res, 201);
    },
    {
      detail: {
        summary: "创建属性",
        description: "创建新属性，支持多种输入类型",
        tags: ["属性管理"],
      },
      body: AttributeModel.Create,
    }
  )
  .get(
    "/",
    async ({
      query,
      db,
    }): Promise<CommonRes<PageData<AttributeModel["Entity"]>>> => {
      const {
        page = 1,
        limit = 10,
        sort = "name",
        sortOrder = "asc",
        search,
        templateId,
      } = query;

      // 基础查询
      let baseQuery = db.select().from(attributeTable).$dynamic();

      // 条件过滤
      const conditions = [];

      if (search) {
        conditions.push(
          or(
            like(attributeTable.name, `%${search}%`),
            like(attributeTable.code, `%${search}%`)
          )
        );
      }

      if (templateId !== undefined) {
        conditions.push(eq(attributeTable.templateId, templateId));
      }

      if (conditions.length > 0) {
        baseQuery = baseQuery.where(and(...conditions));
      }

      // 排序白名单
      const allowedSortFields = {
        id: attributeTable.id,
        name: attributeTable.name,
        code: attributeTable.code,
        createdAt: attributeTable.createdAt,
      };

      const orderBy =
        allowedSortFields[sort as keyof typeof allowedSortFields] ||
        attributeTable.name;
      const orderDirection = sortOrder === "desc" ? "desc" : "asc";

      // 分页
      const result = await paginate(baseQuery, {
        page,
        limit,
        orderBy,
        orderDirection,
      });

      return commonRes({
        items: result.items,
        meta: buildPageMeta(result.total, page, limit),
      });
    },
    {
      detail: {
        summary: "获取属性列表",
        description: "分页获取属性列表，支持按模板筛选、搜索和排序",
        tags: ["属性管理"],
      },
      query: AttributeModel.ListQuery,
    }
  )
  .put(
    "/:id",
    async ({ params: { id }, body, db }) => {
      const { name, code, inputType, isSaleAttr } = body;

      const res = await db
        .update(attributeTable)
        .set({
          ...(name !== undefined && { name }),
          ...(code !== undefined && { code }),
          ...(inputType !== undefined && { inputType }),
          ...(isSaleAttr !== undefined && { isSaleAttr }),
        })
        .where(eq(attributeTable.id, id))
        .returning();

      if (!res.length) {
        throw new HttpError.InternalServerError("属性不存在或未更新");
      }

      return commonRes(res[0]);
    },
    {
      detail: {
        summary: "更新属性",
        description: "根据ID更新属性信息，支持部分更新",
        tags: ["属性管理"],
      },
      params: z.object({
        id: z.string(),
      }),
      body: AttributeModel.Create.omit({ templateId: true }).partial(),
    }
  )
  .delete(
    "/",
    ({ body: { ids }, db }) => {
      return db.transaction(async (tx) => {
        // 先删 attributeValues
        await tx
          .delete(attributeValueTable)
          .where(inArray(attributeValueTable.attributeId, ids));

        // 再删 attribute
        const res = await tx
          .delete(attributeTable)
          .where(inArray(attributeTable.id, ids))
          .returning();

        if (!res.length) {
          throw new HttpError.InternalServerError("属性不存在");
        }
        return commonRes("删除成功", 204);
      });
    },
    {
      detail: {
        summary: "批量删除属性",
        description: "根据ID列表批量删除属性，会同时删除关联的属性值",
        tags: ["属性管理"],
      },
      body: t.Object({
        ids: t.Array(t.String()),
      }),
    }
  )
  // 获取模板的销售属性及可选值路由 - 必须放在 /:id 之前
  .get(
    "/kv/list",
    async ({ query: { templateId }, db }) => {
      if (templateId === undefined) {
        throw new HttpError.InternalServerError("templateId 是必需的");
      }
      // 1. 获取该模板下所有 isSaleAttr = true 的属性
      const saleAttributes = await db.query.attributeTable.findMany({
        where: and(
          eq(attributeTable.templateId, templateId),
          eq(attributeTable.isSaleAttr, true)
        ),
        columns: {
          id: true,
          code: true,
          name: true,
        },
      });

      if (saleAttributes.length === 0) {
        return commonRes([]);
      }

      // 2. 获取这些属性的所有合法值
      const attributeIds = saleAttributes.map((attr) => attr.id);
      const values = await db.query.attributeValueTable.findMany({
        where: inArray(attributeValueTable.attributeId, attributeIds),
        columns: {
          attributeId: true,
          valueCode: true,
          value: true,
        },
      });

      // 3. 构建映射：attributeId → values
      const attrIdToValues = new Map<
        string,
        { value: string; valueCode: string }[]
      >();
      for (const v of values) {
        if (!attrIdToValues.has(v.attributeId)) {
          attrIdToValues.set(v.attributeId, []);
        }
        attrIdToValues.get(v.attributeId)?.push({
          value: v.value,
          valueCode: v.valueCode,
        });
      }

      // 4. 组装最终结果
      const result = saleAttributes.map((attr) => ({
        id: attr.id,
        code: attr.code,
        name: attr.name,
        values: attrIdToValues.get(attr.id) || [],
      }));

      return commonRes(result);
    },
    {
      detail: {
        summary: "获取模板的销售属性及可选值",
        description:
          "用于 SKU 创建表单，返回 isSaleAttr=true 的属性及其所有 valueCode",
        tags: ["属性管理"],
      },
      query: z.object({
        templateId: z.string(),
      }),
    }
  )
  .get(
    "/detail/:id",
    async ({ params: { id }, db }) => {
      // 先查属性
      const [attribute] = await db
        .select()
        .from(attributeTable)
        .where(eq(attributeTable.id, id));

      if (!attribute) {
        throw new HttpError.InternalServerError("属性不存在");
      }

      // 再查该属性的所有值
      const values = await db
        .select()
        .from(attributeValueTable)
        .where(eq(attributeValueTable.attributeId, id));

      return commonRes({
        ...attribute,
        values,
      });
    },
    {
      detail: {
        summary: "获取属性详情",
        description: "根据ID获取属性详情，包含该属性的所有可选值",
        tags: ["属性管理"],
      },
      params: z.object({
        id: z.string(),
      }),
    }
  );

/**
 * 属性值管理接口
 * 提供属性值的增删改查功能
 */
export const attributeValueRoute = new Elysia({
  name: "attrvalue",
  prefix: "/value",
})
  .use(dbPlugin)
  .post(
    "/",
    async ({ body: { attributeId, value, valueCode, sortOrder }, db }) => {
      const res = await db.insert(attributeValueTable).values({
        attributeId,
        value,
        valueCode,
        sortOrder: sortOrder ?? 0, // 如果没有提供 sortOrder，使用默认值 0
      });

      return commonRes(res, 201);
    },
    {
      detail: {
        summary: "创建属性值",
        description: "为指定属性创建可选值",
        tags: ["属性值管理"],
      },
      body: AttributeValueModel.Create,
    }
  )
  .get(
    "/",
    async ({
      query,
      db,
    }): Promise<CommonRes<PageData<AttributeValueModel["Entity"]>>> => {
      const { page = 1, limit = 20, attributeId } = query;

      if (attributeId === undefined) {
        throw new HttpError.InternalServerError("attributeId 是必需的");
      }

      const baseQuery = db
        .select()
        .from(attributeValueTable)
        .where(eq(attributeValueTable.attributeId, attributeId))
        .$dynamic();

      const result = await paginate(baseQuery, {
        page,
        limit,
        orderBy: attributeValueTable.id,
        orderDirection: "asc",
      });

      return commonRes({
        items: result.items,
        meta: buildPageMeta(result.total, page, limit),
      });
    },
    {
      detail: {
        summary: "获取属性值列表",
        description: "根据 attributeId 获取该属性下的所有值（分页）",
        tags: ["属性值管理"],
      },
      query: AttributeValueModel.ListQuery,
    }
  )
  .put(
    "/:id",
    async ({ params: { id }, body, db }) => {
      const res = await db
        .update(attributeValueTable)
        .set(body)
        .where(eq(attributeValueTable.id, id))
        .returning();

      if (!res.length) {
        throw new HttpError.InternalServerError("属性值不存在或未更新");
      }

      return commonRes(res[0]);
    },
    {
      detail: {
        summary: "更新属性值",
        description: "根据ID更新属性值",
        tags: ["属性值管理"],
      },
      params: t.Object({
        id: t.String(),
      }),
      body: AttributeValueModel.Update,
    }
  )
  .delete(
    "/",
    async ({ body: { ids }, db }) => {
      const res = await db
        .delete(attributeValueTable)
        .where(inArray(attributeValueTable.id, ids))
        .returning();

      if (!res.length) {
        throw new HttpError.InternalServerError("未找到要删除的属性值");
      }
      return commonRes("删除成功", 204);
    },
    {
      detail: {
        summary: "批量删除属性值",
        description: "根据ID列表删除属性值",
        tags: ["属性值管理"],
      },
      body: t.Object({
        ids: t.Array(t.String()),
      }),
    }
  );

export const v2AttributeRoute = new Elysia({ name: "eeeee", prefix: "/v2" })
  .use(templateRoute)
  .use(attributeRoute)
  .use(attributeValueRoute);
