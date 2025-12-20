import { siteProductsTable, sitesTable } from "@repo/contract/table";

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { t } from "elysia";
import { ExporterTModel, FactoryTModel } from "../company";

// Site Model Types - 直接使用数据库生成的类型
const Insert = createInsertSchema(sitesTable);
const Update = createUpdateSchema(sitesTable);
const Select = createSelectSchema(sitesTable);

const Create = t.Omit(Insert, ["id", "createdAt", "updatedAt"]);

const SiteProductInsert = createInsertSchema(siteProductsTable);
const SiteProductUpdate = createUpdateSchema(siteProductsTable);
const SiteProductSelect = createSelectSchema(siteProductsTable);

// Extended Site Entity with relationships
const SiteEntity = t.Composite([
  Select,
  t.Object({
    factory: t.Optional(FactoryTModel.Entity),
    exporter: t.Optional(ExporterTModel.Entity),
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
  currentSite: Select,
  allSites: t.Array(SiteEntity),
});

// Get Accessible Sites Response
const AccessibleSitesResponse = t.Object({
  sites: t.Array(
    t.Composite([
      SiteEntity,
      t.Object({
        role: t.Object({
          name: t.String(),
          priority: t.Number(),
        }),
        priority: t.Number(),
      }),
    ])
  ),
});

// Context Types
const SiteContext = t.Object({
  site: Select,
  siteType: t.Union([t.Literal("factory"), t.Literal("exporter")]),
  entityId: t.String(),
  entity: t.Optional(t.Union([FactoryTModel.Select, ExporterTModel.Entity])),
});

export const SiteTModel = {
  // Schema types - 直接使用数据库生成的类型
  Insert,
  Update,
  Select,
  ListQuery: SiteListQuery,
  Entity: SiteEntity,

  Create,

  CategoryListQuery: SiteCategoryListQuery,

  // Product types - 使用数据库生成的类型
  ProductCreate: SiteProductInsert,
  ProductUpdate: SiteProductUpdate,
  ProductSelect: SiteProductSelect,
  ProductListQuery: SiteProductListQuery,

  PermissionCreate: UserSitePermissionCreateBody,

  // Site switching types
  SwitchRequest: SiteSwitchRequest,
  SwitchResponse: SiteSwitchResponse,
  AccessibleSitesResponse,

  // Context type
  Context: SiteContext,
} as const;

// Runtime type exports
export type SiteTModel = {
  Insert: typeof Insert.static;
  Update: typeof Update.static;
  Select: typeof Select.static;
  Create: typeof Create.static;

  ListQuery: typeof SiteListQuery.static;
  Entity: typeof SiteEntity.static;

  CategoryListQuery: typeof SiteCategoryListQuery.static;

  ProductCreate: typeof SiteProductInsert.static;
  ProductUpdate: typeof SiteProductUpdate.static;
  ProductSelect: typeof SiteProductSelect.static;
  ProductListQuery: typeof SiteProductListQuery.static;

  PermissionCreate: typeof UserSitePermissionCreateBody.static;

  // Site switching types
  SwitchRequest: typeof SiteSwitchRequest.static;
  SwitchResponse: typeof SiteSwitchResponse.static;
  AccessibleSitesResponse: typeof AccessibleSitesResponse.static;

  Context: typeof SiteContext.static;
};
