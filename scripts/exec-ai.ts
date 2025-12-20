// scripts/exec-ai.ts（执行AI逻辑）

import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: "sk-51f8ebd2e0bf48cbbccd90789e095283",
});
// 执行AI：基于筛选后的上下文生成代码
export const generateCode = async (
  filteredContext: any,
  userPrompt: string
) => {
  // 1. 构造执行AI的Prompt（仅包含筛选后的上下文）
  const execPrompt = `
    你是Drizzle ORM专家，根据以下精准上下文，生成符合需求的代码。
    要求：
    1. 严格使用Drizzle的defineRelations定义关联；
    2. 代码可直接运行，无冗余注释；
    3. 遵循TypeScript类型规范。

    精准上下文（仅相关文件）：
    ${filteredContext.files.map((f: { path: any; content: any }) => `### ${f.path}\n${f.content}`).join("\n\n")}

    用户需求：${userPrompt}
  `.trim();

  // 2. 调用执行AI（GPT-4o，代码质量优先）
  const completion = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages: [{ role: "user", content: execPrompt }],
    temperature: 0.2,
  });

  return completion.choices[0].message.content?.trim() || "";
};
