import { AttributeValueTModel, attributeValueTable } from "@repo/contract";
import { eq, inArray } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { dbPlugin } from "~/db/connection";

/**
 * 属性值管理接口
 * 提供属性值的增删改查功能
 */
export const attributeValueRoute = new Elysia({
  name: "attribute-value",
  prefix: "/product/attribute-value",
  tags: ["属性值管理"],
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

      return res;
    },
    {
      detail: {
        summary: "创建属性值",
        description: "为指定属性创建可选值",
      },
      body: AttributeValueTModel.Create,
    }
  )
  .get(
    "/",
    async ({ query, db }) => {
      const {
        page = 1,
        limit = 20,
        attributeId,
        sort = "sortOrder",
        sortOrder = "asc",
      } = query;

      if (attributeId === undefined) {
        throw new HttpError.BadRequest("attributeId 是必需的");
      }

      const baseQuery = db
        .select()
        .from(attributeValueTable)
        .where(eq(attributeValueTable.attributeId, attributeId))
        .$dynamic();

      // 排序白名单
      const allowedSortFields = {
        id: attributeValueTable.id,
        value: attributeValueTable.value,
        sortOrder: attributeValueTable.sortOrder,
        createdAt: attributeValueTable.createdAt,
      };

      const orderBy =
        allowedSortFields[sort as keyof typeof allowedSortFields] ||
        attributeValueTable.sortOrder;

      const result = await baseQuery
        .limit(limit)
        .offset((page - 1) * limit)
        .orderBy(orderBy);

      return result;
    },
    {
      detail: {
        summary: "获取属性值列表",
        description: "根据 attributeId 获取该属性下的所有值（分页）",
      },
      query: AttributeValueTModel.ListQuery,
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
        throw new HttpError.NotFound("属性值不存在或未更新");
      }

      return res[0];
    },
    {
      detail: {
        summary: "更新属性值",
        description: "根据ID更新属性值",
      },
      params: t.Object({
        id: t.String(),
      }),
      body: AttributeValueTModel.Patch,
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
        throw new HttpError.NotFound("未找到要删除的属性值");
      }
    },
    {
      detail: {
        summary: "批量删除属性值",
        description: "根据ID列表删除属性值",
      },
      body: t.Object({
        ids: t.Array(t.String()),
      }),
    }
  );
