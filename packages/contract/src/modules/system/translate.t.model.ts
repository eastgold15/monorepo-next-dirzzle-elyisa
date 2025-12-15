// Translation module TypeBox type definitions
// Replaces Zod with TypeBox for runtime validation and type safety

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { t } from "elysia";
import { translationDictTable } from "../../table.schema";
import { PaginationParams, SortParams } from "../helper/query-types.t.model";

// === 枚举 ===
const TranslationLanguage = t.UnionEnum(["zh-CN", "en-US"]);
const TranslationCategory = t.UnionEnum([
  "general",
  "product",
  "category",
  "user",
  "system",
]);

// === 基础 Schema ===
const Insert = createInsertSchema(translationDictTable);
const Update = createUpdateSchema(translationDictTable);
const Select = createSelectSchema(translationDictTable);

// === 业务 Schema ===
const Create = t.Omit(Insert, ["id", "createdAt", "updatedAt"]);

const Patch = t.Partial(t.Omit(Update, ["id", "createdAt", "updatedAt"]));

const BusinessQuery = t.Object({
  key: t.Optional(t.String()),
  category: t.Optional(TranslationCategory),
  isActive: t.Optional(t.Boolean()),
  search: t.Optional(t.String()),
  fields: t.Optional(t.String()),
});

const ListQuery = t.Object({
  ...BusinessQuery.properties,
  ...PaginationParams.properties,
  ...SortParams.properties,
});

const Entity = t.Object({
  ...Select.properties,
  translations: t.Record(t.String(), t.String()), // 确保返回的对象格式
});

const FormUpsert = t.Object({
  ...Create.properties,
  translations: t.String(), // JSON字符串格式，便于表单处理
});

const BatchImport = t.Object({
  items: t.Array(
    t.Object({
      key: t.String(),
      category: TranslationCategory,
      translations: t.Record(t.String(), t.String()),
      isActive: t.Optional(t.Boolean({ default: true })),
    })
  ),
});

const ExportQuery = t.Object({
  category: t.Optional(TranslationCategory),
  language: t.Optional(TranslationLanguage),
  format: t.Optional(t.UnionEnum(["json", "csv", "xlsx"], { default: "json" })),
});

// === 1. 运行时 Schema 集合（值）===
export const TranslationDictTModel = {
  Insert,
  Update,
  Select,
  Create,
  Patch,
  ListQuery,
  Entity,
  FormUpsert,
  BatchImport,
  ExportQuery,
  TranslationLanguage,
  TranslationCategory,
  BusinessQuery,
} as const;

// === 2. 编译时类型集合（类型）===
export type TranslationDictTModel = {
  Insert: typeof Insert.static;
  Update: typeof Update.static;
  Select: typeof Select.static;
  Create: typeof Create.static;
  Patch: typeof Patch.static;
  ListQuery: typeof ListQuery.static;
  Entity: typeof Entity.static;
  FormUpsert: typeof FormUpsert.static;
  BatchImport: typeof BatchImport.static;
  ExportQuery: typeof ExportQuery.static;
  TranslationLanguage: typeof TranslationLanguage.static;
  TranslationCategory: typeof TranslationCategory.static;
  BusinessQuery: typeof BusinessQuery.static;
};
