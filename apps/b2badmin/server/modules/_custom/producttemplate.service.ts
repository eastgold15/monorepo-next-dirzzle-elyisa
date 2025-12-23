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
import { asc, eq, inArray, like } from "drizzle-orm";
import { ProductTemplateGeneratedService } from "../_generated/producttemplate.service";
import type { ServiceContext } from "../_lib/base-service";

export class ProductTemplateService extends ProductTemplateGeneratedService {
  /**
   * 🛡️ 核心：获取所有可用的模板
   * 模板是全局公用的，不需要站点隔离
   */
  async getTemplates(ctx: ServiceContext, search?: string) {
    const rows = await ctx.db
      .select()
      .from(attributeTemplateTable)
      .leftJoin(
        attributeTable,
        eq(attributeTemplateTable.id, attributeTable.templateId)
      )
      .where(
        search ? like(attributeTemplateTable.name, `%${search}%`) : undefined
      );

    const templateMap = new Map();

    for (const row of rows) {
      const t = row.attribute_templates;
      const a = row.attributes_table;

      if (!templateMap.has(t.id)) {
        templateMap.set(t.id, {
          id: t.id,
          name: t.name,
          masterCategoryId: t.masterCategoryId,
          siteCategoryId: t.siteCategoryId,
          fields: [],
        });
      }

      if (a) {
        templateMap.get(t.id).fields.push({
          id: a.id,
          key: a.key,           // 前端使用 key
          code: a.code,
          inputType: a.inputType, // 前端使用 inputType
          isRequired: a.isRequired, // 前端使用 isRequired
          isSkuSpec: a.isSkuSpec,
          // 这里我们统一定义一个 value 字段
          value: "",
          options: [],
        });
      }
    }

    const allFieldIds = Array.from(templateMap.values()).flatMap((t) =>
      t.fields.map((f: any) => f.id)
    );

    if (allFieldIds.length > 0) {
      const allValues = await ctx.db
        .select()
        .from(attributeValueTable)
        .where(inArray(attributeValueTable.attributeId, allFieldIds))
        .orderBy(asc(attributeValueTable.sortOrder));

      const valuesByAttributeId = new Map<string, string[]>();
      for (const val of allValues) {
        if (!valuesByAttributeId.has(val.attributeId)) {
          valuesByAttributeId.set(val.attributeId, []);
        }
        valuesByAttributeId.get(val.attributeId)!.push(val.value);
      }

      for (const template of templateMap.values()) {
        for (const field of template.fields) {
          const rawValues = valuesByAttributeId.get(field.id) || [];

          // --- 核心逻辑：根据类型决定 value 的格式 ---
          if (field.inputType === "select" || field.inputType === "multiselect") {
            // 对于选择框，value 应该是逗号分隔的字符串，方便前端编辑器的 textarea 显示
            field.value = rawValues.join(", ");
            // 同时保留 options 数组，方便前端渲染下拉列表预览
            field.options = rawValues;
          } else {
            // 对于 text 或 number，value 就是那唯一的一个提示/默认值字符串
            field.value = rawValues[0] || "";
            field.options = [];
          }
        }
      }
    }

    return Array.from(templateMap.values());
  }
}
