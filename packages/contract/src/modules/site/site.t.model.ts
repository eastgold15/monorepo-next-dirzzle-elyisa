import { sitesTable } from "@repo/contract/table";

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { t } from "elysia";
import { ExporterTModel, FactoryTModel } from "../company";
import { ProductTModel } from "../product/product.t.model";
import { SiteCategoryTModel } from "./siteCategry.t.model";
import { SiteProductTModel } from "./siteProduct.t.model";

// Site Model Types
const SiteInsert = createInsertSchema(sitesTable);
const SiteUpdate = createUpdateSchema(sitesTable);
const SiteSelect = createSelectSchema(sitesTable);

// Extended Site Entity with relationships
const SiteEntity = t.Composite([
  SiteSelect,
  t.Object({
    factory: t.Optional(FactoryTModel.Entity),
    exporter: t.Optional(ExporterTModel.Entity),
  }),
]);

// Site Product with product details
const SiteProductEntity = t.Composite([
  SiteProductTModel.Select,
  t.Object({
    product: t.Optional(ProductTModel.Entity),
    site_category: t.Optional(SiteCategoryTModel.Entity),
  }),
]);

// Query Types
const SiteListQuery = t.Object({
  site_type: t.Optional(t.Union([t.Literal("factory"), t.Literal("exporter")])),
  is_active: t.Optional(t.Boolean()),
  entity_id: t.Optional(t.String()),
  limit: t.Optional(t.Number()),
  offset: t.Optional(t.Number()),
});

const SiteProductListQuery = t.Object({
  site_id: t.Optional(t.String()),
  category_id: t.Optional(t.String()),
  is_visible: t.Optional(t.Boolean()),
  is_featured: t.Optional(t.Boolean()),
  limit: t.Optional(t.Number()),
  offset: t.Optional(t.Number()),
});

const SiteCategoryListQuery = t.Object({
  site_id: t.Optional(t.String()),
  parent_id: t.Optional(t.String()),
  global_category_id: t.Optional(t.String()),
});

// Business Types
const SiteCreateBody = t.Object({
  name: t.String(),
  domain: t.String(),
  site_type: t.Union([t.Literal("factory"), t.Literal("exporter")]),
  entity_id: t.String(),
  theme_config: t.Optional(t.Record(t.String(), t.Any())),
  feature_config: t.Optional(t.Record(t.String(), t.Any())),
});

const SiteUpdateBody = t.Object({
  name: t.Optional(t.String()),
  domain: t.Optional(t.String()),
  theme_config: t.Optional(t.Record(t.String(), t.Any())),
  feature_config: t.Optional(t.Record(t.String(), t.Any())),
  is_active: t.Optional(t.Boolean()),
});

const SiteCategoryCreateBody = t.Object({
  site_id: t.String(),
  name: t.String(),
  parent_id: t.Optional(t.String()),
  sort_order: t.Optional(t.Number()),
  global_category_id: t.Optional(t.String()),
});

const SiteProductCreateBody = t.Object({
  site_id: t.String(),
  product_id: t.String(),
  site_price: t.Optional(t.Number()),
  site_name: t.Optional(t.String()),
  site_description: t.Optional(t.String()),
  is_featured: t.Optional(t.Boolean()),
  sort_order: t.Optional(t.Number()),
  is_visible: t.Optional(t.Boolean()),
  seo_title: t.Optional(t.String()),
  seo_description: t.Optional(t.String()),
  site_category_id: t.Optional(t.String()),
});

const UserSitePermissionCreateBody = t.Object({
  user_id: t.String(),
  site_id: t.String(),
  role: t.Union([t.Literal("admin"), t.Literal("editor"), t.Literal("viewer")]),
});

// Context Types
const SiteContext = t.Object({
  site: SiteSelect,
  siteType: t.Union([t.Literal("factory"), t.Literal("exporter")]),
  entityId: t.String(),
  entity: t.Optional(t.Union([FactoryTModel.Select, ExporterTModel.Entity])),
});

export const SiteTModel = {
  // Schema types
  Insert: SiteInsert,
  Update: SiteUpdate,
  Select: SiteSelect,
  Create: SiteCreateBody,
  ListQuery: SiteListQuery,
  Entity: SiteEntity,


  CategoryCreate: SiteCategoryCreateBody,
  CategoryListQuery: SiteCategoryListQuery,


  ProductCreate: SiteProductCreateBody,
  ProductListQuery: SiteProductListQuery,
  ProductEntity: SiteProductEntity,


  PermissionCreate: UserSitePermissionCreateBody,

  // Context type
  Context: SiteContext,
} as const;

// Runtime type exports
export type SiteTModel = {
  Insert: typeof SiteInsert.static;
  Update: typeof SiteUpdate.static;
  Select: typeof SiteSelect.static;
  Create: typeof SiteCreateBody.static;

  ListQuery: typeof SiteListQuery.static;
  Entity: typeof SiteEntity.static;


  CategoryCreate: typeof SiteCategoryCreateBody.static;
  CategoryListQuery: typeof SiteCategoryListQuery.static;


  ProductCreate: typeof SiteProductCreateBody.static;
  ProductListQuery: typeof SiteProductListQuery.static;
  ProductEntity: typeof SiteProductEntity.static;


  PermissionCreate: typeof UserSitePermissionCreateBody.static;

  Context: typeof SiteContext.static;
};
