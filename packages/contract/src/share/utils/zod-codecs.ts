// utils/zod-codecs.ts
import { z } from "zod";

export const isoDatetimeToDate = z.codec(
  z.iso.datetime(), // 输入：必须是严格 ISO 8601 字符串
  z.date(), // 输出：Date 对象
  {
    decode: (isoString) => new Date(isoString), // 网络 → 内存
    encode: (date) => date.toISOString(), // 内存 → 网络
  }
);
