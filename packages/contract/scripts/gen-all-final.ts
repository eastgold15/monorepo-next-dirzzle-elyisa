import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as dbSchema from "../src/table.schema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 路径配置 ---
// 1. 契约层 (packages/contract)
const MODULE_DIR = path.resolve(__dirname, "../src/modules");
const CONTRACT_GEN_DIR = path.resolve(MODULE_DIR, "generated");
const CONTRACT_CUSTOM_DIR = path.resolve(MODULE_DIR, "custom");
const CONTRACT_INDEX_FILE = path.resolve(MODULE_DIR, "index.ts");

// 2. 服务层 (apps/b2badmin/server/modules)
const SERVER_MODULE_DIR = path.resolve(__dirname, "../../../apps/b2badmin/server/modules");
const SERVICE_GEN_DIR = path.resolve(SERVER_MODULE_DIR, "generated");
const SERVICE_CUSTOM_DIR = path.resolve(SERVER_MODULE_DIR, "custom");
const SERVICE_INDEX_FILE = path.resolve(SERVER_MODULE_DIR, "index.ts");

// 3. 控制器层 (apps/b2badmin/server/controllers)
const SERVER_CONTROLLER_DIR = path.resolve(__dirname, "../../../apps/b2badmin/server/controllers");
const CONTROLLER_GEN_DIR = path.resolve(SERVER_CONTROLLER_DIR, "generated");


// --- 控制器层自定义目录 ---
const CONTROLLER_CUSTOM_DIR = path.resolve(SERVER_CONTROLLER_DIR, "custom");

// --- 🛠️ 辅助函数 ---

/**
 * 保持原始驼峰并确保首字母大写 (用于类名)
 * skuMedia -> SkuMedia
 */
function toPascalCase(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 确保首字母小写 (用于实例名)
 * SkuMedia -> skuMedia
 */
function toCamelCase(str: string) {
  if (!str) return "";
  return str.charAt(0).toLowerCase() + str.slice(1);
}

// --- 🛡️ 目录保护：确保所有目录存在 ---
const ALL_DIRS = [
  CONTRACT_GEN_DIR,
  CONTRACT_CUSTOM_DIR,
  SERVICE_GEN_DIR,
  SERVICE_CUSTOM_DIR,
  CONTROLLER_GEN_DIR,
  CONTROLLER_CUSTOM_DIR
];

ALL_DIRS.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`📁 正在创建缺失目录: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

const SYSTEM_FIELDS = ["id", "createdAt", "updatedAt"];

function generate() {
  console.log("🛠️ 正在启动全栈自动化引擎...");

  const tableEntries = Object.entries(dbSchema).filter(([key]) => key.endsWith("Table"));
  const processedModules: { lowName: string, capitalized: string, originalKey: string }[] = [];

  tableEntries.forEach(([key, table]) => {
    const rawTableName = key.replace("Table", ""); // 例如 skuMedia
    const capitalized = toPascalCase(rawTableName); // SkuMedia
    const lowName = rawTableName.toLowerCase();      // skumedia (用于文件名)
    const instanceName = toCamelCase(rawTableName);  // skuMedia (用于变量名)

    processedModules.push({ lowName, capitalized, originalKey: key });

    // --- 1. 生成 Contract (契约) ---
    const contractContent = `
import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { ${key} } from "~/table.schema";
import { PaginationParams, SortParams } from "~/helper/query-types.model";

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
import { ${instanceName}Service } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const ${lowName}Controller = new Elysia({ prefix: "/${lowName}" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("${rawTableName.toUpperCase()}_VIEW")) throw new Error("Forbidden");
    return ${instanceName}Service.findAll(query,auth);
  }, {
    query: ${capitalized}Contract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("${rawTableName.toUpperCase()}_CREATE")) throw new Error("Forbidden");
    return ${instanceName}Service.create(body,auth);
  }, {
    body: ${capitalized}Contract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("${rawTableName.toUpperCase()}_EDIT")) throw new Error("Forbidden");
    return ${instanceName}Service.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: ${capitalized}Contract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("${rawTableName.toUpperCase()}_DELETE")) throw new Error("Forbidden");
    return ${instanceName}Service.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
`.trim();

    fs.writeFileSync(path.join(CONTROLLER_GEN_DIR, `${lowName}.controller.ts`), controllerContent + "\n");
  });

  // --- 4. 生成统一索引 (带 Custom 覆盖逻辑) ---

  // Contract Index
  const customContracts = fs.readdirSync(CONTRACT_CUSTOM_DIR).filter(f => f.endsWith(".contract.ts")).map(f => f.replace(".contract.ts", ""));

  const contractIndex = processedModules.map(m => {
    const source = customContracts.includes(m.lowName) ? "./custom" : "./generated";
    return `export * from "${source}/${m.lowName}.contract";`;
  }).join("\n");
  fs.writeFileSync(CONTRACT_INDEX_FILE, `// 🛡️ 自动生成的契约索引\n${contractIndex}\n`);

  // Service Index
  const customServices = fs.readdirSync(SERVICE_CUSTOM_DIR).filter(f => f.endsWith(".service.ts")).map(f => f.replace(".service.ts", ""));
  const serviceIndex = processedModules.map(m => {
    const instanceName = toCamelCase(m.originalKey.replace("Table", "")) + "Service";
    if (customServices.includes(m.lowName)) {
      return `import { ${m.capitalized}Service } from "./custom/${m.lowName}.service";\nexport const ${instanceName} = new ${m.capitalized}Service();`;
    }
    return `import { ${m.capitalized}BaseService } from "./generated/${m.lowName}.service";\nexport const ${instanceName} = new ${m.capitalized}BaseService();`;
  }).join("\n\n");
  fs.writeFileSync(SERVICE_INDEX_FILE, `// 🛡️ 自动生成的 Service 索引\n${serviceIndex}\n`);

  // 4. 生成 Controller Index (带 Custom 覆盖逻辑)
  const customControllers = fs.readdirSync(CONTROLLER_CUSTOM_DIR)
    .filter(f => f.endsWith(".controller.ts"))
    .map(f => f.replace(".controller.ts", ""));
  // Controller Index
  const controllerIndex = processedModules.map(m => {
    // 如果 custom 下有同名文件，则引用 custom
    const source = customControllers.includes(m.lowName) ? "./custom" : "./generated";
    return `export * from "${source}/${m.lowName}.controller";`;
  }).join("\n");

  fs.writeFileSync(
    path.join(SERVER_CONTROLLER_DIR, "index.ts"),
    `// 🛡️ 自动生成的 Controller 入口，支持 custom 覆盖\n${controllerIndex}\n`
  );
  console.log(`✅ 同步完成！共处理 ${processedModules.length} 个模块。优先引用 custom 目录下的自定义实现。`);
}

generate();