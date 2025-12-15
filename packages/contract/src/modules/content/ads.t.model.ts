// Ads module TypeBox type definitions
// Replaces Zod with TypeBox for runtime validation and type safety

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { t } from "elysia";
import { adsTable } from "~/table.schema";
import { PaginationParams, SortParams } from "../helper/query-types.t.model";

// === 基础 Schema ===
const Insert = createInsertSchema(adsTable);
const UpdateBase = createUpdateSchema(adsTable);
const Select = createSelectSchema(adsTable);

// === 业务 Schema ===

// Create ads - 排除自动生成的字段，将 image_id 转换为数组
const Create = t.Intersect([
  t.Omit(Insert, ["id", "createdAt", "updatedAt", "image_id"]),
  t.Object({
    image_id: t.Array(t.String({ minimum: 1 }), { minItems: 1 }),
  }),
]);

// Update ads - 完整更新，排除自动字段，转换 image_id 为数组
const Update = t.Intersect([
  t.Omit(UpdateBase, [
    "id",
    "createdAt",
    "updatedAt",
    "image_id",
    "startDate",
    "endDate",
  ]),
  t.Object({
    image_id: t.Array(t.String({ minimum: 1 })),
    startDate: t.String({ format: "date-time" }),
    endDate: t.String({ format: "date-time" }),
  }),
]);

// Patch - 部分更新，所有字段可选
const Patch = t.Intersect([
  t.Omit(UpdateBase, [
    "id",
    "createdAt",
    "updatedAt",
    "image_id",
    "startDate",
    "endDate",
  ]),
  t.Object({
    image_id: t.Optional(t.Array(t.String({ minimum: 1 }))),
    startDate: t.Optional(t.String({ format: "date-time" })),
    endDate: t.Optional(t.String({ format: "date-time" })),
  }),
]);

// BusinessQuery - 业务查询参数
const BusinessQuery = t.Intersect([
  t.Pick(UpdateBase, ["type", "position", "isActive"]),
  t.Object({
    search: t.Optional(t.String()),
  }),
]);

// ListQuery - 组合业务查询、分页和排序
const ListQuery = t.Object({
  ...BusinessQuery.properties,
  ...PaginationParams.properties,
  ...SortParams.properties,
});

// Entity - 返回实体模型，包含关联的图片URL
const Entity = t.Intersect([
  Select,
  t.Object({
    imageUrl: t.Optional(t.Union([t.String(), t.Null()])),
  }),
]);

// BatchStatusUpdate - 批量状态更新
const BatchStatusUpdate = t.Object({
  ids: t.Array(t.String({ minimum: 1 })),
  isActive: t.Boolean(),
});

// === 1. 运行时 Schema 集合（值）===
export const AdsTModel = {
  Insert,
  Update,
  Select,
  Create,
  Patch,
  BusinessQuery,
  ListQuery,
  Entity,
  BatchStatusUpdate,
} as const;

// === 2. 编译时类型集合（类型）===
export type AdsTModel = {
  Insert: typeof Insert.static;
  Update: typeof Update.static;
  Select: typeof Select.static;
  Create: typeof Create.static;
  Patch: typeof Patch.static;
  BusinessQuery: typeof BusinessQuery.static;
  ListQuery: typeof ListQuery.static;
  Entity: typeof Entity.static;
  BatchStatusUpdate: typeof BatchStatusUpdate.static;
};
