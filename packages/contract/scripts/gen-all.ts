import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as dbSchema from "../src/table.schema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVICE_DIR = path.resolve(__dirname, "../../../apps/b2badmin/server/modules/generated");


// 路径配置
const MODULE_DIR = path.resolve(__dirname, "../src/modules");
const GEN_CONTRACT_DIR = path.resolve(MODULE_DIR, "generated");
console.log('GEN_CONTRACT_DIR:', GEN_CONTRACT_DIR)
const CUSTOM_DIR = path.resolve(MODULE_DIR, "custom");
console.log('CUSTOM_DIR:', CUSTOM_DIR)
const GEN_SERVICE_DIR = SERVICE_DIR;
console.log('SERVICE_DIR:', SERVICE_DIR);

// 确保目录存在
[GEN_CONTRACT_DIR, GEN_SERVICE_DIR, CUSTOM_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const SYSTEM_FIELDS = ["id", "createdAt", "updatedAt"];

function generate() {
    console.log("🛠️  正在启动全栈自动化引擎...");

    const tableEntries = Object.entries(dbSchema).filter(([key]) => key.endsWith("Table"));
    const modules: string[] = [];

    tableEntries.forEach(([key, table]) => {
        const tableName = key.replace("Table", "");
        const capitalized = tableName.charAt(0).toUpperCase() + tableName.slice(1);
        const fileName = `${tableName.toLowerCase()}.contract`;

        // --- A. 生成 Contract (契约) ---
        const contractContent = `
import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { ${key} } from "../../table.schema";
import { PaginationParams, SortParams } from "../../helper/query-types.t.model";

const _Select = createSelectSchema(${key});
const _Insert = createInsertSchema(${key});

export const ${capitalized}Contract = {
  Response: _Select,
  Create: t.Omit(_Insert, [${SYSTEM_FIELDS.map(f => `"${f}"`).join(", ")}]),
  Update: createUpdateSchema(${key}),
  Patch: t.Partial(t.Omit(_Insert, [${SYSTEM_FIELDS.map(f => `"${f}"`).join(", ")}])),
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, [${SYSTEM_FIELDS.map(f => `"${f}"`).join(", ")}])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;

export type ${capitalized}DTO = {
  Response: typeof ${capitalized}Contract.Response.static;
  Create: typeof ${capitalized}Contract.Create.static;
  Update: typeof ${capitalized}Contract.Update.static;
  Patch: typeof ${capitalized}Contract.Patch.static;
  ListQuery: typeof ${capitalized}Contract.ListQuery.static;
};`.trim();

        fs.writeFileSync(path.join(GEN_CONTRACT_DIR, `${fileName}.ts`), `${contractContent}\n`);

        // --- B. 生成 Service (服务实例) ---
        const serviceContent = `
import { ${key} } from "../../table.schema";
import { ${capitalized}Contract } from "../../generated/${fileName}";
import { BaseService } from "../../../lib/base-service";

/**
 * 自动生成的 ${capitalized} 基础服务
 * 如果需要扩展，请在 ../custom 目录下创建同名服务类并继承此类
 */
export const ${tableName}Service = new BaseService(${key}, ${capitalized}Contract);
`.trim();

        fs.writeFileSync(path.join(GEN_SERVICE_DIR, `${tableName.toLowerCase()}.service.ts`), `${serviceContent}\n`);
        modules.push(tableName.toLowerCase());
    });

    // --- C. 生成统一入口 index.ts ---
    const customFiles = fs.readdirSync(CUSTOM_DIR).filter(f => f.endsWith(".ts")).map(f => f.replace(".contract.ts", ""));

    const indexContent = Array.from(new Set([...modules, ...customFiles])).sort().map(mod => {
        const isCustom = customFiles.includes(mod);
        const sourceDir = isCustom ? "./custom" : "./generated";
        const cap = mod.charAt(0).toUpperCase() + mod.slice(1);
        return `export * from "${sourceDir}/${mod}.contract";`;
    }).join("\n");

    fs.writeFileSync(path.join(MODULE_DIR, "index.ts"), `// 🛡️ 自动生成的契约入口\n${indexContent}\n`);

    console.log(`✅ 同步完成！共处理 ${modules.length} 个模块。`);
}

generate();