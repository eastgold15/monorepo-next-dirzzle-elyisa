// scripts/gen-ai-docs.ts

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.resolve(__dirname, "../src");

// 这里的配置指向你的契约目录
const CONTRACT_DIR = path.resolve(
    __dirname,
    "../src/modules/generated"
);
const OUTPUT_FILE = path.resolve(OUTPUT_DIR, "AI_API_REFERENCE.md");

function generateAIDocs() {
    let markdown = "# 全栈 API 契约速查表 (AI 专用)\n\n";
    markdown +=
        "> 提示 AI：请在编写任何 API 请求或组件时参考此文档，确保字段与后端契约 100% 一致。\n\n";

    const files = fs.readdirSync(CONTRACT_DIR).filter((f) => f.endsWith(".ts"));

    files.forEach((file) => {
        const content = fs.readFileSync(path.join(CONTRACT_DIR, file), "utf-8");
        const moduleName = path.basename(file, ".ts").split(".")[0];

        markdown += `## 模块: ${moduleName.toUpperCase()}\n`;

        // 简单的正则表达式提取字段信息（实际可用 ts-morph 获得更精准的解析）
        const fields = content.match(/(\w+): t\.\w+/g);

        if (fields) {
            markdown += "### 可用字段与约束:\n```typescript\n";
            fields.forEach((field) => {
                markdown += `  ${field.replace("t.", "")}\n`;
            });
            markdown += "```\n\n";
        }

        // 提取操作类型
        if (content.includes("Create"))
            markdown += `- [ ] **POST** (Create${moduleName})\n`;
        if (content.includes("Update"))
            markdown += `- [ ] **PATCH** (Update${moduleName})\n`;
        if (content.includes("ListQuery"))
            markdown += `- [ ] **GET** (List${moduleName})\n`;

        markdown += "\n---\n";
    });

    fs.writeFileSync(OUTPUT_FILE, markdown);
    console.log(`✅ AI 契约速查表已生成: ${OUTPUT_FILE}`);
}

generateAIDocs();
