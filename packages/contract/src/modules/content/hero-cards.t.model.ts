// Hero Cards module TypeBox type definitions
// Homepage hero banner management

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { t } from "elysia";
import { heroCardsTable } from "../../table.schema";
import { PaginationParams, SortParams } from "../helper/query-types.t.model";

// === 基础 Schema ===
const Insert = createInsertSchema(heroCardsTable);
const UpdateBase = createUpdateSchema(heroCardsTable);
const Select = createSelectSchema(heroCardsTable);

// === 业务 Schema ===
const Create = t.Omit(Insert, ["id", "createdAt", "updatedAt"]);

const Update = t.Omit(UpdateBase, ["id", "createdAt", "updatedAt"]);

const Patch = t.Partial(Update);

const BusinessQuery = t.Object({
  title: t.Optional(t.String()),
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
    imageUrl: t.Optional(t.Union([t.String(), t.Null()])),
  }),
]);

const BatchStatusUpdate = t.Object({
  ids: t.Array(t.String({ minimum: 1 })),
  isActive: t.Boolean(),
});

// === 1. 运行时 Schema 集合（值）===
export const HeroCardsTModel = {
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
export type HeroCardsTModel = {
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
