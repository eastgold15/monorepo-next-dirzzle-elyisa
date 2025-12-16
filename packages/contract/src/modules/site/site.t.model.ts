import {
  siteCategoriesTable,
  siteProductsTable,
  sitesTable
} from "@repo/contract/table";

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { t } from "elysia";
import { ExporterTModel, FactoryTModel } from "../company";
import { ProductTModel } from "../product/product.t.model";
import { SiteCategoryTModel } from "./siteCategry.t.model";

// Site Model Types - 直接使用数据库生成的类型
const SiteInsert = createInsertSchema(sitesTable);
const SiteUpdate = createUpdateSchema(sitesTable);
const SiteSelect = createSelectSchema(sitesTable);

const SiteCategoryInsert = createInsertSchema(siteCategoriesTable);
const SiteCategoryUpdate = createUpdateSchema(siteCategoriesTable);
const SiteCategorySelect = createSelectSchema(siteCategoriesTable);

const SiteProductInsert = createInsertSchema(siteProductsTable);
const SiteProductUpdate = createUpdateSchema(siteProductsTable);
const SiteProductSelect = createSelectSchema(siteProductsTable);

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
  SiteProductSelect,
  t.Object({
    product: t.Optional(ProductTModel.Entity),
    site_category: t.Optional(SiteCategoryTModel.Entity),
  }),
]);

// Query Types
const SiteListQuery = t.Object({
  siteType: t.Optional(t.Union([t.Literal("factory"), t.Literal("exporter")])),
  isActive: t.Optional(t.Boolean()),
  entityId: t.Optional(t.String()),
  limit: t.Optional(t.Number()),
  offset: t.Optional(t.Number()),
});

const SiteProductListQuery = t.Object({
  siteId: t.Optional(t.String()),
  categoryId: t.Optional(t.String()),
  isVisible: t.Optional(t.Boolean()),
  isFeatured: t.Optional(t.Boolean()),
  limit: t.Optional(t.Number()),
  offset: t.Optional(t.Number()),
});

const SiteCategoryListQuery = t.Object({
  siteId: t.Optional(t.String()),
  parentId: t.Optional(t.String()),
  masterCategoryId: t.Optional(t.String()),
});

// UserSitePermission types
const UserSitePermissionCreateBody = t.Object({
  userId: t.String(),
  siteId: t.String(),
  role: t.Union([t.Literal("admin"), t.Literal("editor"), t.Literal("viewer")]),
});

// Switch Site Types
const SiteSwitchRequest = t.Object({
  siteId: t.String(),
});

const SiteSwitchResponse = t.Object({
  success: t.Boolean(),
  currentSite: SiteSelect,
  allSites: t.Array(SiteEntity),
});

// Get Accessible Sites Response
const AccessibleSitesResponse = t.Object({
  sites: t.Array(t.Composite([
    SiteEntity,
    t.Object({
      role: t.Object({
        name: t.String(),
        priority: t.Number(),
      }),
      priority: t.Number(),
    })
  ])),
});

// Context Types
const SiteContext = t.Object({
  site: SiteSelect,
  siteType: t.Union([t.Literal("factory"), t.Literal("exporter")]),
  entityId: t.String(),
  entity: t.Optional(t.Union([FactoryTModel.Select, ExporterTModel.Entity])),
});

export const SiteTModel = {
  // Schema types - 直接使用数据库生成的类型
  Insert: SiteInsert,
  Update: SiteUpdate,
  Select: SiteSelect,
  ListQuery: SiteListQuery,
  Entity: SiteEntity,

  // Category types - 使用数据库生成的类型
  CategoryCreate: SiteCategoryInsert,
  CategoryUpdate: SiteCategoryUpdate,
  CategorySelect: SiteCategorySelect,
  CategoryListQuery: SiteCategoryListQuery,

  // Product types - 使用数据库生成的类型
  ProductCreate: SiteProductInsert,
  ProductUpdate: SiteProductUpdate,
  ProductSelect: SiteProductSelect,
  ProductListQuery: SiteProductListQuery,
  ProductEntity: SiteProductEntity,

  PermissionCreate: UserSitePermissionCreateBody,

  // Site switching types
  SwitchRequest: SiteSwitchRequest,
  SwitchResponse: SiteSwitchResponse,
  AccessibleSitesResponse: AccessibleSitesResponse,

  // Context type
  Context: SiteContext,
} as const;

// Runtime type exports
export type SiteTModel = {
  Insert: typeof SiteInsert.static;
  Update: typeof SiteUpdate.static;
  Select: typeof SiteSelect.static;

  ListQuery: typeof SiteListQuery.static;
  Entity: typeof SiteEntity.static;

  CategoryCreate: typeof SiteCategoryInsert.static;
  CategoryUpdate: typeof SiteCategoryUpdate.static;
  CategorySelect: typeof SiteCategorySelect.static;
  CategoryListQuery: typeof SiteCategoryListQuery.static;

  ProductCreate: typeof SiteProductInsert.static;
  ProductUpdate: typeof SiteProductUpdate.static;
  ProductSelect: typeof SiteProductSelect.static;
  ProductListQuery: typeof SiteProductListQuery.static;
  ProductEntity: typeof SiteProductEntity.static;

  PermissionCreate: typeof UserSitePermissionCreateBody.static;

  // Site switching types
  SwitchRequest: typeof SiteSwitchRequest.static;
  SwitchResponse: typeof SiteSwitchResponse.static;
  AccessibleSitesResponse: typeof AccessibleSitesResponse.static;

  Context: typeof SiteContext.static;
};