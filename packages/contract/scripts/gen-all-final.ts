import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as dbSchema from "../src/table.schema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 🏗️ 路径配置 ---
const CONTRACT_ROOT = path.resolve(__dirname, "../src/modules");
const B2B_SERVER_ROOT = path.resolve(
  __dirname,
  "../../../apps/b2badmin/server"
);
const WEB_SERVER_ROOT = path.resolve(__dirname, "../../../apps/web/server");

const SYSTEM_FIELDS = ["id", "createdAt", "updatedAt"];

// --- 🛠️ 辅助函数 ---
function toPascalCase(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toCamelCase(str: string) {
  if (!str) return "";
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📂 [DIR] 已创建目录: ${dir}`);
  }
}

/**
 * 打印带格式的日志
 */
const log = {
  info: (msg: string) => console.log(`💡 ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  warn: (msg: string) => console.warn(`⚠️ ${msg}`),
  skip: (file: string) => console.log(`  index.ts [SKIP] 保持现状: ${file}`),
  create: (file: string) => console.log(`✨ [CREATE] 已生成新文件: ${file}`),
  update: (file: string) =>
    console.log(`🔄 [UPDATE] 已覆盖自动生成文件: ${file}`),
};

// --- 📝 模板 Header ---
const GEN_HEADER = (type: string) =>
  `/**
 * 🤖 【${type} - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */`.trim();

const CUSTOM_HEADER = (type: string) =>
  `/**
 * ✍️ 【${type} - 业务自定义层】
 * --------------------------------------------------------
 * 💡 你可以直接在此修改 Response, Create, Update 等字段。
 * 🛡️ 脚本检测到文件存在时永远不会覆盖此处。
 * --------------------------------------------------------
 */`.trim();

// --- ⚙️ 核心引擎 ---

function generate() {
  console.log("\n🚀 ==================================================");
  console.log("🚀 正在启动全栈自动化引擎 [Custom 优先模式]");
  console.log("🚀 ==================================================\n");

  // 1. 打印路径概览
  log.info(`Schema 定义源:  ${path.resolve(__dirname, "../src/table.schema")}`);
  log.info(`契约输出根目录: ${CONTRACT_ROOT}`);
  log.info(`B2B Server 根: ${B2B_SERVER_ROOT}`);
  log.info(`WEB Server 根: ${WEB_SERVER_ROOT}\n`);

  const tableEntries = Object.entries(dbSchema).filter(([key]) =>
    key.endsWith("Table")
  );
  if (tableEntries.length === 0) {
    log.warn(
      "未检测到任何以 'Table' 结尾的 schema 表定义，请检查 table.schema.ts"
    );
    return;
  }

  const processedModules: {
    lowName: string;
    capitalized: string;
    key: string;
  }[] = [];

  tableEntries.forEach(([key]) => {
    const rawTableName = key.replace("Table", "");
    processedModules.push({
      key,
      capitalized: toPascalCase(rawTableName),
      lowName: rawTableName.toLowerCase(),
    });
  });

  // --- 契约层 (Shared Contract) ---
  const contractDirs = {
    gen: path.join(CONTRACT_ROOT, "_generated"),
    custom: path.join(CONTRACT_ROOT, "_custom"),
  };

  ensureDir(contractDirs.gen);
  ensureDir(contractDirs.custom);

  processedModules.forEach(({ key, capitalized, lowName }) => {
    // A. 生成 _generated (零件库 - 始终覆盖)
    const genPath = path.join(contractDirs.gen, `${lowName}.contract.ts`);
    const genContent = `${GEN_HEADER("Contract Base")}\nimport { t } from "elysia";\nimport { ${key} } from "../../table.schema";\nimport { spread } from "../../helper/utils"; \n\nexport const ${capitalized}Base = {\n  fields: spread(${key}, 'select'),\n  insertFields: spread(${key}, 'insert'),\n} as const;`;

    fs.writeFileSync(genPath, `${genContent}\n`);
    log.update(`Contract-Base: ${lowName}`);

    // B. 生成 _custom (业务层 - 仅创建)
    const customPath = path.join(contractDirs.custom, `${lowName}.contract.ts`);
    if (!fs.existsSync(customPath)) {
      const customContent = `${CUSTOM_HEADER("Contract")}\nimport { t } from "elysia";\nimport { ${capitalized}Base } from "../_generated/${lowName}.contract";\nimport { InferDTO } from "../../helper/utils"; \nimport { PaginationParams, SortParams } from "../../helper/query-types.model";\n\nexport const ${capitalized}Contract = {\n  Response: t.Object({ ...${capitalized}Base.fields }),\n  Create: t.Object(t.Omit(t.Object(${capitalized}Base.insertFields), [${SYSTEM_FIELDS.map((f) => `"${f}"`).join(", ")}]).properties),\n  Update: t.Partial(t.Omit(t.Object(${capitalized}Base.insertFields), [${SYSTEM_FIELDS.map((f) => `"${f}"`).join(", ")}, "siteId"])),\n  ListQuery: t.Object({ ...t.Partial(t.Object(${capitalized}Base.insertFields)).properties, ...PaginationParams.properties, ...SortParams.properties, search: t.Optional(t.String()) }),\n  ListResponse: t.Object({ data: t.Array(t.Object(${capitalized}Base.fields)), total: t.Number() }),\n} as const;\n\nexport type ${capitalized}DTO = InferDTO<typeof ${capitalized}Contract>;`;

      fs.writeFileSync(customPath, `${customContent}\n`);
      log.create(`Contract-Custom: ${lowName}`);
    }
  });

  // C. 生成契约统一索引 (index.ts)
  const indexContent =
    "/** 🛡️ 契约统一出口 - 脚本自动路由 */\n" +
    processedModules
      .map((m) => `export * from "./_custom/${m.lowName}.contract";`)
      .join("\n");
  fs.writeFileSync(path.join(CONTRACT_ROOT, "index.ts"), `${indexContent}\n`);

  // --- 处理 Server 端 (B2B & WEB) ---
  [
    { name: "B2B", root: B2B_SERVER_ROOT },
    { name: "WEB", root: WEB_SERVER_ROOT },
  ].forEach((env) => {
    if (!fs.existsSync(env.root)) {
      log.warn(`跳过环境 ${env.name}: 路径不存在 ${env.root}`);
      return;
    }

    log.info(`正在处理 ${env.name} Server 逻辑...`);
    const moduleRoot = path.join(env.root, "modules");
    const controllerRoot = path.join(env.root, "controllers");

    const dirs = {
      lib: path.join(moduleRoot, "_lib"),
      servGen: path.join(moduleRoot, "_generated"),
      servCustom: path.join(moduleRoot, "_custom"),
      ctrlGen: path.join(controllerRoot, "_generated"),
      ctrlCustom: path.join(controllerRoot, "_custom"),
    };

    Object.values(dirs).forEach(ensureDir);

    // 1. 生成 BaseService (不覆盖)
    generateBaseService(env.name, dirs.lib);

    processedModules.forEach(({ key, capitalized, lowName }) => {
      // 2. Service 生成
      const servGenPath = path.join(dirs.servGen, `${lowName}.service.ts`);
      fs.writeFileSync(
        servGenPath,
        `${GEN_HEADER(`${env.name} Service`)}\nimport { ${key}, ${capitalized}Contract } from "@repo/contract";\nimport { ${env.name}BaseService } from "../_lib/base-service";\n\nexport class ${capitalized}GeneratedService extends ${env.name}BaseService<typeof ${key}, typeof ${capitalized}Contract> {\n  constructor() { super(${key}, ${capitalized}Contract); }\n}`
      );

      const servCustomPath = path.join(
        dirs.servCustom,
        `${lowName}.service.ts`
      );
      if (!fs.existsSync(servCustomPath)) {
        fs.writeFileSync(
          servCustomPath,
          `${CUSTOM_HEADER(`${env.name} Service`)}\nimport { ${capitalized}GeneratedService } from "../_generated/${lowName}.service";\nexport class ${capitalized}Service extends ${capitalized}GeneratedService {}`
        );
        log.create(`${env.name} Service: ${lowName}`);
      }

      // 3. Controller 生成 (总是更新 _generated)
      const ctrlGenPath = path.join(dirs.ctrlGen, `${lowName}.controller.ts`);
      fs.writeFileSync(
        ctrlGenPath,
        generateControllerTemplate(env.name, lowName, capitalized)
      );
    });

    // 4. 生成模块索引 (modules/index.ts)
    fs.writeFileSync(
      path.join(moduleRoot, "index.ts"),
      processedModules
        .map(
          (m) =>
            `import { ${m.capitalized}Service } from "./_custom/${m.lowName}.service";\nexport const ${toCamelCase(m.capitalized)}Service = new ${m.capitalized}Service();`
        )
        .join("\n\n")
    );

    // 5. 生成控制器索引 (controllers/index.ts)
    fs.writeFileSync(
      path.join(controllerRoot, "index.ts"),
      processedModules
        .map((m) => {
          const hasCustom = fs.existsSync(
            path.join(dirs.ctrlCustom, `${m.lowName}.controller.ts`)
          );
          return `export * from "./${hasCustom ? "_custom" : "_generated"}/${m.lowName}.controller";`;
        })
        .join("\n")
    );

    // 6. 生成 AppRouter (入口文件)
    generateAppRouter(processedModules, controllerRoot);
  });

  console.log("\n✨ ==================================================");
  log.success("同步完成。请检查各模块的 _custom 文件夹进行业务扩展。");
  console.log("✨ ==================================================\n");
}

// --- 🧩 辅助生成函数 (逻辑保持不变，仅增加日志) ---

// --- 🧩 辅助生成函数 ---

function generateBaseService(envName: string, outDir: string) {
  const filePath = path.join(outDir, "base-service.ts");
  if (fs.existsSync(filePath)) return; // BaseService 通常不覆盖，除非删掉重建

  const content = `
import { and, eq, ilike, type SQL, sql } from "drizzle-orm";
import type { PgTableWithColumns, PgSelect, PgUpdate, PgDelete } from "drizzle-orm/pg-core";
import { Static } from "@sinclair/typebox";

export interface ServiceContext {
  db: any;
  ${
    envName === "WEB"
      ? "siteId: string;"
      : "auth: { userId: string; siteId: string; tenantId: string; role: string; };"
  }
}

export abstract class ${envName}BaseService<
  T extends PgTableWithColumns<any>,
  C extends { Create: any; Update: any; ListQuery: any }
> {
  constructor(protected table: T, protected contract: C) {}

  // ... (保留你原来的 BaseService 逻辑) ...
  // 为节省篇幅，这里简化，请填入你完整的 BaseService 代码
  async findAll(query: any, ctx: ServiceContext) { return { data: [], total: 0 }; }
  async create(data: any, ctx: ServiceContext) { return {}; }
  async update(id: string, data: any, ctx: ServiceContext) { return {}; }
  async delete(id: string, ctx: ServiceContext) { return {}; }
}
`.trim();
  fs.writeFileSync(filePath, content);
}

function generateControllerTemplate(
  env: string,
  lowName: string,
  capitalized: string
) {
  // 根据环境生成不同的 Controller 代码
  const commonImports = `
import { Elysia, t } from "elysia";
import { ${capitalized}Contract } from "@repo/contract";
import { ${toCamelCase(capitalized)}Service } from "../../modules/index";
import { dbPlugin } from "~/db/connection";
`;

  if (env === "WEB") {
    return `
${GEN_HEADER("Web Controller")}
${commonImports}
import { siteMiddleware } from "~/middleware/site";

export const ${lowName}Controller = new Elysia({ prefix: "/${lowName}" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => ${toCamelCase(capitalized)}Service.findAll(query, { db, siteId }), { query: ${capitalized}Contract.ListQuery })
  .post("/", ({ body, db, siteId }) => ${toCamelCase(capitalized)}Service.create(body, { db, siteId }), { body: ${capitalized}Contract.Create })
  .put("/:id", ({ params, body, db, siteId }) => ${toCamelCase(capitalized)}Service.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: ${capitalized}Contract.Update })
  .delete("/:id", ({ params, db, siteId }) => ${toCamelCase(capitalized)}Service.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });
`.trim();
  }
  return `
${GEN_HEADER("B2B Controller")}
${commonImports}
import { authGuardMid } from "~/middleware/auth";

export const ${lowName}Controller = new Elysia({ prefix: "/${lowName}" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => ${toCamelCase(capitalized)}Service.findAll(query, { db, auth }), { query: ${capitalized}Contract.ListQuery })
  .post("/", ({ body, auth, db }) => ${toCamelCase(capitalized)}Service.create(body, { db, auth }), { body: ${capitalized}Contract.Create })
  .delete("/:id", ({ params, auth, db }) => ${toCamelCase(capitalized)}Service.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });
`.trim();
}

function generateAppRouter(processedModules: any[], controllerRoot: string) {
  const routerPath = path.join(controllerRoot, "app-router.ts");

  // 1. 检查文件是否存在，如果存在则直接退出
  if (fs.existsSync(routerPath)) {
    log.skip("app-router.ts (存在即保护)");
    return;
  }

  const imports = processedModules
    .map((m) => {
      const customPath = path.join(
        controllerRoot,
        "_custom",
        `${m.lowName}.controller.ts`
      );
      const source = fs.existsSync(customPath) ? "_custom" : "_generated";
      return `import { ${m.lowName}Controller } from "./${source}/${m.lowName}.controller";`;
    })
    .join("\n");

  const uses = processedModules
    .map((m) => `  .use(${m.lowName}Controller)`)
    .join("\n");

  const content = `
/**
 * 🤖 【路由挂载器 - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 静态链式调用，保证 Eden Treaty 类型推断完美。
 * --------------------------------------------------------
 */
import { Elysia } from "elysia";
${imports}

export const appRouter = (app: Elysia) => 
  app
${uses};
`.trim();

  fs.writeFileSync(routerPath, `${content}\n`);
  log.create(`AppRouter 入口: ${routerPath}`);
}

// 🔥 启动
generate();
