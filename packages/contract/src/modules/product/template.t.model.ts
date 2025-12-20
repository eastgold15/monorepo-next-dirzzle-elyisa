// Attribute Template module TypeBox type definitions
// Replaces Zod with TypeBox for runtime validation and type safety

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { t } from "elysia";
import { attributeTemplateTable } from "../../table.schema";
import { PaginationParams, SortParams } from "../helper/query-types.t.model";

// ============================================================================
// 属性模板相关 Schema 和类型定义
// ============================================================================

// === 基础 Schema ===
const Insert = createInsertSchema(attributeTemplateTable);
const UpdateBase = createUpdateSchema(attributeTemplateTable);
const Select = createSelectSchema(attributeTemplateTable);

// === 业务 Schema ===
const Create = t.Omit(Insert, ["id", "createdAt"]);

const Update = t.Omit(UpdateBase, ["id", "createdAt"]);

const Patch = t.Partial(t.Omit(UpdateBase, ["id", "createdAt"]));

const BusinessQuery = t.Object({
  categoryId: t.Optional(t.String()),
  name: t.Optional(t.String()),
  search: t.Optional(t.String()),
});

const ListQuery = t.Object({
  ...BusinessQuery.properties,
  ...PaginationParams.properties,
  ...SortParams.properties,
});

const Entity = Select;

// === 1. 运行时 Schema 集合（值）===
export const AttributeTemplateTModel = {
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
export type AttributeTemplateTModel = {
  Insert: typeof Insert.static;
  Update: typeof Update.static;
  Select: typeof Select.static;
  Create: typeof Create.static;
  Patch: typeof Patch.static;
  ListQuery: typeof ListQuery.static;
  Entity: typeof Entity.static;
  BusinessQuery: typeof BusinessQuery.static;
};
