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
} from "@repo/contract";
import { eq, inArray, like } from "drizzle-orm";
import { ProductTemplateGeneratedService } from "../_generated/producttemplate.service";
import type { ServiceContext } from "../_lib/base-service";

export class ProductTemplateService extends ProductTemplateGeneratedService {
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
}
