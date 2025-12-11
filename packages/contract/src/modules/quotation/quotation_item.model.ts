/**
 * 询价单明细（Quotation Item）Model定义
 * 在 contract 包中定义，供前后端共享
 */

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { PaginationParams, SortParams } from "../helper/query-types";
import { quotationItemsTable } from "./quotation_item.schema";

// === 基础 Schema ===
const Insert = createInsertSchema(quotationItemsTable);
const UpdateBase = createUpdateSchema(quotationItemsTable);
const Select = createSelectSchema(quotationItemsTable);

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
  quotationId: z.string().optional(),
  productId: z.string().optional(),
  factoryId: z.string().optional(),
  search: z.optional(z.coerce.string()),
});

const ListQuery = BusinessQuery.extend(PaginationParams.shape).extend(
  SortParams.shape
);

const Entity = Select.extend({
  quotation: z.any().optional(),
  product: z.any().optional(),
  factory: z.any().optional(),
});

// === 特殊业务 Schema ===
const BatchDelete = z.object({
  ids: z.array(z.string()).min(1, "至少选择一个询价单明细"),
});

const BatchUpdate = z.object({
  ids: z.array(z.string()).min(1, "至少选择一个询价单明细"),
  data: Patch,
});

// === 1. 运行时 Schema 集合（值）===
export const QuotationItemModel = {
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
  BatchUpdate,
} as const;

// === 2. 编译时类型集合（类型）===
export type QuotationItemModel = {
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
  BatchUpdate: z.infer<typeof BatchUpdate>;
};
