// scripts/ai-cooperate.ts（协作入口）

import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateCode } from "./exec-ai";
import { filterContext } from "./filter-ai";
import { generateFileMeta } from "./generate-file-meta";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 示例需求：生成用户-个人资料的关联定义代码
const userPrompt =
  "为用户表和个人资料表定义Drizzle关联关系，支持查用户时连带查个人资料";

// 双AI协作主流程
const runCooperate = async () => {
  // 1. 预生成文件元数据（首次运行执行，后续可缓存）
  await generateFileMeta(path.join(__dirname, "../packages"));

  // 2. 筛选AI提取精准上下文
  const filteredContext = await filterContext(userPrompt);
  console.log(
    "✅ 筛选AI完成：提取到",
    filteredContext.files.length,
    "个相关文件"
  );

  // 3. 执行AI生成代码
  const code = await generateCode(filteredContext, userPrompt);
  console.log("✅ 执行AI生成代码：\n", code);
};

runCooperate().catch(console.error);
