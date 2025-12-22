/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */

import {
  AttributeTemplateContract,
  attributeTable,
  attributeTemplateTable,
  masterTable,
  ProductTemplateContract,
} from "@repo/contract";
import { and, count, eq, inArray, like } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";
import {
  attributeTemplateService,
  productTemplateService,
} from "../../modules/index";

export const attributetemplateController = new Elysia({
  prefix: "/attributetemplate",
})
  .use(dbPlugin)
  .use(authGuardMid)
  .get(
    "/:id",
    async ({ params, db }) => {
      const [template] = await db
        .select()
        .from(attributeTemplateTable)
        .where(eq(attributeTemplateTable.id, params.id))
        .limit(1);

      if (!template) {
        throw new HttpError.NotFound("模板不存在");
      }

      // 获取模板的属性列表
      const attributes = await db
        .select()
        .from(attributeTable)
        .where(eq(attributeTable.templateId, params.id));

      return {
        ...template,
        attributes,
      };
    },
    {
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "获取单个模板",
        description: "根据ID获取属性模板详情及其属性列表",
        tags: ["Templates"],
      },
    }
  )
  .delete(
    "/:id",
    ({ params, auth, db }) =>
      attributeTemplateService.delete(params.id, { db, auth }),
    {
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "删除模板",
        description: "删除指定的属性模板",
        tags: ["Templates"],
      },
    }
  )
  // 获取所有可用的模板
  .get(
    "/",
    async ({ query, db, auth }) =>
      await productTemplateService.getTemplates({ db, auth }, query.search),
    {
      query: ProductTemplateContract.ListQuery,
      detail: {
        summary: "获取所有可用模板",
        description: "获取系统中所有可用的属性模板列表（全局公用）",
        tags: ["Products"],
      },
    }
  )
  // 获取模板列表
  .get(
    "/list",
    async ({ query, db }) => {
      const { page = 1, limit = 20, search, categoryId } = query;

      const conditions = [];

      if (search) {
        conditions.push(like(attributeTemplateTable.name, `%${search}%`));
      }

      if (categoryId) {
        conditions.push(eq(attributeTemplateTable.categoryId, categoryId));
      }

      let queryBuilder = db.select().from(attributeTemplateTable).$dynamic();

      if (conditions.length > 0) {
        queryBuilder = queryBuilder.where(and(...conditions));
      }

      const templates = await queryBuilder
        .limit(limit)
        .offset((page - 1) * limit);

      // 获取每个模板的属性数量
      const templateIds = templates.map((t) => t.id);
      const attributeCounts =
        templateIds.length > 0
          ? await db
              .select({
                templateId: attributeTable.templateId,
                count: count(attributeTable.id).as("count"),
              })
              .from(attributeTable)
              .where(inArray(attributeTable.templateId, templateIds))
              .groupBy(attributeTable.templateId)
          : [];

      const countMap = attributeCounts.reduce(
        (map, item) => {
          map[item.templateId] = item.count;
          return map;
        },
        {} as Record<string, number>
      );

      return templates.map((template) => ({
        ...template,
        attributeCount: countMap[template.id] || 0,
      }));
    },
    {
      query: AttributeTemplateContract.ListQuery,
      detail: {
        summary: "获取模板列表",
        description: "分页获取属性模板列表",
        tags: ["Templates"],
      },
    }
  )
  // 创建模板
  .post(
    "/",
    async ({ body, db }) => {
      const { name, categoryId } = body;

      // 验证分类是否存在
      if (categoryId) {
        const [category] = await db
          .select()
          .from(masterTable)
          .where(eq(masterTable.id, categoryId))
          .limit(1);

        if (!category) {
          throw new HttpError.NotFound("分类不存在");
        }
      }

      const [template] = await db
        .insert(attributeTemplateTable)
        .values({
          name,
          categoryId,
        })
        .returning();

      return template;
    },
    {
      body: AttributeTemplateContract.Create,
      detail: {
        summary: "创建模板",
        description: "创建新的属性模板",
        tags: ["Templates"],
      },
    }
  );
