// import fs from "node:fs";
// import path from "node:path";
// import { fileURLToPath } from "node:url";
// import * as dbSchema from "../src/table.schema";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // --- 路径配置 ---
// // 1. 契约层 (packages/contract)
// const MODULE_DIR = path.resolve(__dirname, "../src/modules");
// const CONTRACT_GEN_DIR = path.resolve(MODULE_DIR, "generated");
// const CONTRACT_CUSTOM_DIR = path.resolve(MODULE_DIR, "custom");
// const CONTRACT_INDEX_FILE = path.resolve(MODULE_DIR, "index.ts");

// // 2. 服务层 (apps/b2badmin/server/modules)
// const B2B_SERVER_MODULE_DIR = path.resolve(
//   __dirname,
//   "../../../apps/b2badmin/server/modules"
// );
// const B2B_SERVICE_GEN_DIR = path.resolve(B2B_SERVER_MODULE_DIR, "generated");
// const B2B_SERVICE_CUSTOM_DIR = path.resolve(B2B_SERVER_MODULE_DIR, "custom");
// const B2B_SERVICE_INDEX_FILE = path.resolve(B2B_SERVER_MODULE_DIR, "index.ts");

// // 3. 控制器层 (apps/b2badmin/server/controllers)
// const B2B_SERVER_CONTROLLER_DIR = path.resolve(
//   __dirname,
//   "../../../apps/b2badmin/server/controllers"
// );
// const B2B_CONTROLLER_GEN_DIR = path.resolve(
//   B2B_SERVER_CONTROLLER_DIR,
//   "generated"
// );
// const B2B_CONTROLLER_CUSTOM_DIR = path.resolve(
//   B2B_SERVER_CONTROLLER_DIR,
//   "custom"
// );

// // 4. Web 服务层 (apps/web/server/modules)
// const WEB_SERVER_MODULE_DIR = path.resolve(
//   __dirname,
//   "../../../apps/web/server/modules"
// );
// const WEB_SERVICE_GEN_DIR = path.resolve(WEB_SERVER_MODULE_DIR, "generated");
// const WEB_SERVICE_CUSTOM_DIR = path.resolve(WEB_SERVER_MODULE_DIR, "custom");
// const WEB_SERVICE_INDEX_FILE = path.resolve(WEB_SERVER_MODULE_DIR, "index.ts");

// // 5. Web 控制器层 (apps/web/server/controllers)
// const WEB_SERVER_CONTROLLER_DIR = path.resolve(
//   __dirname,
//   "../../../apps/web/server/controllers"
// );
// const WEB_CONTROLLER_GEN_DIR = path.resolve(
//   WEB_SERVER_CONTROLLER_DIR,
//   "generated"
// );
// const WEB_CONTROLLER_CUSTOM_DIR = path.resolve(
//   WEB_SERVER_CONTROLLER_DIR,
//   "custom"
// );

// // --- 🛠️ 辅助函数 ---

// /**
//  * 保持原始驼峰并确保首字母大写 (用于类名)
//  * skuMedia -> SkuMedia
//  */
// function toPascalCase(str: string) {
//   if (!str) return "";
//   return str.charAt(0).toUpperCase() + str.slice(1);
// }

// /**
//  * 确保首字母小写 (用于实例名)
//  * SkuMedia -> skuMedia
//  */
// function toCamelCase(str: string) {
//   if (!str) return "";
//   return str.charAt(0).toLowerCase() + str.slice(1);
// }

// // --- 🛡️ 目录保护：确保所有目录存在 ---
// const ALL_DIRS = [
//   CONTRACT_GEN_DIR,
//   CONTRACT_CUSTOM_DIR,
//   B2B_SERVICE_GEN_DIR,
//   B2B_SERVICE_CUSTOM_DIR,
//   B2B_CONTROLLER_GEN_DIR,
//   B2B_CONTROLLER_CUSTOM_DIR,
//   WEB_SERVICE_GEN_DIR,
//   WEB_SERVICE_CUSTOM_DIR,
//   WEB_CONTROLLER_GEN_DIR,
//   WEB_CONTROLLER_CUSTOM_DIR,
// ];

// ALL_DIRS.forEach((dir) => {
//   if (!fs.existsSync(dir)) {
//     console.log(`📁 正在创建缺失目录: ${dir}`);
//     fs.mkdirSync(dir, { recursive: true });
//   }
// });

