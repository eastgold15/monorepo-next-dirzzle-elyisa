import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as dbSchema from "../src/table.schema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MODULE_DIR = path.resolve(__dirname, "../src/modules");
const GENERATED_DIR = path.resolve(MODULE_DIR, "generated");
const CUSTOM_DIR = path.resolve(MODULE_DIR, "custom");

// 确保目录存在
[GENERATED_DIR, CUSTOM_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const SYSTEM_FIELDS = ["id", "createdAt", "updatedAt"];

function generate() {
  console.log("🔄 开始同步契约...");

  // 1. 生成基础契约到 generated
  const tableEntries = Object.entries(dbSchema).filter(([key]) =>
    key.endsWith("Table")
  );
  const generatedFiles: string[] = [];

  tableEntries.forEach(([key, table]) => {
    const tableName = key.replace("Table", "");
    const capitalized = tableName.charAt(0).toUpperCase() + tableName.slice(1);
    const fileName = `${tableName.toLowerCase()}.contract`;

    const fileContent = `
import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { ${key} } from "../../table.schema";
import { PaginationParams, SortParams } from "../../helper/query-types.t.model";

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

export type ${capitalized}DTO = {
  Response: typeof ${capitalized}Contract.Response.static;
  Create: typeof ${capitalized}Contract.Create.static;
  Update: typeof ${capitalized}Contract.Update.static;
  Patch: typeof ${capitalized}Contract.Patch.static;
  ListQuery: typeof ${capitalized}Contract.ListQuery.static;
  ListResponse: typeof ${capitalized}Contract.ListResponse.static;
};`.trim();

    fs.writeFileSync(
      path.join(GENERATED_DIR, `${fileName}.ts`),
      `${fileContent}\n`
    );
    generatedFiles.push(fileName);
  });

  // 2. 扫描手写的 custom 目录
  const customFiles = fs
    .readdirSync(CUSTOM_DIR)
    .filter((f) => f.endsWith(".ts"))
    .map((f) => f.replace(".ts", ""));

  // 3. 生成入口 index.ts 进行智能合并
  // 逻辑：如果 custom 有，导出 custom；否则导出 generated
  const allModules = Array.from(
    new Set([...generatedFiles, ...customFiles])
  ).sort();

  const indexContent = allModules
    .map((mod) => {
      const isCustom = customFiles.includes(mod);
      const sourceDir = isCustom ? "./custom" : "./generated";
      return `export * from "${sourceDir}/${mod}";`;
    })
    .join("\n");

  fs.writeFileSync(
    path.join(MODULE_DIR, "index.ts"),
    `// 🛡️ 自动生成的入口文件，支持 custom 覆盖 generated\n${indexContent}\n`
  );

  console.log(
    `✨ 完成！共 ${generatedFiles.length} 基础, ${customFiles.length} 自定义。优先引用 custom。`
  );
}

generate();
