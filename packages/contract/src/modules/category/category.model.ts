import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { PaginationParams, SortParams } from "../helper/query-types";
import { categoriesTable } from "./category.schema";

// === 基础 Schema ===
const Insert = createInsertSchema(categoriesTable);
const UpdateBase = createUpdateSchema(categoriesTable);
const Select = createSelectSchema(categoriesTable);

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

const BusinessQuery = z.object({
  search: z.string().optional(),
  parentId: z.string().optional(),
  isVisible: z.boolean().optional(),
});

const ListQuery = BusinessQuery.extend(PaginationParams.shape).extend(
  SortParams.shape
);

const TreeQuery = z.object({
  includeInvisible: z.boolean().optional(),
});

const Entity = Select;
// 翻译后的实体（用于前端展示）
const Entityone = Select;

// === 1. 运行时 Schema 集合（值）===
export const CategoryModel = {
  Insert,
  Update,
  Select,
  Create,
  Patch,
  ListQuery,
  TreeQuery,
  Entity,
  Entityone,
  BusinessQuery,
} as const;

// === 2. 编译时类型集合（类型）===
export type CategoryModel = {
  Insert: z.infer<typeof Insert>;
  Update: z.infer<typeof Update>;
  Select: z.infer<typeof Select>;
  Create: z.infer<typeof Create>;
  Patch: z.infer<typeof Patch>;
  ListQuery: z.infer<typeof ListQuery>;
  TreeQuery: z.infer<typeof TreeQuery>;
  Entity: z.infer<typeof Entity>;
  Entityone: z.infer<typeof Entityone>;
  BusinessQuery: z.infer<typeof BusinessQuery>;
};
