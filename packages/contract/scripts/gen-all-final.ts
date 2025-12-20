import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as dbSchema from "../src/table.schema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 路径配置 ---
const CONTRACT_ROOT = path.resolve(__dirname, "../src/modules");
const B2B_SERVER_ROOT = path.resolve(
  __dirname,
  "../../../apps/b2badmin/server"
);
const WEB_SERVER_ROOT = path.resolve(__dirname, "../../../apps/web/server");

const SYSTEM_FIELDS = ["id", "createdAt", "updatedAt"];

const WEB_SERVER_CONTROLLER_DIR = path.join(WEB_SERVER_ROOT, "controllers");
const B2B_SERVER_CONTROLLER_DIR = path.join(B2B_SERVER_ROOT, "controllers");
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
  `
/**
 * 🤖 【${type} - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */`.trim();

const CUSTOM_HEADER = (type: string) =>
  `
/**
 * ✍️ 【${type} - 业务自定义】
 * --------------------------------------------------------
 * 💡 你可以在此重写基类方法或添加私有业务逻辑。
 * 🛡️ 自动化脚本永远不会覆盖此文件。
 * --------------------------------------------------------
 */`.trim();

// --- ⚙️ 核心引擎 ---

function generate() {
  console.log("🛠️  正在启动全栈自动化引擎 [带站点隔离架构]...");

  const tableEntries = Object.entries(dbSchema).filter(([key]) =>
    key.endsWith("Table")
  );
  const processedModules: {
    lowName: string;
    capitalized: string;
    key: string;
  }[] = [];

  // 1. 预处理模块信息
  tableEntries.forEach(([key]) => {
    const rawTableName = key.replace("Table", "");
    processedModules.push({
      key,
      capitalized: toPascalCase(rawTableName),
      lowName: rawTableName.toLowerCase(),
    });
  });

  // 2. 生成契约层 (Contract)
  const contractDirs = {
    gen: path.join(CONTRACT_ROOT, "_generated"),
    custom: path.join(CONTRACT_ROOT, "_custom"),
  };
  ensureDir(contractDirs.gen);
  ensureDir(contractDirs.custom);

  processedModules.forEach(({ key, capitalized, lowName }) => {
    const content = `
${GEN_HEADER("Contract")}
import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { ${key} } from "../../table.schema";
import { PaginationParams, SortParams } from "../../helper/query-types.model";

const _Select = createSelectSchema(${key});
const _Insert = createInsertSchema(${key});

export const ${capitalized}Contract = {
  Response: _Select,
  Create: t.Omit(_Insert, [${SYSTEM_FIELDS.map((f) => `"${f}"`).join(", ")}]),
  Update: createUpdateSchema(${key}),
  Patch: t.Partial(t.Omit(_Insert, [${SYSTEM_FIELDS.map((f) => `"${f}"`).join(", ")}])),
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, [${SYSTEM_FIELDS.map((f) => `"${f}"`).join(", ")}])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;
`.trim();
    fs.writeFileSync(
      path.join(contractDirs.gen, `${lowName}.contract.ts`),
      `${content}\n`
    );
  });

  // --- 契约层统一索引生成 ---
  const contractIndex = processedModules
    .map((m) => {
      const isCustom = fs.existsSync(
        path.join(contractDirs.custom, `${m.lowName}.contract.ts`)
      );
      return `export * from "./${isCustom ? "_custom" : "_generated"}/${m.lowName}.contract";`;
    })
    .join("\n");
  fs.writeFileSync(
    path.join(CONTRACT_ROOT, "index.ts"),
    `// 🛡️ 自动生成的契约索引\n${contractIndex}\n`
  );

  // 3. 处理两个端 (B2B & WEB)
  [
    { name: "B2B", root: B2B_SERVER_ROOT },
    { name: "WEB", root: WEB_SERVER_ROOT },
  ].forEach((env) => {
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

    // A. 生成/保护 BaseService
    const baseServPath = path.join(dirs.lib, "base-service.ts");
    if (!fs.existsSync(baseServPath)) {
      const baseServContent = `
import { and, eq, ilike, type SQL, sql } from "drizzle-orm";
import type { PgTableWithColumns, PgSelect, PgUpdate, PgDelete } from "drizzle-orm/pg-core";
import { Static } from "@sinclair/typebox";

export interface ServiceContext {
  db: any;
  ${
    env.name === "WEB"
      ? "siteId: string;"
      : `
  auth: {
    userId: string;
    siteId: string;
    tenantId: string;
    factoryId?: string;   // 👈 工厂特定 ID
    exporterId?: string;  // 👈 出口商特定 ID
    role: string;
  };
  `
  }
}

export abstract class ${env.name}BaseService<
  T extends PgTableWithColumns<any>,
  C extends { Create: any; Update: any; Response: any; ListQuery: any }
> {
  constructor(protected table: T, protected contract: C) {}

  protected getScopeFilters(ctx: ServiceContext): SQL[] {
    const filters: SQL[] = [];
    const tableAny = this.table as any;
    if (tableAny.siteId && (ctx as any).siteId) {
      filters.push(eq(tableAny.siteId, (ctx as any).siteId));
    }
    return filters;
  }

  protected withScope<QB extends PgSelect | PgUpdate | PgDelete>(qb: QB, ctx: ServiceContext, extraFilters: SQL[] = []): QB {
    const allFilters = [...this.getScopeFilters(ctx), ...extraFilters];
    // @ts-ignore
    return allFilters.length > 0 ? qb.where(and(...allFilters)) : qb;
  }

  async findAll(query: Static<C["ListQuery"]>, ctx: ServiceContext) {
    const { page = 1, limit = 10, search } = query as any;
    const tableAny = this.table as any;
    const extra: SQL[] = [];
    if (search && tableAny.name) extra.push(ilike(tableAny.name, \`%\${search}%\`));

    const select = ctx.db.select().from(this.table).$dynamic();
    const data = await this.withScope(select, ctx, extra)
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy(tableAny.createdAt ? sql\`\${tableAny.createdAt} desc\` : sql\`created_at desc\`);

    const total = await ctx.db.$count(this.table, and(...this.getScopeFilters(ctx), ...extra));
    return { data, total, page, limit };
  }

  async create(data: Static<C["Create"]>, ctx: ServiceContext) {
    const tableAny = this.table as any;
    const payload = { ...data, ...(tableAny.siteId && (ctx as any).siteId && { siteId: (ctx as any).siteId }) };
    const [result] = await ctx.db.insert(this.table).values(payload).returning();
    return result;
  }

  async update(id: string, data: any, ctx: ServiceContext) {
    const update = ctx.db.update(this.table).set({ ...data, updatedAt: new Date() }).$dynamic();
    const [result] = await this.withScope(update, ctx, [eq((this.table as any).id, id)]).returning();
    return result;
  }

  async delete(id: string, ctx: ServiceContext) {
    const del = ctx.db.delete(this.table).$dynamic();
    await this.withScope(del, ctx, [eq((this.table as any).id, id)]);
    return { success: true };
  }
}
`.trim();
      fs.writeFileSync(baseServPath, baseServContent);
    }

    // B. 循环生成 Service & Controller
    processedModules.forEach(({ key, capitalized, lowName }) => {
      // --- Service 生成 ---
      const servGenPath = path.join(dirs.servGen, `${lowName}.service.ts`);
      const servGenContent = `
${GEN_HEADER(`${env.name} Service`)}
import { ${key}, ${capitalized}Contract } from "@repo/contract";
import { ${env.name}BaseService } from "../_lib/base-service";

export class ${capitalized}GeneratedService extends ${env.name}BaseService<typeof ${key}, typeof ${capitalized}Contract> {
  constructor() {
    super(${key}, ${capitalized}Contract);
  }
}
`.trim();
      fs.writeFileSync(servGenPath, servGenContent);

      const servCustomPath = path.join(
        dirs.servCustom,
        `${lowName}.service.ts`
      );
      if (!fs.existsSync(servCustomPath)) {
        const servCustomContent = `
${CUSTOM_HEADER(`${env.name} Service`)}
import { ${capitalized}GeneratedService } from "../_generated/${lowName}.service";

export class ${capitalized}Service extends ${capitalized}GeneratedService {}
`.trim();
        fs.writeFileSync(servCustomPath, servCustomContent);
      }

      // --- Controller 生成 ---
      const ctrlGenPath = path.join(dirs.ctrlGen, `${lowName}.controller.ts`);
      const ctrlGenContent =
        env.name === "WEB"
          ? `
${GEN_HEADER("Web Controller")}
import { Elysia, t } from "elysia";
import { ${capitalized}Contract } from "@repo/contract";
import { ${toCamelCase(capitalized)}Service } from "../../modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const ${lowName}Controller = new Elysia({ prefix: "/${lowName}" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => ${toCamelCase(capitalized)}Service.findAll(query, { db, siteId }), { query: ${capitalized}Contract.ListQuery })
  .post("/", ({ body, db, siteId }) => ${toCamelCase(capitalized)}Service.create(body, { db, siteId }), { body: ${capitalized}Contract.Create })
  .patch("/:id", ({ params, body, db, siteId }) => ${toCamelCase(capitalized)}Service.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: ${capitalized}Contract.Patch })
  .delete("/:id", ({ params, db, siteId }) => ${toCamelCase(capitalized)}Service.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });
`
          : `
${GEN_HEADER("B2B Controller")}
import { Elysia, t } from "elysia";
import { ${capitalized}Contract } from "@repo/contract";
import { ${toCamelCase(capitalized)}Service } from "../../modules/index";
import { authGuardMid } from "~/middleware/auth";
import { dbPlugin } from "~/db/connection";

export const ${lowName}Controller = new Elysia({ prefix: "/${lowName}" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => ${toCamelCase(capitalized)}Service.findAll(query, { db, auth }), { query: ${capitalized}Contract.ListQuery })
  .post("/", ({ body, auth, db }) => ${toCamelCase(capitalized)}Service.create(body, { db, auth }), { body: ${capitalized}Contract.Create })
  .delete("/:id", ({ params, auth, db }) => ${toCamelCase(capitalized)}Service.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });
`;
      fs.writeFileSync(ctrlGenPath, ctrlGenContent.trim());
    });

    // C. 生成模块统一出口 (modules/index.ts)
    const moduleIndexContent = processedModules
      .map(
        (m) =>
          `import { ${m.capitalized}Service } from "./_custom/${m.lowName}.service";\nexport const ${toCamelCase(m.capitalized)}Service = new ${m.capitalized}Service();`
      )
      .join("\n\n");
    fs.writeFileSync(
      path.join(moduleRoot, "index.ts"),
      `// 🛡️ 自动生成的模块实例导出\n${moduleIndexContent}`
    );

    // D. 生成路由索引 (controllers/index.ts)
    const ctrlIndexContent = processedModules
      .map((m) => {
        const isCustom = fs.existsSync(
          path.join(dirs.ctrlCustom, `${m.lowName}.controller.ts`)
        );
        return `export * from "./${isCustom ? "_custom" : "_generated"}/${m.lowName}.controller";`;
      })
      .join("\n");
    fs.writeFileSync(
      path.join(controllerRoot, "index.ts"),
      `// 🛡️ 自动生成的路由导出\n${ctrlIndexContent}`
    );
  });

  console.log(
    `✅ 同步完成！已处理 ${processedModules.length} 个表。目录结构: _lib, _generated, _custom 已就绪。`
  );

  // 生成路由挂载器
  generateAppRouter(processedModules, B2B_SERVER_CONTROLLER_DIR);
  generateAppRouter(processedModules, WEB_SERVER_CONTROLLER_DIR);
}

generate();

// --- 脚本修改部分：生成静态路由挂载器 ---

function generateAppRouter(processedModules: any[], controllerRoot: string) {
  const routerPath = path.join(controllerRoot, "app-router.ts");

  // 1. 生成 Import 语句
  const imports = processedModules
    .map((m) => {
      const isCustom = fs.existsSync(
        path.join(controllerRoot, "_custom", `${m.lowName}.controller.ts`)
      );
      const source = isCustom ? "_custom" : "_generated";
      return `import { ${m.lowName}Controller } from "./${source}/${m.lowName}.controller";`;
    })
    .join("\n");

  // 2. 生成链式调用语句
  const uses = processedModules
    .map((m) => `  .use(${m.lowName}Controller)`)
    .join("\n");

  const content = `
/**
 * 🤖 【路由挂载器 - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 严禁使用 Object.values 循环挂载，否则会失去 Eden Treaty 类型。
 * 🚀 此文件通过静态链式调用保证完美的类型推断。
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
