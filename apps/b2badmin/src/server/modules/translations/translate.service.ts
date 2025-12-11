import type { CategoryModel } from "@repo/contract";
import type { SupportedLocale } from "@/server/plugins/locale";
import { DictManagerService } from "./dict-manager.service";
import { AliyunTranslateProvider } from "./providers/aliyun.provider";
import { LRUCache } from "./providers/cache.provider";
import { DictionaryTranslationProvider } from "./providers/dictionary.provider";

// 主翻译服务
export class TranslateService {
  private readonly aliyunService: AliyunTranslateProvider;
  private readonly cache: LRUCache<string>;
  private readonly dictManager: DictManagerService;
  private readonly databaseProvider: DictionaryTranslationProvider; // 不初始化

  constructor(
    databaseProvider: DictionaryTranslationProvider,
    aliyunService?: AliyunTranslateProvider,
    cache?: LRUCache<string>,
    dictManager?: DictManagerService
  ) {
    this.databaseProvider = databaseProvider;
    this.aliyunService = aliyunService ?? new AliyunTranslateProvider();
    this.cache = cache ?? new LRUCache(500);
    this.dictManager = dictManager ?? new DictManagerService();

    if (process.env.NODE_ENV === "development") {
      console.log("开发环境：清理翻译缓存以确保使用最新的翻译结果");
      this.clearCache();
    }
  }
  // 静态工厂方法：异步创建实例
  static async create(): Promise<TranslateService> {
    const databaseProvider = await DictionaryTranslationProvider.create();
    return new TranslateService(databaseProvider);
  }
  // 翻译统计
  private readonly stats = {
    databaseHits: 0,
    cacheHits: 0,
    aliyunCalls: 0,
    totalTranslations: 0,
    autoSavedToDict: 0, // 自动保存到字典的数量
  };
  /**
   * 核心翻译方法：统一走 缓存 → DB → API 流程
   */
  async translate(text: string, from = "zh-CN", to = "en-US"): Promise<string> {
    if (!text?.trim()) return "";
    this.stats.totalTranslations += 1;
    const cacheKey = `${from}-${to}-${text}`;

    // 1. 查 LRU 缓存（带 TTL）
    const cached = this.cache.get(cacheKey);
    if (cached !== null) {
      console.log(`[缓存命中] ${text} -> ${cached}`);
      return cached;
    }

    // 2. 查数据库字典（按 key = text 查询）
    const dbResult = await this.databaseProvider.findTranslationByKey(text, to);
    if (dbResult !== null) {
      console.log(`[DB字典命中] ${text} -> ${dbResult}`);
      this.cache.set(cacheKey, dbResult);
      return dbResult; // 即使是 ""，也认为是有效翻译
    }

    // 3. 调用阿里云（或通义千问）
    console.log(`[调用AI翻译] ${text}`);
    let translated: string;
    try {
      translated = await this.aliyunService.translate(text, from, to);
    } catch (error) {
      console.error(`AI翻译失败，使用原文: ${text}`, error);
      translated = text; // 或者 throw，根据业务容忍度
    }
    // 4. 保存到缓存
    this.cache.set(cacheKey, translated);

    // 5. 异步保存到数据库字典（智能学习）

    if (translated !== text && dbResult === null) {
      this.saveTranslationToDict(text, from, to, translated);
    }

    return translated;
  }

  async batchTranslate(
    texts: string[],
    from = "zh-CN",
    to = "en-US"
  ): Promise<string[]> {
    const results: string[] = [];

    for (const text of texts) {
      const translated = await this.translate(text, from, to);
      results.push(translated);
    }

    return results;
  }

  // 获取翻译统计
  getStats() {
    const hitRate =
      this.stats.totalTranslations > 0
        ? (
            ((this.stats.cacheHits + this.stats.databaseHits) /
              this.stats.totalTranslations) *
            100
          ).toFixed(2)
        : "0";

    return {
      ...this.stats,
      cacheHitRate: `${hitRate}%`,
      cacheSize: this.cache.size(),
    };
  }

  /**
   * 智能学习：将翻译结果保存到数据库字典
   * @param originalText 原文
   * @param fromLang 源语言
   * @param toLang 目标语言
   * @param translatedText 翻译结果
   */
  private saveTranslationToDict(
    originalText: string,
    fromLang: string,
    toLang: string,
    translatedText: string
  ) {
    try {
      // 生成合适的键名
      const key = this.dictManager.generateTranslationKey(
        originalText,
        "auto_learned"
      );

      // 异步保存到数据库，不阻塞翻译流程
      setImmediate(async () => {
        try {
          await this.dictManager.saveTranslation(
            key,
            fromLang,
            toLang,
            originalText,
            translatedText,
            "auto_learned"
          );

          this.stats.autoSavedToDict += 1;
          console.log(
            `🧠 智能学习: 自动保存翻译到字典 [${key}] ${originalText} -> ${translatedText}`
          );
        } catch (error) {
          console.warn("智能学习保存失败:", error);
        }
      });
    } catch (error) {
      console.warn("智能学习处理失败:", error);
    }
  }

