import { type Static, Type as t } from "@sinclair/typebox";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { skusTable } from "../../table.schema";
import { PaginationParams, SortParams } from "../helper/query-types.t.model";
import { MediaTModel } from "../media/media.t.model";

// === 基础 Schema ===
const Insert = createInsertSchema(skusTable);
const UpdateBase = createUpdateSchema(skusTable, {});
const Select = createSelectSchema(skusTable);

// === 业务 Schema ===
const Create = t.Composite([
  t.Omit(Insert, ["id", "createdAt", "updatedAt"]),
  t.Object({
    mediaId: t.Optional(t.String()), // 保留单个 mediaId 用于单个创建
  }),
]);

const CreateWithMultipleMedia = t.Composite([
  t.Omit(Insert, ["id", "createdAt", "updatedAt"]),
  t.Object({
    mediaIds: t.Optional(t.Array(t.String())), // 支持多个媒体ID
  }),
]);

const Update = t.Omit(UpdateBase, ["id", "createdAt", "updatedAt"]);

const Patch = t.Omit(UpdateBase, ["id", "createdAt", "updatedAt"]);

const BusinessQuery = t.Object({
  search: t.Optional(t.String()),
  productId: t.Optional(t.String()),
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
    mediaIds: t.Optional(t.Array(t.String())), // 支持多个媒体ID
  })
);

// 添加图片信息的 Entity
const EntityWithImages = t.Intersect([
  Entity,
  t.Object({
    images: t.Array(
      t.Object({
        id: t.String(),
        url: t.String(),
        storageKey: t.String(),
        category: t.String(),
        isMain: t.Boolean(),
        sortOrder: t.Number(),
      })
    ),
    mainImage: t.Union([
      t.Object({
        id: t.String(),
        url: t.String(),
        storageKey: t.String(),
        category: t.String(),
        isMain: t.Boolean(),
        sortOrder: t.Number(),
      }),
      t.Null(),
    ]),
  }),
]);

// === 1. 运行时 Schema 集合（值）===
export const SkuTModel = {
  Insert,
  Update,
  Select,
  Create,
  CreateWithMultipleMedia,
  Patch,
  ListQuery,
  Entity,
  EntityWithImages,
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
  CreateWithMultipleMedia: Static<typeof CreateWithMultipleMedia>;
  Patch: Static<typeof Patch>;
  ListQuery: Static<typeof ListQuery>;
  Entity: Static<typeof Entity>;
  EntityWithImages: Static<typeof EntityWithImages>;
  BatchCreate: Static<typeof BatchCreate>;
  BusinessQuery: Static<typeof BusinessQuery>;
  EntityWithMeida: typeof EntityWithMeida.static;
};
