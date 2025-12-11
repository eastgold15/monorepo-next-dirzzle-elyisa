import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { PaginationParams, SortParams } from "../helper/query-types";
import { translationDictTable } from "./translate.schema";

// === 枚举 ===
const TranslationLanguage = z.enum(["zh-CN", "en-US"]);
const TranslationCategory = z.enum([
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
const Create = Insert.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const Patch = Update.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

const BusinessQuery = z.object({
  key: z.string().optional(),
  category: TranslationCategory.optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  fields: z.string().optional(),
});

const ListQuery = BusinessQuery.extend(PaginationParams.shape).extend(
  SortParams.shape
);

const Entity = Select.extend({
  translations: z.record(z.string(), z.string()), // 确保返回的对象格式
});

const FormUpsert = Create.extend({
  translations: z.string(), // JSON字符串格式，便于表单处理
});

const BatchImport = z.object({
  items: z.array(
    z.object({
      key: z.string(),
      category: TranslationCategory,
      translations: z.record(z.string(), z.string()),
      isActive: z.boolean().default(true),
    })
  ),
});

const ExportQuery = z.object({
  category: TranslationCategory.optional(),
  language: TranslationLanguage.optional(),
  format: z.enum(["json", "csv", "xlsx"]).default("json"),
});

// === 1. 运行时 Schema 集合（值）===
export const TranslationDictModel = {
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
export type TranslationDictModel = {
  Insert: z.infer<typeof Insert>;
  Update: z.infer<typeof Update>;
  Select: z.infer<typeof Select>;
  Create: z.infer<typeof Create>;
  Patch: z.infer<typeof Patch>;
  ListQuery: z.infer<typeof ListQuery>;
  Entity: z.infer<typeof Entity>;
  FormUpsert: z.infer<typeof FormUpsert>;
  BatchImport: z.infer<typeof BatchImport>;
  ExportQuery: z.infer<typeof ExportQuery>;
  TranslationLanguage: z.infer<typeof TranslationLanguage>;
  TranslationCategory: z.infer<typeof TranslationCategory>;
  BusinessQuery: z.infer<typeof BusinessQuery>;
};