// const SYSTEM_FIELDS = ["id", "createdAt", "updatedAt"];

// function generate() {
//   console.log("🛠️ 正在启动全栈自动化引擎...");

//   const tableEntries = Object.entries(dbSchema).filter(([key]) =>
//     key.endsWith("Table")
//   );
//   const processedModules: {
//     lowName: string;
//     capitalized: string;
//     originalKey: string;
//   }[] = [];

//   tableEntries.forEach(([key, table]) => {
//     const rawTableName = key.replace("Table", ""); // 例如 skuMedia
//     const capitalized = toPascalCase(rawTableName); // SkuMedia
//     const lowName = rawTableName.toLowerCase(); // skumedia (用于文件名)
//     const instanceName = toCamelCase(rawTableName); // skuMedia (用于变量名)

//     processedModules.push({ lowName, capitalized, originalKey: key });

//     // --- 1. 生成 Contract (契约) ---
//     const contractContent = `
// import { t } from "elysia";
// import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
// import { ${key} } from "../../table.schema";
// import { PaginationParams, SortParams } from "../../helper/query-types.model";

// const _Select = createSelectSchema(${key});
// const _Insert = createInsertSchema(${key});

// export const ${capitalized}Contract = {
//   Response: _Select,
//   Create: t.Omit(_Insert, [${SYSTEM_FIELDS.map((f) => `"${f}"`).join(", ")}]),
//   Update: createUpdateSchema(${key}),
//   Patch: t.Partial(t.Omit(_Insert, [${SYSTEM_FIELDS.map((f) => `"${f}"`).join(", ")}])),
//   ListQuery: t.Object({
//     ...t.Partial(t.Omit(_Insert, [${SYSTEM_FIELDS.map((f) => `"${f}"`).join(", ")}])).properties,
//     ...PaginationParams.properties,
//     ...SortParams.properties,
//     search: t.Optional(t.String()),
//   }),
//   ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
// } as const;

// export type ${capitalized}DTO = {
//   Response: typeof ${capitalized}Contract.Response.static;
//   Create: typeof ${capitalized}Contract.Create.static;
//   Update: typeof ${capitalized}Contract.Update.static;
//   Patch: typeof ${capitalized}Contract.Patch.static;
//   ListQuery: typeof ${capitalized}Contract.ListQuery.static;
// };`.trim();

//     fs.writeFileSync(
//       path.join(CONTRACT_GEN_DIR, `${lowName}.contract.ts`),
//       `${contractContent}\n`
//     );

//     // --- 2. 生成 B2B Service (基础类) ---
//     const b2bServiceContent = `
// import { ${key} } from "@repo/contract";
// import { ${capitalized}Contract } from "@repo/contract";
// import { BaseService } from "~/lib/base-service";

// export class ${capitalized}BaseService extends BaseService<typeof ${key}, typeof ${capitalized}Contract> {
//     constructor() {
//         super(${key}, ${capitalized}Contract);
//     }
// }
// `.trim();
//     fs.writeFileSync(
//       path.join(B2B_SERVICE_GEN_DIR, `${lowName}.service.ts`),
//       `${b2bServiceContent}\n`
//     );

//     // --- 3. 生成 B2B Controller ---
//     const b2bControllerContent = `
// import { Elysia, t } from "elysia";
// import { ${capitalized}Contract } from "@repo/contract";
// import { ${instanceName}Service } from "~/modules/index";
// import { authGuardMid } from "~/middleware/auth";

// export const ${lowName}Controller = new Elysia({ prefix: "/${lowName}" })
//   .use(authGuardMid)
//   .get("/", ({ query, permissions,auth }) => {
//     if (!permissions.includes("${rawTableName.toUpperCase()}_VIEW")) throw new Error("Forbidden");
//     return ${instanceName}Service.findAll(query,auth);
//   }, {
//     query: ${capitalized}Contract.ListQuery
//   })
//   .post("/", ({ body, permissions,auth }) => {
//     if (!permissions.includes("${rawTableName.toUpperCase()}_CREATE")) throw new Error("Forbidden");
//     return ${instanceName}Service.create(body,auth);
//   }, {
//     body: ${capitalized}Contract.Create
//   })
//   .patch("/:id", ({ params, body, permissions,auth }) => {
//     if (!permissions.includes("${rawTableName.toUpperCase()}_EDIT")) throw new Error("Forbidden");
//     return ${instanceName}Service.update(params.id, body,auth);
//   }, {
//     params: t.Object({ id: t.String() }),
//     body: ${capitalized}Contract.Patch
//   })
//   .delete("/:id", ({ params, permissions,auth }) => {
//     if (!permissions.includes("${rawTableName.toUpperCase()}_DELETE")) throw new Error("Forbidden");
//     return ${instanceName}Service.delete(params.id,auth);
//   }, {
//     params: t.Object({ id: t.String() })
//   });
// `.trim();

