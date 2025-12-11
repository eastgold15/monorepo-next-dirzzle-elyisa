/**
 * 客户（Client）Model定义
 * 在 contract 包中定义，供前后端共享
 */

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { PaginationParams, SortParams } from "../helper/query-types";
import { CustomerTable } from "./customer.schema";

// === 基础 Schema ===
const Insert = createInsertSchema(CustomerTable);
const UpdateBase = createUpdateSchema(CustomerTable);
const Select = createSelectSchema(CustomerTable);

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
  companyName: z.coerce.string().optional(),
  contactName: z.coerce.string().optional(),
  email: z.coerce.string().optional(),
  country: z.coerce.string().optional(),
  search: z.optional(z.coerce.string()),
});

const ListQuery = BusinessQuery.extend(PaginationParams.shape).extend(
  SortParams.shape
);

const Entity = Select;

// === 枚举定义 ===
export const ClientTypeEnum = z.enum(["individual", "company", "government"]);

// === 特殊业务 Schema ===
const BatchDelete = z.object({
  ids: z.array(z.string()).min(1, "至少选择一个客户"),
});

// === 1. 运行时 Schema 集合（值）===
export const ClientModel = {
  Insert,
  UpdateBase,
  Update,
  Select,
  Create,
  Patch,
  BusinessQuery,
  ListQuery,
  Entity,
  BatchDelete,
  ClientTypeEnum,
} as const;

// === 2. 编译时类型集合（类型）===
export type ClientModel = {
  Insert: z.infer<typeof Insert>;
  UpdateBase: z.infer<typeof UpdateBase>;
  Update: z.infer<typeof Update>;
  Select: z.infer<typeof Select>;
  Create: z.infer<typeof Create>;
  Patch: z.infer<typeof Patch>;
  BusinessQuery: z.infer<typeof BusinessQuery>;
  ListQuery: z.infer<typeof ListQuery>;
  Entity: z.infer<typeof Entity>;
  BatchDelete: z.infer<typeof BatchDelete>;
  ClientTypeEnum: z.infer<typeof ClientTypeEnum>;
};