  /**
   * 批量智能学习：将多个翻译结果保存到数据库字典
   */
  async batchSaveToDict(
    translations: Array<{
      originalText: string;
      fromLang: string;
      toLang: string;
      translatedText: string;
    }>
  ): Promise<void> {
    const dictTranslations = translations.map((t) => ({
      key: this.dictManager.generateTranslationKey(
        t.originalText,
        "auto_learned"
      ),
      fromLang: t.fromLang,
      toLang: t.toLang,
      originalText: t.originalText,
      translatedText: t.translatedText,
      category: "auto_learned" as const,
    }));

    try {
      await this.dictManager.batchSaveTranslations(dictTranslations);
      this.stats.autoSavedToDict += dictTranslations.length;
      console.log(
        `🧠 批量智能学习: 自动保存 ${dictTranslations.length} 条翻译到字典`
      );
    } catch (error) {
      console.error("批量智能学习保存失败:", error);
    }
  }

  // 清除缓存
  clearCache(): void {
    this.cache.clear();
  }

  // 清除特定文本的缓存
  clearCacheForText(text: string, from = "zh-CN", to = "en-US"): void {
    const cacheKey = `${from}-${to}-${text}`;
    this.cache.delete(cacheKey);
  }

  // 预热常用翻译
  async warmupCache(
    texts: string[],
    from = "zh-CN",
    to = "en-US"
  ): Promise<void> {
    console.log(`开始预热缓存: ${texts.length} 条`);

    for (const text of texts) {
      try {
        await this.translate(text, from, to);
      } catch (error) {
        console.error(`预热失败: ${text}`, error);
      }
    }

    console.log("缓存预热完成");
  }

  /**
   * 翻译商品字段的通用方法
   */

  async translateProductFields(
    name: string | null,
    description: string | null,
    shortDescription: string | null,
    locale: SupportedLocale
  ): Promise<{
    translatedName: string;
    translatedDescription: string | null;
    translatedShortDescription: string | null;
  }> {
    // 如果是中文环境，直接返回原文
    if (locale !== "en-US") {
      console.log("翻译中文环境");
      return {
        translatedName: name || "",
        translatedDescription: description,
        translatedShortDescription: shortDescription,
      };
    }

    // 英文环境下进行翻译
    try {
      const [
        translatedName,
        translatedDescription,
        translatedShortDescription,
      ] = await Promise.all([
        name ? this.translate(name, "zh-CN", "en-US") : Promise.resolve(""),
        description
          ? this.translate(description, "zh-CN", "en-US")
          : Promise.resolve(""),
        shortDescription
          ? this.translate(shortDescription, "zh-CN", "en-US")
          : Promise.resolve(""),
      ]);

      return {
        translatedName,
        translatedDescription,
        translatedShortDescription,
      };
    } catch (error) {
      console.error("翻译商品字段失败:", error);
      // 翻译失败时使用原文
      return {
        translatedName: name || "",
        translatedDescription: description,
        translatedShortDescription: shortDescription,
      };
    }
  }

  /**
   * 翻译 Product2 商品字段的方法
   */
  async translateProduct2Fields(
    name: string | null,
    description: string | null,
    locale: SupportedLocale
  ): Promise<{
    translatedName: string;
    translatedDescription: string | null;
  }> {
    // 如果是中文环境，直接返回原文
    if (locale !== "en-US") {
      return {
        translatedName: name || "",
        translatedDescription: description,
      };
    }

    // 英文环境下进行翻译
    try {
      const [translatedName, translatedDescription] = await Promise.all([
        name ? this.translate(name, "zh-CN", "en-US") : Promise.resolve(""),
        description
          ? this.translate(description, "zh-CN", "en-US")
          : Promise.resolve(""),
      ]);

      return {
        translatedName,
        translatedDescription,
      };
    } catch (error) {
      console.error("翻译 Product2 字段失败:", error);
      // 翻译失败时使用原文
      return {
        translatedName: name || "",
        translatedDescription: description,
      };
    }
  }

  /**
   * 翻译 SKU2 销售属性的方法
   */
  async translateSku2Specs(
    specJson: Record<string, string>,
    locale: SupportedLocale
  ): Promise<Record<string, string>> {
    // 如果是中文环境，直接返回原文
    if (locale !== "en-US") {
      return specJson;
    }

    // 英文环境下进行翻译
    try {
      const translatedSpecs: Record<string, string> = {};

      // 翻译所有的规格值
      for (const [key, value] of Object.entries(specJson)) {
        if (value) {
          translatedSpecs[key] = await this.translate(value, "zh-CN", "en-US");
        } else {
          translatedSpecs[key] = value;
        }
      }

      return translatedSpecs;
    } catch (error) {
      console.error("翻译 SKU2 规格失败:", error);
      // 翻译失败时使用原文
      return specJson;
    }
  }

  async translateCategory(
    category: CategoryModel["Entity"],
    locale: SupportedLocale = "zh-CN"
  ) {
    // 中文环境直接返回原文
    if (locale === "zh-CN") {
      return {
        ...category,
        name: category.name || "未分类",
        description: category.description || "",
      };
    }

    // 非中文环境才翻译
    const [translatedName, translatedDesc] = await Promise.all([
      this.translate(category.name, "zh-CN", locale),
      this.translate(category.description, "zh-CN", locale),
    ]);

    return {
      ...category,
      name: translatedName,
      description: translatedDesc,
    };
  }

  /**
   * 根据 key 获取翻译（用于已知 key 的场景，如分类 name 字段本身就是 key）
   * 但注意：这个方法也应该走完整流程！
   */
  getTranslationByKey(
    translationKey: string | null,
    locale: SupportedLocale = "zh-CN"
  ) {
    if (!translationKey) return "";
    if (locale === "zh-CN") return translationKey; // 中文不翻译

    return this.translate(translationKey, "zh-CN", locale);
  }
}

// 导出翻译服务实例
export const translateService = await TranslateService.create();
