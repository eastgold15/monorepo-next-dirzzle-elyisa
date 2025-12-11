// Product.attributes：描述"这个商品
// 商品级公共信息<br>（材质、洗涤说明、尺码表）

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { PaginationParams, SortParams } from "../helper/query-types";
import {
  productMediaTable,
  productsTable,
  productTemplateTable,
} from "./product.schema";

// === 基础 Schema ===
const Insert = createInsertSchema(productsTable);
const UpdateBase = createUpdateSchema(productsTable);
const Select = createSelectSchema(productsTable);

// === 业务 Schema ===
const Create = Insert.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  templateId: z.string(),
  categoryIds: z.array(z.string()),
  imageIds: z.array(z.string()),
  mainImageId: z.optional(z.string()),
});

const Update = UpdateBase.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  templateId: z.string(),
  categoryIds: z.array(z.string()),
  imageIds: z.array(z.string()),
  mainImageId: z.optional(z.string()),
});

const Patch = UpdateBase.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
  .extend({
    templateId: z.optional(z.string()),
    categoryIds: z.optional(z.array(z.string())),
    imageIds: z.optional(z.array(z.string())),
    mainImageId: z.optional(z.string()),
  })
  .partial();

const BusinessQuery = z.object({
  name: z.coerce.string().optional(),
  categoryId: z.optional(z.string()),
  status: z.optional(z.coerce.number()),
  search: z.optional(z.coerce.string()),
});

const ListQuery = BusinessQuery.extend(PaginationParams.shape).extend(
  SortParams.shape
);

const Entity = Select.extend({
  templateId: z.string().nullable(),
  categoryIds: z.array(z.string()),
  imageIds: z.array(z.string()),
  mainImageId: z.optional(z.string()),
});

// === 1. 运行时 Schema 集合（值）===
export const ProductModel = {
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
export type ProductModel = {
  Insert: z.infer<typeof Insert>;
  Update: z.infer<typeof Update>;
  Select: z.infer<typeof Select>;
  Create: z.infer<typeof Create>;
  Patch: z.infer<typeof Patch>;
  ListQuery: z.infer<typeof ListQuery>;
  Entity: z.infer<typeof Entity>;
  BusinessQuery: z.infer<typeof BusinessQuery>;
};

// ============================================================================
// 商品模板相关 Schema 和类型定义
// ============================================================================

// === 基础 Schema ===
const TemplateInsert = createInsertSchema(productTemplateTable);
const TemplateUpdate = createUpdateSchema(productTemplateTable);
const TemplateSelect = createSelectSchema(productTemplateTable);

// === 业务 Schema ===
const TemplateCreate = TemplateInsert.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const TemplatePatch = TemplateUpdate.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

const TemplateEntity = TemplateSelect;

const TemplateBusinessQuery = z.object({
  name: z.string().optional(),
});

const TemplateListQuery = TemplateBusinessQuery.extend(
  PaginationParams.shape
).extend(SortParams.shape);

// === 1. 运行时 Schema 集合（值）===
export const ProductTemplateModel = {
  Insert: TemplateInsert,
  Update: TemplateUpdate,
  Select: TemplateSelect,
  Create: TemplateCreate,
  Patch: TemplatePatch,
  Entity: TemplateEntity,
  ListQuery: TemplateListQuery,
  BusinessQuery: TemplateBusinessQuery,
} as const;

// === 2. 编译时类型集合（类型）===
export type ProductTemplateModel = {
  Insert: z.infer<typeof TemplateInsert>;
  Update: z.infer<typeof TemplateUpdate>;
  Select: z.infer<typeof TemplateSelect>;
  Create: z.infer<typeof TemplateCreate>;
  Patch: z.infer<typeof TemplatePatch>;
  Entity: z.infer<typeof TemplateEntity>;
  ListQuery: z.infer<typeof TemplateListQuery>;
  BusinessQuery: z.infer<typeof TemplateBusinessQuery>;
};

// ============================================================================
// 商品图片相关 Schema 和类型定义
// ============================================================================

// === 基础 Schema ===
const ImagesInsert = createInsertSchema(productMediaTable);
const ImagesUpdate = createUpdateSchema(productMediaTable);
const ImagesSelect = createSelectSchema(productMediaTable);

// === 业务 Schema ===
const ImagesCreate = ImagesInsert;

const ImagesPatch = ImagesUpdate;

const ImagesEntity = ImagesSelect.extend({
  product: z.any().optional(), // 关联商品信息
  image: z.any().optional(), // 关联图片信息
});

const ImagesBusinessQuery = z.object({
  productId: z.string().optional(),
  imageId: z.string().optional(),
  isMain: z.boolean().optional(),
});

const ImagesListQuery = ImagesBusinessQuery.extend(
  PaginationParams.shape
).extend(SortParams.shape);

// === 1. 运行时 Schema 集合（值）===
export const ProductImagesModel = {
  Insert: ImagesInsert,
  Update: ImagesUpdate,
  Select: ImagesSelect,
  Create: ImagesCreate,
  Patch: ImagesPatch,
  Entity: ImagesEntity,
  ListQuery: ImagesListQuery,
  BusinessQuery: ImagesBusinessQuery,
} as const;

// === 2. 编译时类型集合（类型）===
export type ProductImagesModel = {
  Insert: z.infer<typeof ImagesInsert>;
  Update: z.infer<typeof ImagesUpdate>;
  Select: z.infer<typeof ImagesSelect>;
  Create: z.infer<typeof ImagesCreate>;
  Patch: z.infer<typeof ImagesPatch>;
  Entity: z.infer<typeof ImagesEntity>;
  ListQuery: z.infer<typeof ImagesListQuery>;
  BusinessQuery: z.infer<typeof ImagesBusinessQuery>;
};
