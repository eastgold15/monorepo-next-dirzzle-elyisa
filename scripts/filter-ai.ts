// scripts/filter-ai.ts（筛选AI逻辑）

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: "sk-51f8ebd2e0bf48cbbccd90789e095283",
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 筛选AI：根据需求提取相关文件和代码片段
export const filterContext = async (userPrompt: string) => {
  // 1. 读取文件元数据
  const meta = JSON.parse(
    await fs.readFile(path.join(__dirname, ".data/file-meta.json"), "utf-8")
  );

  // 2. 构造筛选AI的Prompt
  const filterPrompt = `
    你的任务是：根据用户需求，从以下文件元数据中筛选「仅相关」的文件，并提取文件中「仅核心代码片段」。
    要求：
    1. 只保留和需求直接相关的文件（比如需求是「用户-个人资料关联」，只保留user模块的users.ts和profileInfo.ts）；
    2. 提取代码时，只保留表定义、外键、关联相关代码，过滤注释、导入语句、无关字段；
    3. 输出格式为JSON，包含files数组（path: 文件路径, content: 精简后的代码）。

    用户需求：${userPrompt}

    文件元数据：
    ${JSON.stringify(meta, null, 2)}
  `.trim();

  // 3. 调用筛选AI（GPT-3.5 Turbo，低成本）
  const completion = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages: [{ role: "user", content: filterPrompt }],
    response_format: { type: "json_object" }, // 强制输出JSON
    temperature: 0.1, // 低随机性，保证精准
  });

  // 4. 解析筛选结果
  const filteredContext = JSON.parse(
    completion.choices[0].message.content || '{"files":[]}'
  );
  return filteredContext;
};
