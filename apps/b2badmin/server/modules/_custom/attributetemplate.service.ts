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
import { eq, inArray } from "drizzle-orm";
import { HttpError } from "elysia-http-problem-json";
import { AttributeTemplateGeneratedService } from "../_generated/attributetemplate.service";
import type { ServiceContext } from "../_lib/base-service";

export class AttributeTemplateService extends AttributeTemplateGeneratedService {
  // attributeTemplate.service.ts
  /**
   * 1. 内部清理方法：删除模板关联的所有属性和属性值
   * 抽离出来供 delete 和 update 复用
   */
  private async clearTemplateRelations(templateId: string, tx: any) {
    // 找到该模板下的所有属性 ID
    const oldAttributes = await tx
      .select({ id: attributeTable.id })
      .from(attributeTable)
      .where(eq(attributeTable.templateId, templateId));

    const oldAttributeIds = oldAttributes.map((a: any) => a.id);

    if (oldAttributeIds.length > 0) {
      // a. 删除关联的所有属性值 (ValueTable)
      await tx
        .delete(attributeValueTable)
        .where(inArray(attributeValueTable.attributeId, oldAttributeIds));

      // b. 删除所有属性定义 (AttributeTable)
      await tx
        .delete(attributeTable)
        .where(eq(attributeTable.templateId, templateId));
    }
  }

  /**
   * 2. 删除接口：删除模板本身及其所有关联
   */
  async delete(templateId: string, ctx: ServiceContext) {
    return await ctx.db.transaction(async (tx) => {
      // 先清理关联数据
      await this.clearTemplateRelations(templateId, tx);

      // 再删除模板主体
      await tx
        .delete(attributeTemplateTable)
        .where(eq(attributeTemplateTable.id, templateId));

      return { success: true };
    });
  }

  /**
   * 3. 更新接口：复用清理逻辑 + 插入逻辑
   */
  async update2(templateId: string, body: any, ctx: ServiceContext) {
    const { name, masterCategoryId, siteCategoryId, fields } = body;

    return await ctx.db.transaction(async (tx) => {
      // a. 更新基础信息
      await tx
        .update(attributeTemplateTable)
        .set({
          name,
          masterCategoryId,
          // 将 "root" 或空值转为 null
          siteCategoryId:
            siteCategoryId && siteCategoryId !== "root" ? siteCategoryId : null,
        })
        .where(eq(attributeTemplateTable.id, templateId));

      // b. 清理旧的关联数据 (复用抽离的方法)
      await this.clearTemplateRelations(templateId, tx);

      // c. 插入新数据
      if (fields && fields.length > 0) {
        for (const field of fields) {
          const {
            inputType,
            isRequired,
            options,
            value,
            code,
            key,
            isSkuSpec,
          } = field;

          // 2.1 插入属性定义 (attributeTable)
          const [newAttribute] = await tx
            .insert(attributeTable)
            .values({
              templateId,
              key, // 这里的 key 是 UI 上的 Display Name
              code, // slugify 后的 API Code
              inputType,
              isRequired: !!isRequired,
              isSkuSpec: !!isSkuSpec,
            })
            .returning({ id: attributeTable.id });

          // 2.2 根据类型解析 value/options
          let valuesToInsert: string[] = [];

          if (inputType === "select" || inputType === "multiselect") {
            // 优先使用 options 数组（前端传递的格式）
            if (options && Array.isArray(options) && options.length > 0) {
              valuesToInsert = options.filter(Boolean);
            } else if (value && typeof value === "string") {
              // 兼容旧格式：逗号分隔的字符串
              valuesToInsert = value
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean);
            }
          } else if (
            (inputType === "text" || inputType === "number") &&
            value
          ) {
            // 文本/数字类型，value 是 placeholder 或默认值
            valuesToInsert = [String(value).trim()];
          }

          // 2.3 批量插入属性选项/预设值 (attributeValueTable)
          if (valuesToInsert.length > 0) {
            const valueData = valuesToInsert.map((v, index) => ({
              attributeId: newAttribute.id,
              value: v,
              sortOrder: index,
            }));
            await tx.insert(attributeValueTable).values(valueData);
          }
        }
      }
      return { success: true };
    });
  }

  async create(body: any, ctx: ServiceContext) {
    const { name, masterCategoryId, siteCategoryId, fields } = body;

    return await ctx.db.transaction(async (tx) => {
      // 1. 创建属性模板
      const [templateRes] = await tx
        .insert(attributeTemplateTable)
        .values({
          masterCategoryId,
          // 将 "root" 或空值转为 null
          siteCategoryId:
            siteCategoryId && siteCategoryId !== "root" ? siteCategoryId : null,
          name,
        })
        .returning({
          id: attributeTemplateTable.id,
          name: attributeTemplateTable.name,
          masterCategoryId: attributeTemplateTable.masterCategoryId,
          siteCategoryId: attributeTemplateTable.siteCategoryId,
        });

      if (!templateRes) {
        throw new HttpError.BadRequest("创建属性模板失败");
      }

      const templateId = templateRes.id;

      // 2. 处理字段列表
      if (fields && fields.length > 0) {
        for (const field of fields) {
          const {
            inputType,
            isRequired,
            options,
            value,
            code,
            key,
            isSkuSpec,
          } = field;

          // 2.1 插入属性定义 (attributeTable)
          const [newAttribute] = await tx
            .insert(attributeTable)
            .values({
              templateId,
              key, // 这里的 key 是 UI 上的 Display Name
              code, // slugify 后的 API Code
              inputType,
              isRequired: !!isRequired,
              isSkuSpec: !!isSkuSpec,
            })
            .returning({ id: attributeTable.id });

          // 2.2 根据类型解析 value/options
          let valuesToInsert: string[] = [];

          if (inputType === "select" || inputType === "multiselect") {
            // 优先使用 options 数组（前端传递的格式）
            if (options && Array.isArray(options) && options.length > 0) {
              valuesToInsert = options.filter(Boolean);
            } else if (value && typeof value === "string") {
              // 兼容旧格式：逗号分隔的字符串
              valuesToInsert = value
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean);
            }
          } else if (
            (inputType === "text" || inputType === "number") &&
            value
          ) {
            // 文本/数字类型，value 是 placeholder 或默认值
            valuesToInsert = [String(value).trim()];
          }

          // 2.3 批量插入属性选项/预设值 (attributeValueTable)
          if (valuesToInsert.length > 0) {
            const valueData = valuesToInsert.map((v, index) => ({
              attributeId: newAttribute.id,
              value: v,
              sortOrder: index,
            }));
            await tx.insert(attributeValueTable).values(valueData);
          }
        }
      }

      // 返回符合基类签名的数据结构
      return [templateRes];
    });
  }
}
