import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
// ⚠️ 请确保这里指向你的 Drizzle Schema 定义文件
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
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

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
  console.log("\n🚀 正在启动全栈自动化引擎 [Custom 优先模式]...");

  const tableEntries = Object.entries(dbSchema).filter(([key]) =>
    key.endsWith("Table")
  );

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

  const contractDirs = {
    gen: path.join(CONTRACT_ROOT, "_generated"),
    custom: path.join(CONTRACT_ROOT, "_custom"),
  };
  ensureDir(contractDirs.gen);
  ensureDir(contractDirs.custom);

  processedModules.forEach(({ key, capitalized, lowName }) => {
    // 1. 生成 _generated 里的 Base (零件库)
    const genContent = `
${GEN_HEADER("Contract Base")}
import { t } from "elysia";
import { ${key} } from "../../table.schema";
import { spread } from "../../helper/utils"; 

export const ${capitalized}Base = {
  fields: spread(${key}, 'select'),
  insertFields: spread(${key}, 'insert'),
} as const;
`.trim();
    fs.writeFileSync(
      path.join(contractDirs.gen, `${lowName}.contract.ts`),
      `${genContent}\n`
    );

    // 2. 生成 _custom 里的业务契约 (仅在不存在时生成)
    const customPath = path.join(contractDirs.custom, `${lowName}.contract.ts`);
    if (!fs.existsSync(customPath)) {
      const customContent = `
${CUSTOM_HEADER("Contract")}
import { t } from "elysia";
import { ${capitalized}Base } from "../_generated/${lowName}.contract";
import { InferDTO } from "../../helper/utils"; 
import { PaginationParams, SortParams } from "../../helper/query-types.model";

/**
 * ${capitalized} 契约定义
 * 你可以直接在此处添加或 Omit 字段
 */
export const ${capitalized}Contract = {
  // 响应字段 (默认展开所有数据库字段)
  Response: t.Object({
    ...${capitalized}Base.fields,
  }),
  
  // 创建请求 (默认排除系统字段)
  Create: t.Object(
    t.Omit(t.Object(${capitalized}Base.insertFields), [${SYSTEM_FIELDS.map((f) => `"${f}"`).join(", ")}]).properties
  ),
  
  // 更新请求 (精细化可选更新)
  Update: t.Partial(
    t.Omit(t.Object(${capitalized}Base.insertFields), [${SYSTEM_FIELDS.map((f) => `"${f}"`).join(", ")}, "siteId"])
  ),
  
  // 列表查询
  ListQuery: t.Object({
    ...t.Partial(t.Object(${capitalized}Base.insertFields)).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  
  ListResponse: t.Object({ 
    data: t.Array(t.Object(${capitalized}Base.fields)), 
    total: t.Number() 
  }),
} as const;

// ✨ DTO 类型直接在此导出，方便外部引用
export type ${capitalized}DTO = InferDTO<typeof ${capitalized}Contract>;
`.trim();
      fs.writeFileSync(customPath, `${customContent}\n`);
      console.log(`🆕 已创建新契约: ${lowName}.contract.ts`);
    }
  });

  // 3. 生成统一入口 index.ts
  const indexHeader = "/** 🛡️ 契约统一出口 - 脚本自动路由 */\n";
  const indexContent = processedModules
    .map((m) => `export * from "./_custom/${m.lowName}.contract";`)
    .join("\n");
  fs.writeFileSync(
    path.join(CONTRACT_ROOT, "index.ts"),
    `${indexHeader + indexContent}\n`
  );

  // --- 处理端 (B2B & WEB) 保持之前的 Controller/Service 生成逻辑 ---
  [
    { name: "B2B", root: B2B_SERVER_ROOT },
    { name: "WEB", root: WEB_SERVER_ROOT },
  ].forEach((env) => {
    if (!fs.existsSync(env.root)) return;
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

    generateBaseService(env.name, dirs.lib);

    processedModules.forEach(({ key, capitalized, lowName }) => {
      // 生成 Service
      const servGenPath = path.join(dirs.servGen, `${lowName}.service.ts`);
      fs.writeFileSync(
        servGenPath,
        `
${GEN_HEADER(`${env.name} Service`)}
import { ${key}, ${capitalized}Contract } from "@repo/contract";
import { ${env.name}BaseService } from "../_lib/base-service";

export class ${capitalized}GeneratedService extends ${env.name}BaseService<typeof ${key}, typeof ${capitalized}Contract> {
  constructor() { super(${key}, ${capitalized}Contract); }
}
`.trim()
      );

      const servCustomPath = path.join(
        dirs.servCustom,
        `${lowName}.service.ts`
      );
      if (!fs.existsSync(servCustomPath)) {
        fs.writeFileSync(
          servCustomPath,
          `
${CUSTOM_HEADER(`${env.name} Service`)}
import { ${capitalized}GeneratedService } from "../_generated/${lowName}.service";
export class ${capitalized}Service extends ${capitalized}GeneratedService {}
`.trim()
        );
      }

      // 生成 Controller
      const ctrlGenPath = path.join(dirs.ctrlGen, `${lowName}.controller.ts`);
      fs.writeFileSync(
        ctrlGenPath,
        generateControllerTemplate(env.name, lowName, capitalized)
      );
    });

    // 索引生成
    fs.writeFileSync(
      path.join(moduleRoot, "index.ts"),
      processedModules
        .map(
          (m) =>
            `import { ${m.capitalized}Service } from "./_custom/${m.lowName}.service";\nexport const ${toCamelCase(m.capitalized)}Service = new ${m.capitalized}Service();`
        )
        .join("\n\n")
    );
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
    generateAppRouter(processedModules, controllerRoot);
  });

  console.log("✅ 同步完成。");
}

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
  .patch("/:id", ({ params, body, db, siteId }) => ${toCamelCase(capitalized)}Service.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: ${capitalized}Contract.Patch })
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

  // 智能路由检测：决定 Import 源
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
}

// 🔥 启动
generate();
