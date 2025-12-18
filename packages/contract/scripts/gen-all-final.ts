import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as dbSchema from "../src/table.schema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 路径配置 ---
const MODULE_DIR = path.resolve(__dirname, "../src/modules");
const CONTRACT_GEN_DIR = path.resolve(MODULE_DIR, "generated");
const CONTRACT_CUSTOM_DIR = path.resolve(MODULE_DIR, "custom");
const CONTRACT_INDEX_FILE = path.resolve(MODULE_DIR, "index.ts");

const SERVER_MODULE_DIR = path.resolve(__dirname, "../../../apps/b2badmin/server/modules");
const SERVICE_GEN_DIR = path.resolve(SERVER_MODULE_DIR, "generated");
const SERVICE_CUSTOM_DIR = path.resolve(SERVER_MODULE_DIR, "custom");
const SERVICE_INDEX_FILE = path.resolve(SERVER_MODULE_DIR, "index.ts");

// 控制器存放位置（建议放在 server/controllers）
const SERVER_CONTROLLER_DIR = path.resolve(__dirname, "../../../apps/b2badmin/server/controllers");
const CONTROLLER_GEN_DIR = path.resolve(SERVER_CONTROLLER_DIR, "generated");

// --- 🛡️ 核心修复：目录保护 ---
[CONTRACT_GEN_DIR, CONTRACT_CUSTOM_DIR, SERVICE_GEN_DIR, SERVICE_CUSTOM_DIR, CONTROLLER_GEN_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const SYSTEM_FIELDS = ["id", "createdAt", "updatedAt"];

function generate() {
    console.log("🛠️ 正在启动全栈自动化引擎...");

    const tableEntries = Object.entries(dbSchema).filter(([key]) => key.endsWith("Table"));
    const moduleNames: string[] = [];

    tableEntries.forEach(([key, table]) => {
        const tableName = key.replace("Table", "");
        const capitalized = tableName.charAt(0).toUpperCase() + tableName.slice(1);
        const lowName = tableName.toLowerCase();

        // --- 1. 生成 Contract (契约) ---
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

        fs.writeFileSync(path.join(CONTRACT_GEN_DIR, `${lowName}.contract.ts`), contractContent + "\n");

        // --- 2. 生成 Service (基础类) ---
        // 注意：${key} 应该引用自数据库定义，这里假设后端可以通过 @repo/contract 访问到 schema
        const serviceContent = `
import { ${key} } from "@repo/contract"; 
import { ${capitalized}Contract } from "@repo/contract";
import { BaseService } from "~/lib/base-service";

export class ${capitalized}BaseService extends BaseService<typeof ${key}, typeof ${capitalized}Contract> {
    constructor() {
        super(${key}, ${capitalized}Contract);
    }
}
`.trim();
        fs.writeFileSync(path.join(SERVICE_GEN_DIR, `${lowName}.service.ts`), serviceContent + "\n");

        // --- 3. 生成 Controller ---
        const controllerContent = `
import { Elysia, t } from "elysia";
import { ${capitalized}Contract } from "@repo/contract";
import { ${tableName}Service } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const ${lowName}Controller = new Elysia({ prefix: "/${lowName}" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("${tableName.toUpperCase()}_VIEW")) throw new Error("Forbidden");
    return ${tableName}Service.findAll(query);
  }, {
    query: ${capitalized}Contract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("${tableName.toUpperCase()}_CREATE")) throw new Error("Forbidden");
    return ${tableName}Service.create(body);
  }, {
    body: ${capitalized}Contract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("${tableName.toUpperCase()}_EDIT")) throw new Error("Forbidden");
    return ${tableName}Service.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: ${capitalized}Contract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("${tableName.toUpperCase()}_DELETE")) throw new Error("Forbidden");
    return ${tableName}Service.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
`.trim();

        fs.writeFileSync(path.join(CONTROLLER_GEN_DIR, `${lowName}.controller.ts`), controllerContent + "\n");

        moduleNames.push(lowName);
    });

    // --- 4. 生成统一索引 ---

    // Contract Index
    const customContracts = fs.readdirSync(CONTRACT_CUSTOM_DIR).filter(f => f.endsWith(".contract.ts")).map(f => f.replace(".contract.ts", ""));
    const contractIndex = moduleNames.map(mod => {
        const source = customContracts.includes(mod) ? "./custom" : "./generated";
        return `export * from "${source}/${mod}.contract";`;
    }).join("\n");
    fs.writeFileSync(CONTRACT_INDEX_FILE, `// 🛡️ 自动生成的契约索引\n${contractIndex}\n`);

    // Service Index
    const customServices = fs.readdirSync(SERVICE_CUSTOM_DIR).filter(f => f.endsWith(".service.ts")).map(f => f.replace(".service.ts", ""));
    const serviceIndex = moduleNames.map(mod => {
        const cap = mod.charAt(0).toUpperCase() + mod.slice(1);
        if (customServices.includes(mod)) {
            return `import { ${cap}Service } from "./custom/${mod}.service";\nexport const ${mod}Service = new ${cap}Service();`;
        }
        return `import { ${cap}BaseService } from "./generated/${mod}.service";\nexport const ${mod}Service = new ${cap}BaseService();`;
    }).join("\n\n");
    fs.writeFileSync(SERVICE_INDEX_FILE, `// 🛡️ 自动生成的 Service 索引\n${serviceIndex}\n`);

    // Controller Index
    const controllerIndex = moduleNames.map(mod => `export * from "./generated/${mod}.controller";`).join("\n");
    fs.writeFileSync(path.join(SERVER_CONTROLLER_DIR, "index.ts"), `// 🛡️ 自动生成的 Controller 入口\n${controllerIndex}\n`);

    console.log(`✅ 同步完成！已全自动处理 ${moduleNames.length} 个模块的契约、服务与路由。`);
}

generate();