//     fs.writeFileSync(
//       path.join(B2B_CONTROLLER_GEN_DIR, `${lowName}.controller.ts`),
//       `${b2bControllerContent}\n`
//     );

//     // --- 4. 生成 Web Service ---
//     const webServiceContent = `
// import { ${key} } from "@repo/contract";
// import { ${capitalized}Contract } from "@repo/contract";
// import { BaseService } from "~/lib/base-service";

// export class ${capitalized}BaseService extends BaseService<typeof ${key}, typeof ${capitalized}Contract> {
//     constructor() {
//         super(${key}, ${capitalized}Contract);
//     }
// }
// `.trim();
//     fs.writeFileSync(
//       path.join(WEB_SERVICE_GEN_DIR, `${lowName}.service.ts`),
//       `${webServiceContent}\n`
//     );

//     // --- 5. 生成 Web Controller ---
//     const webControllerContent = `
// import { Elysia, t } from "elysia";
// import { ${capitalized}Contract } from "@repo/contract";
// import { ${instanceName}Service } from "~/modules/index";
// import { dbPlugin } from "~/db/connection";
// import { siteMiddleware } from "~/middleware/site";

// export const ${lowName}Controller = new Elysia({ prefix: "/${lowName}" })
//   .use(dbPlugin)
//   .use(siteMiddleware)
//   .get("/", ({ query, db, siteId, siteType, tenantId }) => {
//     return ${instanceName}Service.findAll(query, {
//       db,
//       siteId,
//       siteType,
//       tenantId,
//     });
//   }, {
//     query: ${capitalized}Contract.ListQuery,
//     detail: {
//       summary: "获取${capitalized}列表",
//       description: "获取所有${capitalized}的列表信息",
//       tags: ["${capitalized}"]
//     }
//   })
//   .post("/", ({ body, db, siteId, siteType, tenantId }) => {
//     return ${instanceName}Service.create(body, {
//       db,
//       siteId,
//       siteType,
//       tenantId,
//     });
//   }, {
//     body: ${capitalized}Contract.Create,
//     detail: {
//       summary: "创建${capitalized}",
//       description: "创建新的${capitalized}",
//       tags: ["${capitalized}"]
//     }
//   })
//   .patch("/:id", ({ params, body, db, siteId, siteType, tenantId }) => {
//     return ${instanceName}Service.update(params.id, body, {
//       db,
//       siteId,
//       siteType,
//       tenantId,
//     });
//   }, {
//     params: t.Object({ id: t.String() }),
//     body: ${capitalized}Contract.Patch,
//     detail: {
//       summary: "更新${capitalized}",
//       description: "根据ID更新${capitalized}信息",
//       tags: ["${capitalized}"]
//     }
//   })
//   .delete("/:id", ({ params, db, siteId, siteType, tenantId }) => {
//     return ${instanceName}Service.delete(params.id, {
//       db,
//       siteId,
//       siteType,
//       tenantId,
//     });
//   }, {
//     params: t.Object({ id: t.String() }),
//     detail: {
//       summary: "删除${capitalized}",
//       description: "根据ID删除${capitalized}",
//       tags: ["${capitalized}"]
//     }
//   });
// `.trim();

//     fs.writeFileSync(
//       path.join(WEB_CONTROLLER_GEN_DIR, `${lowName}.controller.ts`),
//       `${webControllerContent}\n`
//     );
//   });

//   // --- 6. 生成统一索引 (带 Custom 覆盖逻辑) ---

//   // Contract Index
//   const customContracts = fs
//     .readdirSync(CONTRACT_CUSTOM_DIR)
//     .filter((f) => f.endsWith(".contract.ts"))
//     .map((f) => f.replace(".contract.ts", ""));

//   const contractIndex = processedModules
//     .map((m) => {
//       const source = customContracts.includes(m.lowName)
//         ? "./custom"
//         : "./generated";
//       return `export * from "${source}/${m.lowName}.contract";`;
//     })
//     .join("\n");
//   fs.writeFileSync(
//     CONTRACT_INDEX_FILE,
//     `// 🛡️ 自动生成的契约索引\n${contractIndex}\n`
//   );

