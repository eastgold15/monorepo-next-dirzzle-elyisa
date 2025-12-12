// Category module TypeBox type definitions
// Replaces Zod with TypeBox for runtime validation and type safety

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { t } from "elysia";
import { PaginationParams, SortParams } from "../helper/query-types.t.model";
import type { TreeNode } from "../helper/utils.types";
import { categoriesTable } from "./category.schema";

// === 基础 Schema ===
const Insert = createInsertSchema(categoriesTable);
const UpdateBase = createUpdateSchema(categoriesTable);
const Select = createSelectSchema(categoriesTable);

// === 业务 Schema ===
const Create = t.Omit(Insert, ["id", "createdAt", "updatedAt"]);

const Update = t.Omit(UpdateBase, ["id", "createdAt", "updatedAt"]);

const Patch = t.Partial(Update);

const BusinessQuery = t.Object({
  search: t.Optional(t.String()),
  parentId: t.Optional(t.String()),
  isVisible: t.Optional(t.Boolean()),
});

const ListQuery = t.Object({
  ...BusinessQuery.properties,
  ...PaginationParams.properties,
  ...SortParams.properties,
});

const TreeQuery = t.Object({
  includeInvisible: t.Optional(t.Boolean()),
});

const Entity = Select;

// === 1. 运行时 Schema 集合（值）===
export const CategoryTModel = {
  Insert,
  Update,
  Select,
  Create,
  Patch,
  ListQuery,
  TreeQuery,
  Entity,

  BusinessQuery,
} as const;

// === 2. 编译时类型集合（类型）===
export type CategoryTModel = {
  Insert: typeof Insert.static;
  Update: typeof Update.static;
  Select: typeof Select.static;
  Create: typeof Create.static;
  Patch: typeof Patch.static;
  ListQuery: typeof ListQuery.static;
  TreeQuery: typeof TreeQuery.static;
  Entity: typeof Entity.static;
  TreeEntity: TreeNode<typeof Entity.static>;
  BusinessQuery: typeof BusinessQuery.static;
};
