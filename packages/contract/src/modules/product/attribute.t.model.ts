// Attribute module TypeBox type definitions
// Replaces Zod with TypeBox for runtime validation and type safety

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { t } from "elysia";
import { PaginationParams, SortParams } from "../helper/query-types.t.model";
import {
  attributeTable,
  attributeTemplateTable,
  attributeValueTable,
} from "./attribute.schema";

// ============================================================================
// 属性模板相关 Schema 和类型定义
// ============================================================================

// === 基础 Schema ===
const TemplateInsert = createInsertSchema(attributeTemplateTable);
const TemplateUpdateBase = createUpdateSchema(attributeTemplateTable);
const TemplateSelect = createSelectSchema(attributeTemplateTable);

// === 业务 Schema ===
const TemplateCreate = t.Omit(TemplateInsert, ["id", "createdAt"]);

const TemplateUpdate = t.Omit(TemplateUpdateBase, ["id", "createdAt"]);

const TemplatePatch = t.Partial(
  t.Omit(TemplateUpdateBase, ["id", "createdAt"])
);

const TemplateBusinessQuery = t.Object({
  categoryId: t.Optional(t.String()),
  name: t.Optional(t.String()),
  search: t.Optional(t.String()),
});

const TemplateListQuery = t.Object({
  ...TemplateBusinessQuery.properties,
  ...PaginationParams.properties,
  ...SortParams.properties,
});

const TemplateEntity = TemplateSelect;

// === 1. 运行时 Schema 集合（值）===
export const AttributeTemplateTModel = {
  Insert: TemplateInsert,
  Update: TemplateUpdate,
  Select: TemplateSelect,
  Create: TemplateCreate,
  Patch: TemplatePatch,
  ListQuery: TemplateListQuery,
  Entity: TemplateEntity,
  BusinessQuery: TemplateBusinessQuery,
} as const;

// === 2. 编译时类型集合（类型）===
export type AttributeTemplateTModel = {
  Insert: typeof TemplateInsert.static;
  Update: typeof TemplateUpdate.static;
  Select: typeof TemplateSelect.static;
  Create: typeof TemplateCreate.static;
  Patch: typeof TemplatePatch.static;
  ListQuery: typeof TemplateListQuery.static;
  Entity: typeof TemplateEntity.static;
  BusinessQuery: typeof TemplateBusinessQuery.static;
};

// ============================================================================
// 属性相关 Schema 和类型定义
// ============================================================================

// === 基础 Schema ===
const Insert = createInsertSchema(attributeTable);
const UpdateBase = createUpdateSchema(attributeTable);
const Select = createSelectSchema(attributeTable);

// === 业务 Schema ===
const Create = t.Omit(Insert, ["id", "createdAt"]);

const Update = t.Omit(UpdateBase, ["id", "createdAt"]);

const Patch = t.Partial(t.Omit(UpdateBase, ["id", "createdAt"]));

const BusinessQuery = t.Object({
  templateId: t.Optional(t.String()),
  name: t.Optional(t.String()),
  search: t.Optional(t.String()),
  inputType: t.Optional(t.UnionEnum(["select", "text", "number"])),
});

const ListQuery = t.Object({
  ...BusinessQuery.properties,
  ...PaginationParams.properties,
  ...SortParams.properties,
});

const Entity = t.Object({
  ...Select.properties,
  values: t.Optional(t.Array(t.Any())), // 关联属性值
});

// === 1. 运行时 Schema 集合（值）===
export const AttributeTModel = {
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
export type AttributeTModel = {
  Insert: typeof Insert.static;
  Update: typeof Update.static;
  Select: typeof Select.static;
  Create: typeof Create.static;
  Patch: typeof Patch.static;
  ListQuery: typeof ListQuery.static;
  Entity: typeof Entity.static;
  BusinessQuery: typeof BusinessQuery.static;
};

// ============================================================================
// 属性值相关 Schema 和类型定义
// ============================================================================

// === 基础 Schema ===
const ValueInsert = createInsertSchema(attributeValueTable);
const ValueUpdateBase = createUpdateSchema(attributeValueTable);
const ValueSelect = createSelectSchema(attributeValueTable);

// === 业务 Schema ===
const ValueCreate = t.Object({
  ...t.Omit(ValueInsert, ["id", "createdAt"]).properties,
  value: t.String({ minLength: 1 }),
  valueCode: t.String({ minLength: 1 }),
});

const ValueUpdate = t.Omit(ValueUpdateBase, ["id", "createdAt"]);

const ValuePatch = t.Partial(t.Omit(ValueUpdateBase, ["id", "createdAt"]));

const ValueBusinessQuery = t.Object({
  attributeId: t.Optional(t.String()),
  value: t.Optional(t.String()),
  search: t.Optional(t.String()),
});

const ValueListQuery = t.Object({
  ...ValueBusinessQuery.properties,
  ...PaginationParams.properties,
  ...SortParams.properties,
});

const ValueEntity = t.Object({
  ...ValueSelect.properties,
  attribute: t.Optional(t.Any()), // 关联属性信息
});

// === 1. 运行时 Schema 集合（值）===
export const AttributeValueTModel = {
  Insert: ValueInsert,
  Update: ValueUpdate,
  Select: ValueSelect,
  Create: ValueCreate,
  Patch: ValuePatch,
  ListQuery: ValueListQuery,
  Entity: ValueEntity,
  BusinessQuery: ValueBusinessQuery,
} as const;

// === 2. 编译时类型集合（类型）===
export type AttributeValueTModel = {
  Insert: typeof ValueInsert.static;
  Update: typeof ValueUpdate.static;
  Select: typeof ValueSelect.static;
  Create: typeof ValueCreate.static;
  Patch: typeof ValuePatch.static;
  ListQuery: typeof ValueListQuery.static;
  Entity: typeof ValueEntity.static;
  BusinessQuery: typeof ValueBusinessQuery.static;
};
