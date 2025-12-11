import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { PaginationParams, SortParams } from "../helper/query-types";
import { siteConfigTable } from "./site-config.schema";

// === 基础 Schema ===
const Insert = createInsertSchema(siteConfigTable, {
  key: z
    .string()
    .min(1, "配置键名不能为空")
    .max(100, "配置键名不能超过100个字符"),
  category: z.string().min(1, "配置分类不能为空"),
});

const UpdateBase = createUpdateSchema(siteConfigTable);

const Select = createSelectSchema(siteConfigTable);

// === 业务 Schema ===
const Create = Insert.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const Update = UpdateBase.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const Patch = UpdateBase.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();
const toBoolean = (val: string | undefined): boolean | undefined => {
  if (val === undefined) return;
  if (val === "true" || val === "1") return true;
  if (val === "false" || val === "0") return false;
  return;
};
const BusinessQuery = z.object({
  category: z.string().optional(),
  key: z.string().optional(),
  search: z.string().optional(),
  visible: z.string().transform(toBoolean).optional(),
});

const ListQuery = BusinessQuery.extend(PaginationParams.shape).extend(
  SortParams.shape
);

const CategoryQuery = z.object({
  category: z.string(),
});

const KeysQuery = z.object({
  keys: z.array(z.string()),
});

const BatchUpdate = z.array(
  z.object({
    key: z.string(),
    value: z.string(),
  })
);

const Entity = Select;

// === 1. 运行时 Schema 集合（值）===
export const SiteConfigModel = {
  Insert,
  Update,
  Select,
  Create,
  Patch,
  ListQuery,
  CategoryQuery,
  KeysQuery,
  BatchUpdate,
  Entity,
  BusinessQuery,
} as const;

// === 2. 编译时类型集合（类型）===
export type SiteConfigModel = {
  Insert: z.infer<typeof Insert>;
  Update: z.infer<typeof Update>;
  Select: z.infer<typeof Select>;
  Create: z.infer<typeof Create>;
  Patch: z.infer<typeof Patch>;
  ListQuery: z.infer<typeof ListQuery>;
  CategoryQuery: z.infer<typeof CategoryQuery>;
  KeysQuery: z.infer<typeof KeysQuery>;
  BatchUpdate: z.infer<typeof BatchUpdate>;
  Entity: z.infer<typeof Entity>;
  BusinessQuery: z.infer<typeof BusinessQuery>;
};
