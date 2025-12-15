// scripts/generate-file-meta.ts（生成文件元数据）
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 生成文件元数据：路径+核心内容摘要（如表名、外键、关联）
export const generateFileMeta = async (rootDir: string) => {
  const meta = [];
  const files = await fs.readdir(rootDir, { recursive: true });

  for (const file of files) {
    if (!(file.endsWith(".ts") && file.includes("table"))) continue;

    const fullPath = path.join(rootDir, file);
    const content = await fs.readFile(fullPath, "utf-8");

    // 提取核心信息（给筛选AI的摘要）
    const tableName = content.match(/pgTable\('([^']+)'/)?.[1] || "";
    const foreignKeys =
      content.match(/references\(\(\) => (\w+)\.(\w+)\)/g) || [];
    const entity = file.split("/").at(-2) || ""; // 提取模块名（如user/）

    meta.push({
      path: fullPath,
      entity, // 模块名
      tableName, // 表名
      foreignKeys: foreignKeys.map((fk) =>
        fk.replace(/references\(\(\) => /, "").replace(/\)/, "")
      ), // 外键关联
      contentPreview: content.slice(0, 500), // 内容预览（前500字符）
    });
  }

  await fs.writeFile(
    path.join(__dirname, ".data/file-meta.json"),
    JSON.stringify(meta, null, 2)
  );
  return meta;
};
