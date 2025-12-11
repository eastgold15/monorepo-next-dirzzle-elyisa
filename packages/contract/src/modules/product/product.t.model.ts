// Product module TypeBox type definitions
// Product-level public information (material, washing instructions, size chart)

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { t } from "elysia";
import { PaginationParams, SortParams } from "../helper/query-types.t.model";
import { productsTable } from "./product.schema";

// === 基础 Schema ===
const Insert = createInsertSchema(productsTable);
const UpdateBase = createUpdateSchema(productsTable);
const Select = createSelectSchema(productsTable);

// === 业务 Schema ===
const Create = t.Intersect([
  t.Omit(Insert, ["id", "createdAt", "updatedAt"]),
  t.Object({
    templateId: t.Number(),
    categoryIds: t.Array(t.Number({ minimum: 1 }), { minItems: 1 }),
    imageIds: t.Array(t.Number({ minimum: 1 })),
    mainImageId: t.Optional(t.Number({ minimum: 1 })),
  }),
]);

const Update = t.Intersect([
  t.Omit(UpdateBase, ["id", "createdAt", "updatedAt"]),
  t.Object({
    templateId: t.Number(),
    categoryIds: t.Array(t.Number({ minimum: 1 }), { minItems: 1 }),
    imageIds: t.Array(t.Number({ minimum: 1 })),
    mainImageId: t.Optional(t.Number({ minimum: 1 })),
  }),
]);

const Patch = t.Intersect([
  t.Omit(UpdateBase, ["id", "createdAt", "updatedAt"]),
  t.Object({
    templateId: t.Optional(t.Number({ minimum: 1 })),
    categoryIds: t.Optional(t.Array(t.Number({ minimum: 1 }), { minItems: 1 })),
    imageIds: t.Optional(t.Array(t.Number({ minimum: 1 }))),
    mainImageId: t.Optional(t.Number({ minimum: 1 })),
  }),
]);

const BusinessQuery = t.Object({
  name: t.Optional(t.String()),
  categoryId: t.Optional(t.Number()),
  templateId: t.Optional(t.Number()),
  isActive: t.Optional(t.Boolean()),
});

const ListQuery = t.Object({
  ...BusinessQuery.properties,
  ...PaginationParams.properties,
  ...SortParams.properties,
});

const Entity = t.Intersect([
  Select,
  t.Object({
    images: t.Array(t.Any()),
    categories: t.Array(t.Any()),
    template: t.Optional(t.Any()),
  }),
]);

const BatchStatusUpdate = t.Object({
  ids: t.Array(t.Number({ minimum: 1 }), { minItems: 1 }),
  isActive: t.Boolean(),
});

// === 1. 运行时 Schema 集合（值）===
export const ProductTModel = {
  Insert,
  Update,
  Select,
  Create,
  Patch,
  ListQuery,
  Entity,
  BusinessQuery,
  BatchStatusUpdate,
} as const;

// === 2. 编译时类型集合（类型）===
export type ProductTModel = {
  Insert: typeof Insert.static;
  Update: typeof Update.static;
  Select: typeof Select.static;
  Create: typeof Create.static;
  Patch: typeof Patch.static;
  ListQuery: typeof ListQuery.static;
  Entity: typeof Entity.static;
  BusinessQuery: typeof BusinessQuery.static;
  BatchStatusUpdate: typeof BatchStatusUpdate.static;
};
