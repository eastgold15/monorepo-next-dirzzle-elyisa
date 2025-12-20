// Product module TypeBox type definitions
// Product-level public information (material, washing instructions, size chart)

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { t } from "elysia";
import {
  productsTable,
  siteProductsTable,
  skusTable,
} from "../../table.schema";
import { PaginationParams, SortParams } from "../helper/query-types.t.model";

// === 基础 Schema ===
const Insert = createInsertSchema(productsTable);
const UpdateBase = createUpdateSchema(productsTable);
const Select = createSelectSchema(productsTable);

// 创建商品
// 商品信息+ siteid + siteproduct sitecategory

// === 业务 Schema ===
const Create = t.Intersect([
  t.Omit(Insert, ["id", "createdAt", "updatedAt"]),
  t.Object({
    // 商品基础信息
    name: t.String({ minLength: 1, maxLength: 255 }),
    spuCode: t.String({ minLength: 1, maxLength: 64 }),
    description: t.Optional(t.String()),
    status: t.Optional(t.Integer()),
    units: t.Optional(t.String()),

    // 分类关联
    categoryIds: t.Optional(
      t.Array(t.String({ format: "uuid" }), { minItems: 1 })
    ),

    // 图片关联
    imageIds: t.Optional(t.Array(t.String({ format: "uuid" }))),
    mainImageId: t.Optional(t.String({ format: "uuid" })),
    // 站点商品相关字段（当业务员创建商品时使用）
    price: t.Optional(t.Number()), // 站点商品价格
    siteName: t.Optional(t.String({ maxLength: 200 })), // 站点自定义商品名
    siteDescription: t.Optional(t.String()), // 站点自定义商品描述
    siteCategoryId: t.Optional(t.String({ format: "uuid" })), // 站点分类ID
    seoTitle: t.Optional(t.String({ maxLength: 200 })), // SEO标题
  }),
]);

const Update = t.Intersect([
  t.Omit(UpdateBase, ["id", "createdAt", "updatedAt"]),
  t.Object({
    templateId: t.String(),
    categoryIds: t.Array(t.String({ minimum: 1 }), { minItems: 1 }),
    imageIds: t.Array(t.String({ minimum: 1 })),
    mainImageId: t.Optional(t.String({ minimum: 1 })),
  }),
]);

const Patch = t.Intersect([
  t.Omit(UpdateBase, ["id", "createdAt", "updatedAt"]),
  t.Object({
    templateId: t.Optional(t.String({ minimum: 1 })),
    categoryIds: t.Optional(t.Array(t.String({ minimum: 1 }), { minItems: 1 })),
    imageIds: t.Optional(t.Array(t.String({ minimum: 1 }))),
    mainImageId: t.Optional(t.String({ minimum: 1 })),
  }),
]);

const BusinessQuery = t.Object({
  name: t.Optional(t.String()),
  categoryId: t.Optional(t.String()),
  templateId: t.Optional(t.String()),
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
    productMedia: t.Array(t.Any()),
    skus: t.Array(t.Any()),
  }),
]);

const BatchStatusUpdate = t.Object({
  ids: t.Array(t.String({ minimum: 1 })),
  isActive: t.Boolean(),
});

// === 站点商品关联 Schema ===
const SiteProductInsert = createInsertSchema(siteProductsTable);
const SiteProductUpdate = createUpdateSchema(siteProductsTable);
const SiteProductSelect = createSelectSchema(siteProductsTable);

const SiteProductCreate = t.Intersect([
  t.Omit(SiteProductInsert, ["id", "createdAt", "updatedAt"]),
  t.Object({
    siteId: t.String({ format: "uuid" }),
    productId: t.String({ format: "uuid" }),
    sitePrice: t.Optional(t.Number()),
    siteName: t.Optional(t.String()),
    siteDescription: t.Optional(t.String()),
    isFeatured: t.Optional(t.Boolean()),
    sortOrder: t.Optional(t.Integer()),
    isVisible: t.Optional(t.Boolean()),
    seoTitle: t.Optional(t.String()),
    siteCategoryId: t.Optional(t.String({ format: "uuid" })),
  }),
]);

const SiteProductUpdateBody = t.Intersect([
  t.Omit(SiteProductUpdate, [
    "id",
    "createdAt",
    "updatedAt",
    "siteId",
    "productId",
  ]),
  t.Object({
    sitePrice: t.Optional(t.Number()),
    siteName: t.Optional(t.String()),
    siteDescription: t.Optional(t.String()),
    isFeatured: t.Optional(t.Boolean()),
    sortOrder: t.Optional(t.Integer()),
    isVisible: t.Optional(t.Boolean()),
    seoTitle: t.Optional(t.String()),
    siteCategoryId: t.Optional(t.String({ format: "uuid" })),
  }),
]);

const SiteProductQuery = t.Object({
  siteId: t.Optional(t.String({ format: "uuid" })),
  productId: t.Optional(t.String({ format: "uuid" })),
  isVisible: t.Optional(t.Boolean()),
  isFeatured: t.Optional(t.Boolean()),
  ...PaginationParams.properties,
  ...SortParams.properties,
});

const SiteProductEntity = t.Intersect([
  SiteProductSelect,
  t.Object({
    site: t.Optional(t.Any()),
    product: t.Optional(t.Any()),
    siteCategory: t.Optional(t.Any()),
  }),
]);

// === SKU Schema ===
const SkuInsert = createInsertSchema(skusTable);
const SkuUpdate = createUpdateSchema(skusTable);
const SkuSelect = createSelectSchema(skusTable);

const SkuCreate = t.Intersect([
  t.Omit(SkuInsert, ["id", "createdAt", "updatedAt"]),
  t.Object({
    skuCode: t.String(),
    productId: t.String({ format: "uuid" }),
    price: t.Number(),
    specJson: t.Any(),
    stock: t.Optional(t.Number()),
    marketPrice: t.Optional(t.Number()),
    costPrice: t.Optional(t.Number()),
    weight: t.Optional(t.Number()),
    volume: t.Optional(t.Number()),
    status: t.Optional(t.Integer()),
  }),
]);

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
  // 站点商品关联
  SiteProductInsert,
  SiteProductUpdate,
  SiteProductSelect,
  SiteProductCreate,
  SiteProductUpdateBody,
  SiteProductQuery,
  SiteProductEntity,
  // SKU
  SkuInsert,
  SkuUpdate,
  SkuSelect,
  SkuCreate,
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
  // 站点商品关联
  SiteProductInsert: typeof SiteProductInsert.static;
  SiteProductUpdate: typeof SiteProductUpdate.static;
  SiteProductSelect: typeof SiteProductSelect.static;
  SiteProductCreate: typeof SiteProductCreate.static;
  SiteProductUpdateBody: typeof SiteProductUpdateBody.static;
  SiteProductQuery: typeof SiteProductQuery.static;
  SiteProductEntity: typeof SiteProductEntity.static;
  // SKU
  SkuInsert: typeof SkuInsert.static;
  SkuUpdate: typeof SkuUpdate.static;
  SkuSelect: typeof SkuSelect.static;
  SkuCreate: typeof SkuCreate.static;
};
