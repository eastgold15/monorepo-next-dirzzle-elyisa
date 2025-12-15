// Quotation module TypeBox type definitions
// Replaces Zod with TypeBox for runtime validation and type safety

/**
 * 询价单（Quotation）Model定义
 * 在 contract 包中定义，供前后端共享
 */

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { t } from "elysia";
import { quotationsTable } from "~/table.schema";
import { PaginationParams, SortParams } from "../helper/query-types.t.model";

// === 基础 Schema ===
const Insert = createInsertSchema(quotationsTable);
const UpdateBase = createUpdateSchema(quotationsTable);
const Select = createSelectSchema(quotationsTable);

// === 业务 Schema ===
const Create = t.Omit(Insert, ["id", "createdAt", "updatedAt"]);

const Update = t.Omit(UpdateBase, ["id", "createdAt", "updatedAt"]);

const Patch = t.Partial(t.Omit(UpdateBase, ["id", "createdAt", "updatedAt"]));

const BusinessQuery = t.Object({
  refNo: t.Optional(t.String()),
  clientId: t.Optional(t.String()),
  exporterId: t.Optional(t.String()),
  salespersonId: t.Optional(t.String()),
  status: t.Optional(t.String()),
  dateFrom: t.Optional(t.Date()),
  dateTo: t.Optional(t.Date()),
  search: t.Optional(t.String()),
});

const ListQuery = t.Object({
  ...BusinessQuery.properties,
  ...PaginationParams.properties,
  ...SortParams.properties,
});

const Entity = t.Object({
  ...Select.properties,
  client: t.Optional(t.Any()),
  exporter: t.Optional(t.Any()),
  salesperson: t.Optional(t.Any()),
  itemCount: t.Optional(t.Number({ default: 0 })),
  totalAmount: t.Optional(t.Number({ default: 0 })),
});

// === 枚举定义 ===
export const QuotationStatusEnum = t.UnionEnum([
  "draft",
  "confirmed",
  "signed",
  "cancelled",
  "expired",
]);

// === 特殊业务 Schema ===
const BatchDelete = t.Object({
  ids: t.Array(t.String(), { minItems: 1 }),
});

const StatusUpdate = t.Object({
  id: t.String(),
  status: t.UnionEnum(["draft", "confirmed", "signed", "cancelled", "expired"]),
});

const SignQuotation = t.Object({
  id: t.String(),
  buyerSignature: t.String(),
  sellerSignature: t.String(),
  signedDate: t.Date(),
});

// === 1. 运行时 Schema 集合（值）===
export const QuotationTModel = {
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
export type QuotationTModel = {
  Insert: typeof Insert.static;
  UpdateBase: typeof UpdateBase.static;
  Update: typeof Update.static;
  Select: typeof Select.static;
  Create: typeof Create.static;
  Patch: typeof Patch.static;
  BusinessQuery: typeof BusinessQuery.static;
  ListQuery: typeof ListQuery.static;
  Entity: typeof Entity.static;
  BatchDelete: typeof BatchDelete.static;
  StatusUpdate: typeof StatusUpdate.static;
  SignQuotation: typeof SignQuotation.static;
  QuotationStatusEnum: typeof QuotationStatusEnum.static;
};
