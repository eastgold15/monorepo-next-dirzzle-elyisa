// Quotation Item module TypeBox type definitions
// Replaces Zod with TypeBox for runtime validation and type safety

/**
 * 询价单明细（Quotation Item）Model定义
 * 在 contract 包中定义，供前后端共享
 */

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { t } from "elysia";
import { quotationItemsTable } from "~/table.schema";
import { PaginationParams, SortParams } from "../helper/query-types.t.model";

// === 基础 Schema ===
const Insert = createInsertSchema(quotationItemsTable);
const UpdateBase = createUpdateSchema(quotationItemsTable);
const Select = createSelectSchema(quotationItemsTable);

// === 业务 Schema ===
const Create = t.Omit(Insert, ["id", "createdAt", "updatedAt"]);

const Update = t.Omit(UpdateBase, ["id", "createdAt", "updatedAt"]);

const Patch = t.Partial(t.Omit(UpdateBase, ["id", "createdAt", "updatedAt"]));

const BusinessQuery = t.Object({
  quotationId: t.Optional(t.String()),
  productId: t.Optional(t.String()),
  factoryId: t.Optional(t.String()),
  search: t.Optional(t.String()),
});

const ListQuery = t.Object({
  ...BusinessQuery.properties,
  ...PaginationParams.properties,
  ...SortParams.properties,
});

const Entity = t.Object({
  ...Select.properties,
  quotation: t.Optional(t.Any()),
  product: t.Optional(t.Any()),
  factory: t.Optional(t.Any()),
});

// === 特殊业务 Schema ===
const BatchDelete = t.Object({
  ids: t.Array(t.String(), { minItems: 1 }),
});

const BatchUpdate = t.Object({
  ids: t.Array(t.String(), { minItems: 1 }),
  data: Patch,
});

// === 1. 运行时 Schema 集合（值）===
export const QuotationItemTModel = {
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
export type QuotationItemTModel = {
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
  BatchUpdate: typeof BatchUpdate.static;
};
