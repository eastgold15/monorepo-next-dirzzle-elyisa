// Sales Person module TypeBox type definitions
// Sales person management

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { t } from "elysia";
import { AuthTModel } from "../../model.typebox";
import { PaginationParams, SortParams } from "../helper/query-types.t.model";
import { salespersonsTable } from "./sales_person.schema";

// === 基础 Schema ===
const Insert = createInsertSchema(salespersonsTable);
const UpdateBase = createUpdateSchema(salespersonsTable);
const Select = createSelectSchema(salespersonsTable);

// === 业务 Schema ===
const Create = t.Omit(Insert, ["id", "createdAt", "updatedAt"]);

const Update = t.Omit(UpdateBase, ["id", "createdAt", "updatedAt"]);

const Patch = t.Partial(Update);

const BusinessQuery = t.Object({
  name: t.Optional(t.String()),
  email: t.Optional(t.String({ format: "email" })),
  factoryId: t.Optional(t.Number()),
  isActive: t.Optional(t.Boolean()),
});

const ListQuery = t.Object({
  ...BusinessQuery.properties,
  ...PaginationParams.properties,
  ...SortParams.properties,
});

const Entity = Select;

const EntityWithUser = t.Intersect([Select, AuthTModel.Entity]);

// === 1. 运行时 Schema 集合（值）===
export const SalesPersonTModel = {
  Insert,
  Update,
  Select,
  Create,
  Patch,
  ListQuery,
  Entity,
  BusinessQuery,
  EntityWithUser,
} as const;

// === 2. 编译时类型集合（类型）===
export type SalesPersonTModel = {
  Insert: typeof Insert.static;
  Update: typeof Update.static;
  Select: typeof Select.static;
  Create: typeof Create.static;
  Patch: typeof Patch.static;
  ListQuery: typeof ListQuery.static;
  Entity: typeof Entity.static;
  BusinessQuery: typeof BusinessQuery.static;
  EntityWithUser: typeof EntityWithUser.static;
};
