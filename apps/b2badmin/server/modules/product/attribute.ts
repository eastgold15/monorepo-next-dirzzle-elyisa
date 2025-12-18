import {
  AttributeTModel,
  attributeTable,
  attributeValueTable,
} from "@repo/contract";
import { and, eq, inArray, like, or } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { dbPlugin } from "~/db/connection";

/**
 * 属性管理接口
 * 提供属性的增删改查功能
 */
export const attributeRoute = new Elysia({
  name: "attribute",
  prefix: "/product/attribute",
  tags: ["属性管理"],
})
  .use(dbPlugin)
  .post(
    "/",
    async ({
      body: {
        templateId,
        name,
        code,
        inputType,
        isSaleAttr,
        isRequired,
        sortOrder,
      },
      db,
    }) => {
      const res = await db.insert(attributeTable).values({
        templateId,
        name,
        code,
        inputType,
        isSaleAttr,
        isRequired,
        sortOrder,
      });
      return res;
    },
    {
      detail: {
        summary: "创建属性",
        description: "创建新属性，支持多种输入类型",
      },
      body: AttributeTModel.Create,
    }
  )
  .get(
    "/",
    async ({ query, db }) => {
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
        sortOrder: attributeTable.sortOrder,
        createdAt: attributeTable.createdAt,
      };

      const orderBy =
        allowedSortFields[sort as keyof typeof allowedSortFields] ||
        attributeTable.name;
      const orderDirection = sortOrder === "desc" ? "desc" : "asc";

      // 分页
      const result = await baseQuery
        .limit(limit)
        .offset((page - 1) * limit)
        .orderBy(orderBy);

      // 获取每个属性的值
      const itemsWithValues = await Promise.all(
        result.map(async (attr) => {
          const values = await db.query.attributeValueTable.findMany({
            where: {
              attributeId: attr.id,
            },
            orderBy: {
              sortOrder: "asc",
            },
          });

          return {
            ...attr,
            values,
          };
        })
      );

      return itemsWithValues;
    },
    {
      detail: {
        summary: "获取属性列表",
        description: "分页获取属性列表，支持按模板筛选、搜索和排序",
      },
      query: AttributeTModel.ListQuery,
    }
  )
  .put(
    "/:id",
    async ({ params: { id }, body, db }) => {
      const res = await db
        .update(attributeTable)
        .set(body)
        .where(eq(attributeTable.id, id))
        .returning();

      if (!res.length) {
        throw new HttpError.NotFound("属性不存在或未更新");
      }

      return res[0];
    },
    {
      detail: {
        summary: "更新属性",
        description: "根据ID更新属性信息，支持部分更新",
      },
      params: t.Object({
        id: t.String(),
      }),
      body: AttributeTModel.Patch,
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
          throw new HttpError.NotFound("属性不存在");
        }
      });
    },
    {
      detail: {
        summary: "批量删除属性",
        description: "根据ID列表批量删除属性，会同时删除关联的属性值",
      },
      body: t.Object({
        ids: t.Array(t.String()),
      }),
    }
  )
  // 获取模板的销售属性及可选值路由
  .get(
    "/sale/list",
    async ({ query: { templateId }, db }) => {
      if (templateId === undefined) {
        throw new HttpError.BadRequest("templateId 是必需的");
      }
      // 1. 获取该模板下所有 isSaleAttr = true 的属性
      const saleAttributes = await db.query.attributeTable.findMany({
        where: {
          isSaleAttr: true,
          templateId,
        },
        columns: {
          id: true,
          code: true,
          name: true,
        },
      });

      if (saleAttributes.length === 0) {
        return [];
      }

      // 2. 获取这些属性的所有合法值
      const attributeIds = saleAttributes.map((attr) => attr.id);
      const values = await db.query.attributeValueTable.findMany({
        where: {
          attributeId: {
            in: attributeIds,
          },
        },
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

      return result;
    },
    {
      detail: {
        summary: "获取模板的销售属性及可选值",
        description:
          "用于 SKU 创建表单，返回 isSaleAttr=true 的属性及其所有 valueCode",
      },
      query: t.Object({
        templateId: t.String(),
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
        throw new HttpError.NotFound("属性不存在");
      }

      // 再查该属性的所有值
      const values = await db
        .select()
        .from(attributeValueTable)
        .where(eq(attributeValueTable.attributeId, id));

      return {
        ...attribute,
        values,
      };
    },
    {
      detail: {
        summary: "获取属性详情",
        description: "根据ID获取属性详情，包含该属性的所有可选值",
      },
      params: t.Object({
        id: t.String(),
      }),
    }
  );
