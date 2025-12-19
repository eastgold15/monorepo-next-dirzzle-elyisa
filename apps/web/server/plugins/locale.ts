import { Elysia } from "elysia";

// 支持的语言类型
export type SupportedLocale = "zh-CN" | "en-US";

// 默认语言
export const DEFAULT_LOCALE: SupportedLocale = "zh-CN";

// 语言检测中间件
export const localeMiddleware = new Elysia({ name: "locale" })
  .derive(({ headers }) => {
    // 从 Accept-Language 头部获取用户语言偏好
    const acceptLanguage =
      headers["accept-language"] || headers["Accept-Language"];

    // 解析语言偏好
    const getLocale = (): SupportedLocale => {
      if (!acceptLanguage) {
        return DEFAULT_LOCALE;
      }

      // 检查是否直接匹配支持的语言
      if (acceptLanguage.includes("en-US") || acceptLanguage.includes("en")) {
        return "en-US";
      }

      if (acceptLanguage.includes("zh-CN") || acceptLanguage.includes("zh")) {
        return "zh-CN";
      }

      // 解析 Accept-Language 头部
      const languages = acceptLanguage
        .split(",")
        .map((lang) => lang.trim().split(";")[0])
        .filter(Boolean);

      // 检查每个语言
      for (const lang of languages) {
        if (lang?.startsWith("en")) {
          return "en-US";
        }
        if (lang?.startsWith("zh")) {
          return "zh-CN";
        }
      }

      // 默认返回中文
      return DEFAULT_LOCALE;
    };

    const locale = getLocale();

    return {
      locale,
      isZhCN: locale === "zh-CN",
      isEnUS: locale === "en-US",
    };
  })
  .as("global");

// 根据语言获取对应内容的辅助函数

export const getContentByLocale = (
  content: Record<SupportedLocale, string> | string,
  locale: SupportedLocale
): string => {
  // 如果内容已经是字符串，直接返回
  if (typeof content === "string") {
    return content;
  }

  // 优先返回当前语言的内容
  if (content[locale]) {
    return content[locale];
  }

  // 回退到默认语言
  if (content[DEFAULT_LOCALE]) {
    return content[DEFAULT_LOCALE];
  }

  // 如果都没有，返回第一个可用值
  const firstValue = Object.values(content)[0];
  return firstValue || "";
};

// 创建多语言字段的辅助函数
export const createLocalizedField = (
  zhCN: string,
  enUS?: string
): Record<SupportedLocale, string> => {
  return {
    "zh-CN": zhCN,
    "en-US": enUS || zhCN, // 如果没有提供英文，使用中文作为默认
  };
};

// 数据库字段的类型定义
export type LocalizedField =
  | {
      "zh-CN": string;
      "en-US": string;
    }
  | string;