//   // B2B Service Index
//   const b2bCustomServices = fs
//     .readdirSync(B2B_SERVICE_CUSTOM_DIR)
//     .filter((f) => f.endsWith(".service.ts"))
//     .map((f) => f.replace(".service.ts", ""));
//   const b2bServiceIndex = processedModules
//     .map((m) => {
//       const instanceName = `${toCamelCase(m.originalKey.replace("Table", ""))}Service`;
//       if (b2bCustomServices.includes(m.lowName)) {
//         return `import { ${m.capitalized}Service } from "./custom/${m.lowName}.service";\nexport const ${instanceName} = new ${m.capitalized}Service();`;
//       }
//       return `import { ${m.capitalized}BaseService } from "./generated/${m.lowName}.service";\nexport const ${instanceName} = new ${m.capitalized}BaseService();`;
//     })
//     .join("\n\n");
//   fs.writeFileSync(
//     B2B_SERVICE_INDEX_FILE,
//     `// 🛡️ 自动生成的 B2B Service 索引\n${b2bServiceIndex}\n`
//   );

//   // B2B Controller Index
//   const b2bCustomControllers = fs
//     .readdirSync(B2B_CONTROLLER_CUSTOM_DIR)
//     .filter((f) => f.endsWith(".controller.ts"))
//     .map((f) => f.replace(".controller.ts", ""));
//   const b2bControllerIndex = processedModules
//     .map((m) => {
//       // 如果 custom 下有同名文件，则引用 custom
//       const source = b2bCustomControllers.includes(m.lowName)
//         ? "./custom"
//         : "./generated";
//       return `export * from "${source}/${m.lowName}.controller";`;
//     })
//     .join("\n");

//   fs.writeFileSync(
//     path.join(B2B_SERVER_CONTROLLER_DIR, "index.ts"),
//     `// 🛡️ 自动生成的 B2B Controller 入口，支持 custom 覆盖\n${b2bControllerIndex}\n`
//   );

//   // Web Service Index
//   const webCustomServices = fs
//     .readdirSync(WEB_SERVICE_CUSTOM_DIR)
//     .filter((f) => f.endsWith(".service.ts"))
//     .map((f) => f.replace(".service.ts", ""));
//   const webServiceIndex = processedModules
//     .map((m) => {
//       const instanceName = `${toCamelCase(m.originalKey.replace("Table", ""))}Service`;
//       if (webCustomServices.includes(m.lowName)) {
//         return `import { ${m.capitalized}Service } from "./custom/${m.lowName}.service";\nexport const ${instanceName} = new ${m.capitalized}Service();`;
//       }
//       return `import { ${m.capitalized}BaseService } from "./generated/${m.lowName}.service";\nexport const ${instanceName} = new ${m.capitalized}BaseService();`;
//     })
//     .join("\n\n");
//   fs.writeFileSync(
//     WEB_SERVICE_INDEX_FILE,
//     `// 🛡️ 自动生成的 Web Service 索引\n${webServiceIndex}\n`
//   );

//   // Web Controller Index
//   const webCustomControllers = fs
//     .readdirSync(WEB_CONTROLLER_CUSTOM_DIR)
//     .filter((f) => f.endsWith(".controller.ts"))
//     .map((f) => f.replace(".controller.ts", ""));
//   const webControllerIndex = processedModules
//     .map((m) => {
//       // 如果 custom 下有同名文件，则引用 custom
//       const source = webCustomControllers.includes(m.lowName)
//         ? "./custom"
//         : "./generated";
//       return `export * from "${source}/${m.lowName}.controller";`;
//     })
//     .join("\n");

//   fs.writeFileSync(
//     path.join(WEB_SERVER_CONTROLLER_DIR, "index.ts"),
//     `// 🛡️ 自动生成的 Web Controller 入口，支持 custom 覆盖\n${webControllerIndex}\n`
//   );

//   console.log(
//     `✅ 同步完成！共处理 ${processedModules.length} 个模块。B2B 和 Web 的代码已生成。优先引用 custom 目录下的自定义实现。`
//   );
// }

// generate();

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
  ${env.name === "WEB" ? "siteId: string;" : "auth: any;"}
  tenantId?: string;
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
}

generate();
