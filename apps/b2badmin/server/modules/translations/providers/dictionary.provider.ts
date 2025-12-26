// providers/dictionary.provider.ts

import { translationDictTable } from "@repo/contract";
import { eq } from "drizzle-orm";
import { db } from "~/db/connection";

import type { TranslateProvider } from "../interfaces/translation-provider.interface";

export class DictionaryTranslationProvider implements TranslateProvider {
  readonly name = "DatabaseDictionary";

  private constructor() {}

  static create() {
    return new DictionaryTranslationProvider();
  }

  // 不再 loadTranslations 到内存！每次按 key 查询
  async findTranslationByKey(key: string, targetLang: string) {
    try {
      const [item] = await db
        .select()
        .from(translationDictTable)
        .where(eq(translationDictTable.key, key));

      if (!item?.isActive) {
        return null;
      }

      let translationsObj;
      try {
        translationsObj =
          typeof item.translations === "string"
            ? JSON.parse(item.translations)
            : item.translations;
      } catch (e) {
        console.error("解析翻译项失败:", e);
        return null;
      }

      return translationsObj[targetLang] ?? null;
    } catch (error) {
      console.error("查询数据库字典失败:", error);
      return null;
    }
  }

  // 实现接口方法（可选，实际不用）
  async translate(text: string, from: string, to: string): Promise<string> {
    const result = await this.findTranslationByKey(text, to);
    return result || text;
  }

  async batchTranslate(
    texts: string[],
    from: string,
    to: string
  ): Promise<string[]> {
    const results = await Promise.all(
      texts.map((text) => this.findTranslationByKey(text, to))
    );
    return results.map((res, i) => res ?? texts[i]);
  }
}
