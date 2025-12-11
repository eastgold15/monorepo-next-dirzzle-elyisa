import { type Static, Type as t } from "@sinclair/typebox";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { PaginationParams, SortParams } from "../helper/query-types.t.model";
import { MediaTModel } from "../media/media.t.model";
import { skusTable } from "./sku.schema";

// === 基础 Schema ===
const Insert = createInsertSchema(skusTable);
const UpdateBase = createUpdateSchema(skusTable, {});
const Select = createSelectSchema(skusTable);

// === 业务 Schema ===
const Create = t.Omit(Insert, ["id", "createdAt", "updatedAt"]);

const Update = t.Omit(UpdateBase, ["id", "createdAt", "updatedAt"]);

const Patch = t.Omit(UpdateBase, ["id", "createdAt", "updatedAt"]);

const BusinessQuery = t.Object({
  search: t.Optional(t.String()),
  productId: t.Optional(t.Number()),
  status: t.Optional(t.Number()),
  skuCode: t.Optional(t.String()),
});

const ListQuery = t.Composite([BusinessQuery, PaginationParams, SortParams]);

const Entity = t.Intersect([
  t.Omit(Select, [
    "id",
    "createdAt",
    "updatedAt",
    "specJson",
    "extraAttributes",
  ]),
  t.Object({
    specJson: t.Any(),
    extraAttributes: t.Any(),
  }),
]);

const EntityWithMeida = t.Intersect([
  Entity,
  t.Object({
    media: t.Pick(MediaTModel.Entity, ["id", "url", "mimeType", "category"]),
  }),
]);

const BatchCreate = t.Array(
  t.Object({
    skuCode: t.String(),
    price: t.String(),
    stock: t.Optional(t.String()),
    specJson: t.Record(t.String(), t.String()),
  })
);

// === 1. 运行时 Schema 集合（值）===
export const SkuTModel = {
  Insert,
  Update,
  Select,
  Create,
  Patch,
  ListQuery,
  Entity,
  BatchCreate,
  BusinessQuery,
  EntityWithMeida,
} as const;

// === 2. 编译时类型集合（类型）===
export type SkuTModel = {
  Insert: Static<typeof Insert>;
  Update: Static<typeof Update>;
  Select: Static<typeof Select>;
  Create: Static<typeof Create>;
  Patch: Static<typeof Patch>;
  ListQuery: Static<typeof ListQuery>;
  Entity: Static<typeof Entity>;
  BatchCreate: Static<typeof BatchCreate>;
  BusinessQuery: Static<typeof BusinessQuery>;
  EntityWithMeida: typeof EntityWithMeida.static;
};
