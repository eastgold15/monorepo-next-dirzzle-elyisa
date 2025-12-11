// Images module TypeBox type definitions
// Replaces Zod with TypeBox for runtime validation and type safety

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { t } from "elysia";
import { PaginationParams, SortParams } from "../helper/query-types.t.model";
import { imagesTable } from "./image.schema";

// === 基础 Schema ===
const Insert = createInsertSchema(imagesTable);
const Update = createUpdateSchema(imagesTable);
const Select = createSelectSchema(imagesTable);

// === 业务 Schema ===
const Create = t.Omit(Insert, ["id", "createdAt", "updatedAt"]);

const Patch = t.Partial(t.Omit(Update, ["id", "createdAt", "updatedAt"]));

const BusinessQuery = t.Object({
  search: t.Optional(t.String()),
  category: t.Optional(t.String()),
  mimeType: t.Optional(t.String()),
  filename: t.Optional(t.String()),
});

const ListQuery = t.Object({
  ...BusinessQuery.properties,
  ...PaginationParams.properties,
  ...SortParams.properties,
});

const Entity = t.Object({
  ...Select.properties,
  url: t.String({ format: "uri" }), // 确保返回的是完整 URL
});

const BatchUpload = t.Object({
  entityType: t.String(),
  entityId: t.String(),
  images: t.Array(
    t.Object({
      url: t.String({ minLength: 1 }),
      imageType: t.Optional(t.String()),
      sortOrder: t.Optional(t.Number({ default: 0 })),
      altText: t.Optional(t.String()),
    })
  ),
});

const BatchDelete = t.Object({
  ids: t.Array(t.String(), { minItems: 1 }),
});

// === 1. 运行时 Schema 集合（值）===
export const ImageTModel = {
  Insert,
  Update,
  Select,
  Create,
  Patch,
  ListQuery,
  Entity,
  BatchUpload,
  BatchDelete,
  BusinessQuery,
} as const;

// === 2. 编译时类型集合（类型）===
export type ImageTModel = {
  Insert: typeof Insert.static;
  Update: typeof Update.static;
  Select: typeof Select.static;
  Create: typeof Create.static;
  Patch: typeof Patch.static;
  ListQuery: typeof ListQuery.static;
  Entity: typeof Entity.static;
  BatchUpload: typeof BatchUpload.static;
  BatchDelete: typeof BatchDelete.static;
  BusinessQuery: typeof BusinessQuery.static;
};
