import { eq, inArray } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { dbPlugin } from "@/server/db/connection";
import {
  attributeTable,
  attributeTemplateTable,
  attributeValueTable,
} from "@/server/db/schema";
import { type CommonRes, commonRes, type PageData } from "@/server/utils/Res";
import { buildPageMeta } from "@/server/utils/services";

/**
 * 产品模板管理接口
 * 整合属性模板、属性和属性值，返回前端需要的格式
 */
export const productTemplateRoute = new Elysia({
  name: "product-template",
  prefix: "/product/template",
})
  .use(dbPlugin)
  .get(
    "/",
    async ({ query, db }): Promise<CommonRes<PageData<any>>> => {
      const { page = 1, limit = 10 } = query;

      // 获取所有属性模板
      const templates = await db.query.attributeTemplateTable.findMany({
        with: {
          category: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      });

      // 为每个模板获取属性和属性值
      const templatesWithFields = await Promise.all(
        templates.map(async (template) => {
          // 获取模板下的所有属性
          const attributes = await db.query.attributeTable.findMany({
            where: eq(attributeTable.templateId, template.id),
            orderBy: (attribute, { asc }) => [asc(attribute.sortOrder)],
          });

          // 获取每个属性的值（如果是select类型）
          const attributesWithValues = await Promise.all(
            attributes.map(async (attr) => {
              let values: any[] = [];
              if (attr.inputType === "select") {
                values = await db.query.attributeValueTable.findMany({
                  where: eq(attributeValueTable.attributeId, attr.id),
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
            id: template.id,
            name: template.name,
            description: `${template.category?.name || ""}分类模板`,
            categoryId: template.categoryId,
            categoryName: template.category?.name || "",
            fields: attributesWithValues,
            createdAt: template.createdAt,
          };
        })
      );

      // 分页处理
      const total = templatesWithFields.length;
      const startIndex = (page - 1) * limit;
      const items = templatesWithFields.slice(startIndex, startIndex + limit);

      return commonRes({
        items,
        meta: buildPageMeta(total, page, limit),
      });
    },
    {
      detail: {
        summary: "获取产品模板列表",
        description: "获取产品模板列表，包含模板下的所有字段定义",
        tags: ["产品模板管理"],
      },
      query: t.Object({
        page: t.Optional(t.Number()),
        limit: t.Optional(t.Number()),
      }),
    }
  )
  .post(
    "/",
    async ({ body, db }) => {
      const { name, description, categoryId, fields } = body;

      // 创建属性模板
      const [template] = await db
        .insert(attributeTemplateTable)
        .values({
          name,
          categoryId,
        })
        .returning();

      // 创建属性
      for (const field of fields) {
        const [attribute] = await db
          .insert(attributeTable)
          .values({
            templateId: template.id,
            name: field.name,
            code: field.code,
            inputType: (field.type === 'multiselect' || field.type === 'richtext') ? 'text' : field.type,
            isRequired: true,
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

      return commonRes({ id: template.id }, 201);
    },
    {
      detail: {
        summary: "创建产品模板",
        description: "创建新的产品模板，包含多个字段定义",
        tags: ["产品模板管理"],
      },
      body: t.Object({
        name: t.String({ minLength: 1 }),
        description: t.Optional(t.String()),
        categoryId: t.String(),
        fields: t.Array(
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
        ),
      }),
    }
  )
  .put(
    "/update/:id",
    async ({ params: { id }, body, db }) => {
      const { name, description, categoryId, fields } = body;

      // 更新模板基本信息
      const [template] = await db
        .update(attributeTemplateTable)
        .set({
          name,
          categoryId,
        })
        .where(eq(attributeTemplateTable.id, id))
        .returning();

      if (!template) {
        throw new HttpError.NotFound("模板不存在");
      }

      // 获取现有属性
      const existingAttributes = await db.query.attributeTable.findMany({
        where: eq(attributeTable.templateId, id),
      });

      // 删除不再需要的属性和其值
      const fieldIds = fields.map((f) => f.id).filter(Boolean);
      const attributesToDelete = existingAttributes.filter(
        (attr) => !fieldIds.includes(attr.id)
      );

      if (attributesToDelete.length > 0) {
        const attributeIdsToDelete = attributesToDelete.map((attr) => attr.id);

        // 删除属性值
        await db
          .delete(attributeValueTable)
          .where(
            inArray(attributeValueTable.attributeId, attributeIdsToDelete)
          );

        // 删除属性
        await db
          .delete(attributeTable)
          .where(inArray(attributeTable.id, attributeIdsToDelete));
      }

      // 更新或创建属性
      for (const field of fields) {
        if (field.id) {
          // 更新现有属性
          await db
            .update(attributeTable)
            .set({
              name: field.name,
              code: field.code,
              inputType: field.type as any,
              isRequired: true,
              isSaleAttr: field.isSkuSpec,
              sortOrder: field.sortOrder || 0,
            })
            .where(eq(attributeTable.id, field.id));

          // 如果是select类型，更新选项值
          if (field.type === "select" && field.options) {
            // 删除旧的选项值
            await db
              .delete(attributeValueTable)
              .where(eq(attributeValueTable.attributeId, field.id));

            // 创建新的选项值
            await db.insert(attributeValueTable).values(
              field.options.map((option, index) => ({
                attributeId: field.id!,
                value: option,
                valueCode: option.toLowerCase().replace(/\s+/g, "_"),
                sortOrder: index,
              }))
            );
          }
        } else {
          // 创建新属性
          const [attribute] = await db
            .insert(attributeTable)
            .values({
              templateId: id,
              name: field.name,
              code: field.code,
              inputType: field.type as any,
              isRequired: true,
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

      return commonRes({ id: template.id });
    },
    {
      detail: {
        summary: "更新产品模板",
        description: "更新产品模板及其字段定义",
        tags: ["产品模板管理"],
      },
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        name: t.String({ minLength: 1 }),
        description: t.Optional(t.String()),
        categoryId: t.String(),
        fields: t.Array(
          t.Object({
            id: t.Optional(t.String()),
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
        ),
      }),
    }
  )
  .delete(
    "/",
    async ({ body: { ids }, db }) => {
      // 获取要删除的模板下的所有属性
      const attributes = await db.query.attributeTable.findMany({
        where: inArray(attributeTable.templateId, ids),
      });

      if (attributes.length > 0) {
        const attributeIds = attributes.map((attr) => attr.id);

        // 删除属性值
        await db
          .delete(attributeValueTable)
          .where(inArray(attributeValueTable.attributeId, attributeIds));

        // 删除属性
        await db
          .delete(attributeTable)
          .where(inArray(attributeTable.id, attributeIds));
      }

      // 删除模板
      const res = await db
        .delete(attributeTemplateTable)
        .where(inArray(attributeTemplateTable.id, ids))
        .returning();

      if (!res.length) {
        throw new HttpError.NotFound("未找到要删除的模板");
      }

      return commonRes("删除成功", 204);
    },
    {
      detail: {
        summary: "批量删除产品模板",
        description: "根据ID列表批量删除产品模板，会同时删除关联的属性和属性值",
        tags: ["产品模板管理"],
      },
      body: t.Object({
        ids: t.Array(t.String()),
      }),
    }
  )
  .get(
    "/detail/:id",
    async ({ params: { id }, db }) => {
      // 获取模板详情
      const template = await db.query.attributeTemplateTable.findFirst({
        where: eq(attributeTemplateTable.id, id),
        with: {
          category: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!template) {
        throw new HttpError.NotFound("模板不存在");
      }

      // 获取模板下的所有属性
      const attributes = await db.query.attributeTable.findMany({
        where: eq(attributeTable.templateId, id),
        orderBy: (attribute, { asc }) => [asc(attribute.sortOrder)],
      });

      // 获取每个属性的值
      const attributesWithValues = await Promise.all(
        attributes.map(async (attr) => {
          let values: any[] = [];
          if (attr.inputType === "select") {
            values = await db.query.attributeValueTable.findMany({
              where: eq(attributeValueTable.attributeId, attr.id),
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

      return commonRes({
        id: template.id,
        name: template.name,
        description: `${template.category?.name || ""}分类模板`,
        categoryId: template.categoryId,
        categoryName: template.category?.name || "",
        fields: attributesWithValues,
        createdAt: template.createdAt,
      });
    },
    {
      detail: {
        summary: "获取产品模板详情",
        description: "根据ID获取产品模板详情，包含所有字段定义",
        tags: ["产品模板管理"],
      },
      params: t.Object({
        id: t.String(),
      }),
    }
  );
