// Factory module TypeBox type definitions
// Factory management

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { t } from "elysia";
import { PaginationParams, SortParams } from "../helper/query-types.t.model";
import { factoriesTable } from "./factory.schema";

// === 基础 Schema ===
const Insert = createInsertSchema(factoriesTable);
const UpdateBase = createUpdateSchema(factoriesTable);
const Select = createSelectSchema(factoriesTable);

// === 业务 Schema ===
const Create = t.Omit(Insert, ["id", "createdAt", "updatedAt"]);

const Update = t.Omit(UpdateBase, ["id", "createdAt", "updatedAt"]);

const Patch = t.Partial(Update);

const BusinessQuery = t.Object({
  name: t.Optional(t.String()),
  country: t.Optional(t.String()),
  isActive: t.Optional(t.Boolean()),
});

const ListQuery = t.Object({
  ...BusinessQuery.properties,
  ...PaginationParams.properties,
  ...SortParams.properties,
});

const Entity = Select;

// === 1. 运行时 Schema 集合（值）===
export const FactoryTModel = {
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
export type FactoryTModel = {
  Insert: typeof Insert.static;
  Update: typeof Update.static;
  Select: typeof Select.static;
  Create: typeof Create.static;
  Patch: typeof Patch.static;
  ListQuery: typeof ListQuery.static;
  Entity: typeof Entity.static;
  BusinessQuery: typeof BusinessQuery.static;
};
