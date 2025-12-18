import {
  AttributeTemplateTModel,
  attributeTable,
  attributeTemplateTable,
  attributeValueTable,
} from "@repo/contract";
import { and, eq, inArray, like, or } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { dbPlugin } from "~/db/connection";

/**
 * 属性模板管理接口
 * 提供属性模板的增删改查功能
 */
export const templateRoute = new Elysia({
  name: "template",
  prefix: "/product/template",
  tags: ["属性模板管理"],
})
  .use(dbPlugin)
  .post(
    "/",
    async ({ body: { name, categoryId, fields }, db }) => {
      // 创建属性模板
      const [template] = await db
        .insert(attributeTemplateTable)
        .values({
          name,
          categoryId,
        })
        .returning();

      // 如果有字段，创建属性
      if (fields && fields.length > 0) {
        for (const field of fields) {
          const [attribute] = await db
            .insert(attributeTable)
            .values({
              templateId: template.id,
              name: field.name,
              code: field.code,
              inputType:
                field.type === "multiselect" || field.type === "richtext"
                  ? "text"
                  : field.type,
              isRequired: field.required ?? true,
              isSaleAttr: field.isSkuSpec,
              sortOrder: field.sortOrder || 0,
            })
            .returning();

          // 如果是select类型，创建选项值
          if (
            field.type === "select" &&
            field.options &&
            field.options.length > 0
          ) {
            await db.insert(attributeValueTable).values(
              field.options.map((option, index) => ({
                attributeId: attribute.id,
                value: option,
                valueCode: option.toLowerCase().replace(/\s+/g, "_"),
                sortOrder: index,
              }))
            );
          }
        }
      }

      return template;
    },
    {
      detail: {
        summary: "创建属性模板",
        description: "创建新的属性模板，可包含多个字段定义",
      },
      body: t.Object({
        name: t.String({ minLength: 1 }),
        categoryId: t.String(),
        fields: t.Optional(
          t.Array(
            t.Object({
              name: t.String({ minLength: 1 }),
              code: t.String({ minLength: 1 }),
              type: t.UnionEnum([
                "text",
                "number",
                "select",
                "multiselect",
                "richtext",
              ]),
              isSkuSpec: t.Boolean(),
              required: t.Optional(t.Boolean()),
              options: t.Optional(t.Array(t.String())),
              sortOrder: t.Optional(t.Integer()),
            })
          )
        ),
      }),
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
        categoryId,
      } = query;

      // 构建基础查询（动态查询）
      const baseQuery = db.select().from(attributeTemplateTable).$dynamic();

      // 构建搜索条件
      const conditions = [];
      if (search) {
        conditions.push(
          or(
            like(attributeTemplateTable.name, `%${search}%`),
            like(attributeTemplateTable.id, `%${search}%`)
          )
        );
      }

      if (categoryId) {
        conditions.push(eq(attributeTemplateTable.categoryId, categoryId));
      }

      if (conditions.length > 0) {
        baseQuery.where(and(...conditions));
      }

      // 排序字段白名单
      const allowedSortFields = {
        name: attributeTemplateTable.name,
        categoryId: attributeTemplateTable.categoryId,
        id: attributeTemplateTable.id,
        createdAt: attributeTemplateTable.createdAt,
      };

      const orderBy =
        allowedSortFields[sort as keyof typeof allowedSortFields] ||
        attributeTemplateTable.name;

      // 使用 paginate 工具
      const result = await baseQuery.limit(limit).orderBy(orderBy);

      // 为每个模板获取属性数量
      const itemsWithAttrCount = await Promise.all(
        result.map(async (template) => {
          const attributeCount = await db
            .select({ count: attributeTable.id })
            .from(attributeTable)
            .where(eq(attributeTable.templateId, template.id));
          return {
            ...template,
            attributeCount: attributeCount.length,
          };
        })
      );

      return itemsWithAttrCount;
    },
    {
      detail: {
        summary: "获取属性模板列表",
        description: "分页获取属性模板列表，支持搜索和排序",
      },
      query: AttributeTemplateTModel.ListQuery,
    }
  )
  .put(
    "/:id",
    async ({ params: { id }, body, db }) => {
      const { name, categoryId } = body;

      const res = await db
        .update(attributeTemplateTable)
        .set({
          name,
          categoryId,
        })
        .where(eq(attributeTemplateTable.id, id))
        .returning();

      if (!res.length) {
        throw new HttpError.NotFound("属性模板不存在或未更新");
      }

      return res[0];
    },
    {
      detail: {
        summary: "更新属性模板",
        description: "根据ID更新属性模板信息",
      },
      params: t.Object({
        id: t.String(),
      }),
      body: AttributeTemplateTModel.Patch,
    }
  )
  .delete(
    "/",
    ({ body: { ids }, db }) => {
      return db.transaction(async (tx) => {
        // 获取要删除的模板下的所有属性
        const attributes = await tx.query.attributeTable.findMany({
          where: {
            templateId: {
              in: ids,
            },
          },
        });

        if (attributes.length > 0) {
          const attributeIds = attributes.map((attr) => attr.id);

          // 删除属性值
          await tx
            .delete(attributeValueTable)
            .where(inArray(attributeValueTable.attributeId, attributeIds));

          // 删除属性
          await tx
            .delete(attributeTable)
            .where(inArray(attributeTable.id, attributeIds));
        }

        // 删除模板
        const res = await tx
          .delete(attributeTemplateTable)
          .where(inArray(attributeTemplateTable.id, ids))
          .returning();

        if (!res.length) {
          throw new HttpError.NotFound("未找到要删除的模板");
        }
      });
    },
    {
      detail: {
        summary: "批量删除属性模板",
        description: "根据ID列表批量删除属性模板，会同时删除关联的属性和属性值",
      },
      body: t.Object({
        ids: t.Array(t.String()),
      }),
    }
  )
  .get(
    "/detail/:id",
    async ({ params: { id }, db }) => {
      // 获取模板信息
      const [template] = await db
        .select()
        .from(attributeTemplateTable)
        .where(eq(attributeTemplateTable.id, id));

      if (!template) {
        throw new HttpError.NotFound("模板不存在");
      }

      // 获取模板下的所有属性
      const attributes = await db.query.attributeTable.findMany({
        where: {
          templateId: id,
        },
        orderBy: (attribute, { asc }) => [asc(attribute.sortOrder)],
      });

      // 获取每个属性的值（如果是select类型）
      const attributesWithValues = await Promise.all(
        attributes.map(async (attr) => {
          let values: any[] = [];
          if (attr.inputType === "select") {
            values = await db.query.attributeValueTable.findMany({
              where: {
                attributeId: attr.id,
              },
              orderBy: (value, { asc }) => [asc(value.sortOrder)],
            });
          }

          return {
            id: attr.id,
            name: attr.name,
            code: attr.code,
            type: attr.inputType,
            isSkuSpec: attr.isSaleAttr,
            isRequired: attr.isRequired,
            options: values.map((v) => v.value),
            sortOrder: attr.sortOrder,
          };
        })
      );

      return {
        ...template,
        fields: attributesWithValues,
      };
    },
    {
      detail: {
        summary: "获取模板详情",
        description: "根据ID获取模板详情，包含所有字段定义",
      },
      params: t.Object({
        id: t.String(),
      }),
    }
  );
