import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
    Project,
    PropertyAssignment,
    SpreadAssignment,
    SyntaxKind,
} from "ts-morph";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTRACT_DIR = path.resolve(__dirname, "../src/modules/generated"); // 确保路径正确
const OUTPUT_FILE = path.resolve(__dirname, "../src/AI_API_REFERENCE.md");

const project = new Project();
project.addSourceFilesAtPaths(`${CONTRACT_DIR}/**/*.ts`);

function generateAIDocs() {
    let markdown = "# 🤖 全栈 API 契约速查表 (AI 专用)\n\n";
    markdown +=
        "> 此文档由脚本深度解析 TypeBox 组合逻辑生成。AI 请参考此结构构建请求。\n\n";

    const sourceFiles = project.getSourceFiles();

    sourceFiles.forEach((file) => {
        const moduleName = file
            .getBaseNameWithoutExtension()
            .toUpperCase()
            .replace(".CONTRACT", "");
        markdown += `## 模块: ${moduleName}\n\n`;

        // 寻找以 Contract 结尾的常量
        const contracts = file
            .getVariableDeclarations()
            .filter((v) => v.getName().endsWith("Contract"));

        contracts.forEach((contract) => {
            const initializer = contract.getInitializer();
            if (!initializer) return;

            // 剥开 as const 层
            const objLiteral =
                initializer
                    .asKind(SyntaxKind.AsExpression)
                    ?.getExpression()
                    .asKind(SyntaxKind.ObjectLiteralExpression) ||
                initializer.asKind(SyntaxKind.ObjectLiteralExpression);

            if (!objLiteral) return;

            objLiteral.getProperties().forEach((prop) => {
                if (!(prop instanceof PropertyAssignment)) return;

                const schemaName = prop.getName();
                const schemaInit = prop.getInitializer();
                if (!schemaInit) return;

                markdown += `### 🏷️ ${schemaName}\n`;
                markdown += "| 来源/字段 | 类型 | 状态 | 详细说明 |\n";
                markdown += "| :--- | :--- | :--- | :--- |\n";

                // 解析 TypeBox 逻辑
                const analysis = analyzeTypeBoxNode(schemaInit);
                analysis.forEach((item) => {
                    markdown += `| \`${item.name}\` | \`${item.type}\` | ${item.status} | ${item.detail} |\n`;
                });
                markdown += "\n";
            });
        });

        markdown += "\n---\n";
    });

    fs.writeFileSync(OUTPUT_FILE, markdown);
    console.log(`✅ 契约文档已深度解析并生成: ${OUTPUT_FILE}`);
}

/**
 * 核心递归解析函数
 */
function analyzeTypeBoxNode(node: any): any[] {
    const results: any[] = [];
    const text = node.getText();

    // 1. 处理 t.Object({...})
    if (text.includes("t.Object")) {
        const objExp = node.getDescendantsOfKind(
            SyntaxKind.ObjectLiteralExpression
        )[0];
        if (objExp) {
            objExp.getProperties().forEach((p: any) => {
                // 处理 ...PaginationParams.properties (展开运算符)
                if (p instanceof SpreadAssignment) {
                    const spreadText = p
                        .getExpression()
                        .getText()
                        .replace(".properties", "");
                    results.push({
                        name: `Inherit: ${spreadText}`,
                        type: "Object",
                        status: "混合",
                        detail: "继承该公共模块的所有字段",
                    });
                }
                // 处理 search: t.Optional(t.String()) (普通属性)
                else if (p instanceof PropertyAssignment) {
                    const name = p.getName();
                    const val = p.getInitializer()?.getText() || "";
                    results.push({
                        name,
                        type: val.match(/t\.(\w+)/)?.[1] || "unknown",
                        status: val.includes("Optional") ? "可选" : "必填",
                        detail: val,
                    });
                }
            });
        }
    }

    // 2. 处理 t.Omit / t.Partial / t.Pick
    if (
        text.startsWith("t.Omit") ||
        text.startsWith("t.Partial") ||
        text.startsWith("t.Pick")
    ) {
        const match = text.match(/t\.(\w+)\(([^,]+)/);
        if (match) {
            const wrapper = match[1]; // Omit, Partial 等
            const baseSchema = match[2].trim(); // _Insert, _Select 等
            results.push({
                name: `Base: ${baseSchema}`,
                type: "Schema",
                status: wrapper,
                detail: `对基础 Schema 进行 ${wrapper} 处理`,
            });
        }
    }

    // 3. 处理 createUpdateSchema / createSelectSchema
    if (text.includes("create") && text.includes("Schema")) {
        const match = text.match(/create(\w+)Schema\((\w+)\)/);
        if (match) {
            results.push({
                name: `Table: ${match[2]}`,
                type: "Database",
                status: match[1],
                detail: `直接映射自数据库表 ${match[2]}`,
            });
        }
    }

    // 4. 处理裸变量引用 (如 Response: _Select)
    if (results.length === 0 && text.startsWith("_")) {
        results.push({
            name: `Ref: ${text}`,
            type: "Schema",
            status: "原样",
            detail: "引用内部预定义的 Schema",
        });
    }

    return results;
}

generateAIDocs();
