// Attribute Value module TypeBox type definitions
// Replaces Zod with TypeBox for runtime validation and type safety

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { t } from "elysia";
import {
  attributeValueTable,
} from "../../table.schema";
import { PaginationParams, SortParams } from "../helper/query-types.t.model";

// ============================================================================
// 属性值相关 Schema 和类型定义
// ============================================================================

// === 基础 Schema ===
const Insert = createInsertSchema(attributeValueTable);
const UpdateBase = createUpdateSchema(attributeValueTable);
const Select = createSelectSchema(attributeValueTable);

// === 业务 Schema ===
const Create = t.Object({
  ...t.Omit(Insert, ["id", "createdAt"]).properties,
  value: t.String({ minLength: 1 }),
  valueCode: t.String({ minLength: 1 }),
});

const Update = t.Omit(UpdateBase, ["id", "createdAt"]);

const Patch = t.Partial(t.Omit(UpdateBase, ["id", "createdAt"]));

const BusinessQuery = t.Object({
  attributeId: t.Optional(t.String()),
  value: t.Optional(t.String()),
  search: t.Optional(t.String()),
});

const ListQuery = t.Object({
  ...BusinessQuery.properties,
  ...PaginationParams.properties,
  ...SortParams.properties,
});

const Entity = t.Object({
  ...Select.properties,
  attribute: t.Optional(t.Any()), // 关联属性信息
});

// === 1. 运行时 Schema 集合（值）===
export const AttributeValueTModel = {
  Insert,
  Update,
  Select,
  Create,
  Patch,
  ListQuery,
  Entity,
  BusinessQuery,
} as const;

// === 2. 编译时类型集合（类型）===
export type AttributeValueTModel = {
  Insert: typeof Insert.static;
  Update: typeof Update.static;
  Select: typeof Select.static;
  Create: typeof Create.static;
  Patch: typeof Patch.static;
  ListQuery: typeof ListQuery.static;
  Entity: typeof Entity.static;
  BusinessQuery: typeof BusinessQuery.static;
};