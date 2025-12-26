// This file is auto-generated, don't edit it
import alimt20181012, * as $alimt20181012 from "@alicloud/alimt20181012";
import * as $OpenApi from "@alicloud/openapi-client";
import { env } from "@/env";

import type { TranslateProvider } from "../interfaces/translation-provider.interface";
export class AliyunTranslateProvider implements TranslateProvider {
  readonly name = "aliyun";
  private readonly client: any = null;

  constructor() {
    const config = new $OpenApi.Config({});
    config.accessKeyId = env.ALIBABA_CLOUD_ACCESS_KEY_ID;
    config.accessKeySecret = env.ALIBABA_CLOUD_ACCESS_KEY_SECRET;
    config.regionId = "cn-hangzhou";
    config.endpoint = "mt.cn-hangzhou.aliyuncs.com";

    if (process.env.NODE_ENV === "development") {
      console.log("NODE_ENV:", process.env.NODE_ENV);
      this.client = new alimt20181012(config);
      return;
    }
    this.client = new (alimt20181012 as any).default(config);
  }

  async translate(text: string, from = "zh-CN", to = "en-US"): Promise<string> {
    if (!this.client) {
      return text;
    }

    try {
      // 创建翻译请求
      const translateGeneralRequest =
        new $alimt20181012.TranslateGeneralRequest({
          sourceLanguage: this.getLanguageCode(from),
          targetLanguage: this.getLanguageCode(to),
          sourceText: text,
          scene: "general", // 通用场景
          formatType: "text",
        });

      // 调用翻译API
      const resp = await this.client.translateGeneral(translateGeneralRequest);

      const translated = resp.body?.data?.translated;
      if (translated) {
        return translated;
      }
      console.warn("阿里云返回空翻译结果:", resp.body);
      return text;
    } catch (error: any) {
      console.error("阿里云翻译失败:", error.message || error);
      // 可选：打印诊断链接
      if (error.data?.Recommend) {
        console.error("诊断链接:", error.data.Recommend);
      }
      return text;
    }
  }

  async batchTranslate(
    texts: string[],
    from: string,
    to: string
  ): Promise<string[]> {
    // 阿里云 alimt 没有批量文本翻译接口，只能并发单条
    const results = await Promise.allSettled(
      texts.map((text) => this.translate(text, from, to))
    );

    return results.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value as string;
      }
      console.error("批量翻译失败项:", result.reason);
      return texts[index] as string;
    });
  }

  private getLanguageCode(code: string): string {
    const map: Record<string, string> = {
      "zh-CN": "zh",
      "en-US": "en",
      "en-GB": "en",
      "ja-JP": "ja",
      "ko-KR": "ko",
      zh: "zh",
      en: "en",
      ja: "ja",
      ko: "ko",
    };
    return map[code] || code;
  }
}
