import { translationDictTable } from "@repo/contract";
import { eq } from "drizzle-orm";

import { db } from "~/db/connection";

/**
 * 翻译字典管理服务
 * 负责将翻译结果保存到数据库字典中
 */
export class DictManagerService {
  /**
   * 保存单个翻译项到数据库
   * @param key 翻译键名
   * @param fromLang 源语言
   * @param toLang 目标语言
   * @param originalText 原文
   * @param translatedText 翻译结果
   * @param category 分类（可选）
   */
  async saveTranslation(
    key: string,
    fromLang: string,
    toLang: string,
    originalText: string,
    translatedText: string,
    category = "auto_generated"
  ): Promise<void> {
    try {
      // 检查是否已存在该键的翻译
      const existing = await db
        .select()
        .from(translationDictTable)
        .where(eq(translationDictTable.key, key))
        .limit(1);

      const now = new Date();

      if (existing.length > 0) {
        // 更新现有翻译
        // 确保existing[0]?.translations是对象格式
        const existingTranslations =
          typeof existing[0]?.translations === "string"
            ? JSON.parse(existing[0]?.translations || "{}")
            : existing[0]?.translations || {};

        // 更新或添加目标语言的翻译
        const updatedTranslations = {
          ...existingTranslations,
          [toLang]: translatedText,
          [fromLang]: originalText, // 确保源语言也有原文
        };

        await db
          .update(translationDictTable)
          .set({
            translations: updatedTranslations,
            updatedAt: new Date(),
          })
          .where(eq(translationDictTable.key, key));

        console.log(`更新字典项: ${key} -> ${toLang}: ${translatedText}`);
      } else {
        // 创建新的翻译项
        const newTranslations = {
          [fromLang]: originalText,
          [toLang]: translatedText,
        };

        await db.insert(translationDictTable).values({
          key,
          category,
          description: `自动生成的翻译：${originalText}`,
          translations: newTranslations,
          isActive: true,
          sortOrder: 9999, // 自动生成的项目排序靠后
          createdAt: now,
          updatedAt: now,
        });

        console.log(`新增字典项: ${key} -> ${toLang}: ${translatedText}`);
      }
    } catch (error) {
      console.error("保存翻译到字典失败:", error);
    }
  }

  /**
   * 批量保存翻译项
   * @param translations 翻译项数组
   */
  async batchSaveTranslations(
    translations: Array<{
      key: string;
      fromLang: string;
      toLang: string;
      originalText: string;
      translatedText: string;
      category?: string;
    }>
  ): Promise<void> {
    for (const translation of translations) {
      await this.saveTranslation(
        translation.key,
        translation.fromLang,
        translation.toLang,
        translation.originalText,
        translation.translatedText,
        translation.category
      );
    }
  }

  /**
   * 生成翻译键名
   * @param text 原文
   * @param category 分类
   * @returns 生成的键名
   */
  generateTranslationKey(text: string, category = "auto"): string {
    // 清理文本，移除特殊字符，转换为适合作为键名的格式
    const cleanedText = text
      .trim()
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5\s-]/g, "") // 保留字母、数字、中文、空格、连字符
      .replace(/\s+/g, "_") // 空格替换为下划线
      .substring(0, 50); // 限制长度

    return `${category}.${cleanedText}`;
  }

  /**
   * 获取翻译统计信息
   */
  async getStats() {
    try {
      const total = await db.select().from(translationDictTable);
      const active = await db
        .select()
        .from(translationDictTable)
        .where(eq(translationDictTable.isActive, true));

      const categoryStats = await db
        .select({
          category: translationDictTable.category,
          count: translationDictTable.key,
        })
        .from(translationDictTable)
        .groupBy(translationDictTable.category);

      return {
        total: total.length,
        active: active.length,
        inactive: total.length - active.length,
        categories: categoryStats.map((stat) => ({
          category: stat.category,
          count: Number(stat.count),
        })),
      };
    } catch (error) {
      console.error("获取字典统计失败:", error);
      return null;
    }
  }
}
