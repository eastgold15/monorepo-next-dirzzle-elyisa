import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { PaginationParams, SortParams } from "../helper/query-types";
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
const TemplateCreate = TemplateInsert.omit({
  id: true,
  createdAt: true,
});

const TemplateUpdate = TemplateUpdateBase.omit({
  id: true,
  createdAt: true,
});

const TemplatePatch = TemplateUpdateBase.omit({
  id: true,
  createdAt: true,
}).partial();

const TemplateBusinessQuery = z.object({
  categoryId: z.string().optional(),
  name: z.string().optional(),
  search: z.string().optional(),
});

const TemplateListQuery = TemplateBusinessQuery.extend(
  PaginationParams.shape
).extend(SortParams.shape);

const TemplateEntity = TemplateSelect;

// === 1. 运行时 Schema 集合（值）===
export const AttributeTemplateModel = {
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
export type AttributeTemplateModel = {
  Insert: z.infer<typeof TemplateInsert>;
  Update: z.infer<typeof TemplateUpdate>;
  Select: z.infer<typeof TemplateSelect>;
  Create: z.infer<typeof TemplateCreate>;
  Patch: z.infer<typeof TemplatePatch>;
  ListQuery: z.infer<typeof TemplateListQuery>;
  Entity: z.infer<typeof TemplateEntity>;
  BusinessQuery: z.infer<typeof TemplateBusinessQuery>;
};

// ============================================================================
// 属性相关 Schema 和类型定义
// ============================================================================

// === 基础 Schema ===
const Insert = createInsertSchema(attributeTable);
const UpdateBase = createUpdateSchema(attributeTable);
const Select = createSelectSchema(attributeTable);

// === 业务 Schema ===
const Create = Insert.omit({
  id: true,
  createdAt: true,
});

const Update = UpdateBase.omit({
  id: true,
  createdAt: true,
});

const Patch = UpdateBase.omit({
  id: true,
  createdAt: true,
}).partial();

const BusinessQuery = z.object({
  templateId: z.string().optional(),
  name: z.string().optional(),
  search: z.string().optional(),
  inputType: z.enum(["select", "text", "number"]).optional(),
});

const ListQuery = BusinessQuery.extend(PaginationParams.shape).extend(
  SortParams.shape
);

const Entity = Select.extend({
  values: z.array(z.any()).optional(), // 关联属性值
});

// === 1. 运行时 Schema 集合（值）===
export const AttributeModel = {
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
export type AttributeModel = {
  Insert: z.infer<typeof Insert>;
  Update: z.infer<typeof Update>;
  Select: z.infer<typeof Select>;
  Create: z.infer<typeof Create>;
  Patch: z.infer<typeof Patch>;
  ListQuery: z.infer<typeof ListQuery>;
  Entity: z.infer<typeof Entity>;
  BusinessQuery: z.infer<typeof BusinessQuery>;
};

// ============================================================================
// 属性值相关 Schema 和类型定义
// ============================================================================

// === 基础 Schema ===
const ValueInsert = createInsertSchema(attributeValueTable);
const ValueUpdateBase = createUpdateSchema(attributeValueTable);
const ValueSelect = createSelectSchema(attributeValueTable);

// === 业务 Schema ===
const ValueCreate = ValueInsert.omit({
  id: true,
  createdAt: true,
}).extend({
  value: z.string().min(1, "属性值不能为空"),
  valueCode: z.string().min(1, "值编码不能为空"),
});

const ValueUpdate = ValueUpdateBase.omit({
  id: true,
  createdAt: true,
});

const ValuePatch = ValueUpdateBase.omit({
  id: true,
  createdAt: true,
}).partial();

const ValueBusinessQuery = z.object({
  attributeId: z.string().optional(),
  value: z.string().optional(),
  search: z.string().optional(),
});

const ValueListQuery = ValueBusinessQuery.extend(PaginationParams.shape).extend(
  SortParams.shape
);

const ValueEntity = ValueSelect.extend({
  attribute: z.any().optional(), // 关联属性信息
});

// === 1. 运行时 Schema 集合（值）===
export const AttributeValueModel = {
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
export type AttributeValueModel = {
  Insert: z.infer<typeof ValueInsert>;
  Update: z.infer<typeof ValueUpdate>;
  Select: z.infer<typeof ValueSelect>;
  Create: z.infer<typeof ValueCreate>;
  Patch: z.infer<typeof ValuePatch>;
  ListQuery: z.infer<typeof ValueListQuery>;
  Entity: z.infer<typeof ValueEntity>;
  BusinessQuery: z.infer<typeof ValueBusinessQuery>;
};
