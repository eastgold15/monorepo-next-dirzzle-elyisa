import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as dbSchema from "../src/table.schema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.resolve(__dirname, "../src/modules/generated");

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const SYSTEM_FIELDS = ["id", "createdAt", "updatedAt"];

function generate() {
    console.log("🚀 开始生成契约...");
    let count = 0;

    Object.entries(dbSchema).forEach(([key, table]) => {
        // 改进后的判断：变量名包含 Table，且是一个对象
        const isTable = key.endsWith("Table") && typeof table === "object" && table !== null;

        if (isTable) {
            const tableName = key.replace("Table", "");
            const capitalized = tableName.charAt(0).toUpperCase() + tableName.slice(1);

            const fileContent = `
import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { ${key} } from "../../table.schema";
import { PaginationParams, SortParams } from "../../helper/query-types.t.model";

// 1. 基础 Drizzle 派生 (drizzle-typebox 原生提供的三个)
const _Select = createSelectSchema(${key});
const _Insert = createInsertSchema(${key});
const _UpdateBase = createUpdateSchema(${key});

// 2. 业务派生 (我们多加的一个：Patch 类型，支持极简的部分更新)
const _Patch = t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]));

export const ${capitalized}Contract = {
  Response: _Select,
  Create: t.Omit(_Insert, ["id", "createdAt", "updatedAt"]),
  Update: _UpdateBase,
  Patch: _Patch, // ✨ 这是我们新增的第四个
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({
    data: t.Array(_Select),
    total: t.Number(),
  }),
} as const;

export type ${capitalized}DTO = {
  Response: typeof ${capitalized}Contract.Response.static;
  Create: typeof ${capitalized}Contract.Create.static;
  Update: typeof ${capitalized}Contract.Update.static;
  Patch: typeof ${capitalized}Contract.Patch.static;
  ListQuery: typeof ${capitalized}Contract.ListQuery.static;
};
`;


            fs.writeFileSync(path.join(OUTPUT_DIR, `${tableName.toLowerCase()}.contract.ts`), fileContent);
            console.log(`✅ 契约已生成: ${capitalized} (${key})`);
            count++;
        }
    });

    console.log(`\n✨ 完成！共生成 ${count} 个契约文件。`);
}

generate();