/**
 * 询价单（Quotation）Model定义
 * 在 contract 包中定义，供前后端共享
 */

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { PaginationParams, SortParams } from "../helper/query-types";
import { quotationsTable } from "./quotation.schema";

// === 基础 Schema ===
const Insert = createInsertSchema(quotationsTable);
const UpdateBase = createUpdateSchema(quotationsTable);
const Select = createSelectSchema(quotationsTable);

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
  refNo: z.coerce.string().optional(),
  clientId: z.string().optional(),
  exporterId: z.string().optional(),
  salespersonId: z.string().optional(),
  status: z.coerce.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  search: z.optional(z.coerce.string()),
});

const ListQuery = BusinessQuery.extend(PaginationParams.shape).extend(
  SortParams.shape
);

const Entity = Select.extend({
  client: z.any().optional(),
  exporter: z.any().optional(),
  salesperson: z.any().optional(),
  itemCount: z.number().default(0),
  totalAmount: z.number().default(0),
});

// === 枚举定义 ===
export const QuotationStatusEnum = z.enum([
  "draft",
  "confirmed",
  "signed",
  "cancelled",
  "expired",
]);

// === 特殊业务 Schema ===
const BatchDelete = z.object({
  ids: z.array(z.string()).min(1, "至少选择一个询价单"),
});

const StatusUpdate = z.object({
  id: z.string(),
  status: z.enum(["draft", "confirmed", "signed", "cancelled", "expired"]),
});

const SignQuotation = z.object({
  id: z.string(),
  buyerSignature: z.string(),
  sellerSignature: z.string(),
  signedDate: z.coerce.date(),
});

// === 1. 运行时 Schema 集合（值）===
export const QuotationModel = {
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
  StatusUpdate,
  SignQuotation,
  QuotationStatusEnum,
} as const;

// === 2. 编译时类型集合（类型）===
export type QuotationModel = {
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
  StatusUpdate: z.infer<typeof StatusUpdate>;
  SignQuotation: z.infer<typeof SignQuotation>;
  QuotationStatusEnum: z.infer<typeof QuotationStatusEnum>;
};
