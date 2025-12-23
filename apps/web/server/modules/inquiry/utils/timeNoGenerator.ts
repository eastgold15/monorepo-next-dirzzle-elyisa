import { dailyInquiryCounterTable } from "@repo/contract";
import { eq } from "drizzle-orm";
import { db } from "~/db/connection";

/**
 * 获取或创建每日询价计数
 * @returns 当天的询价序号（从1开始）
 */
export async function getDailyInquiryCount(): Promise<number> {
  const today = new Date().toISOString().split("T")[0]; // 格式: YYYY-MM-DD

  try {
    // 查询今天是否已有记录
    const [existing] = await db
      .select()
      .from(dailyInquiryCounterTable)
      .where(eq(dailyInquiryCounterTable.date, today))
      .limit(1);

    if (existing) {
      // 更新计数
      const [updated] = await db
        .update(dailyInquiryCounterTable)
        .set({
          count: existing.count + 1,
          lastResetAt: new Date(),
        })
        .where(eq(dailyInquiryCounterTable.id, existing.id))
        .returning({ count: dailyInquiryCounterTable.count });

      return updated.count;
    }
    // 创建新记录
    const [created] = await db
      .insert(dailyInquiryCounterTable)
      .values({
        date: today,
        count: 1,
        lastResetAt: new Date(),
      })
      .returning({ count: dailyInquiryCounterTable.count });

    return created.count;
  } catch (error) {
    console.error("获取每日询价计数失败:", error);
    // 如果出错，返回1作为默认值
    return 1;
  }
}

/**
 * 生成 timeno 字段
 * 格式: 年后两位 + 月日 + 当天序号（3位）
 * 例如: 251208001 表示 2025年12月8日第1单
 * @returns number 类型的 timeno
 */
export async function generateTimeNo(): Promise<number> {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // 后两位，如 25
  const month = (now.getMonth() + 1).toString().padStart(2, "0"); // 月份，如 12
  const day = now.getDate().toString().padStart(2, "0"); // 日期，如 08
  const dailyCount = await getDailyInquiryCount(); // 当天的询价序号

  // 组合成 timeno，格式: YYMMDDNNN
  const timeNoStr = `${year}${month}${day}${dailyCount.toString().padStart(3, "0")}`;

  return Number.parseInt(timeNoStr, 10);
}
