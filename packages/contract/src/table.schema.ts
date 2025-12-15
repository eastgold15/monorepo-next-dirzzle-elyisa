// schema.ts

import { sql } from "drizzle-orm";
import * as p from "drizzle-orm/pg-core";

// --- Helper fields ---
const idUuid = p.uuid("id").primaryKey().default(sql`gen_random_uuid()`);
const createdAt = p
  .timestamp("created_at", { withTimezone: true })
  .notNull()
  .defaultNow();
const updatedAt = p
  .timestamp("updated_at", { withTimezone: true })
  .notNull()
  .defaultNow()
  .$onUpdate(() => new Date());

// --- Enums ---
export const adsTypeEnum = p.pgEnum("ads_type", ["banner", "carousel", "list"]);
export const adsPositionEnum = p.pgEnum("ads_position", [
  "home-top",
  "home-middle",
  "sidebar",
]);
export const inquiryStatusEnum = p.pgEnum("inquiry_status", [
  "pending",
  "quoted",
  "sent",
  "completed",
  "cancelled",
]);
export const mediaStatusEnum = p.pgEnum("media_status", ["active", "deleted"]);
export const mediaTypeEnum = p.pgEnum("media_type", [
  "image",
  "video",
  "document",
  "audio",
  "other",
]);
export const InputTypeEnum = p.pgEnum("input_type", [
  "select",
  "text",
  "number",
  "multiselect",
  "richtext",
]);

// --- Tables ---
export const usersTable = p.pgTable("user_table", {
  id: idUuid,
  createdAt,
  updatedAt,
  name: p.text("name").notNull(),
  email: p.text("email").notNull().unique(),
  emailVerified: p.boolean("email_verified").default(false).notNull(),
  image: p.text("image"),
});

export const accountTable = p.pgTable("account", {
  id: idUuid,
  createdAt,
  updatedAt,
  accountId: p.text("account_id").notNull(),
  providerId: p.text("provider_id").notNull(),
  userId: p
    .uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  accessToken: p.text("access_token"),
  refreshToken: p.text("refresh_token"),
  idToken: p.text("id_token"),
  accessTokenExpiresAt: p.timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: p.timestamp("refresh_token_expires_at"),
  scope: p.text("scope"),
  password: p.text("password"),
});

export const sessionTable = p.pgTable("session", {
  id: idUuid,
  createdAt,
  updatedAt,
  expiresAt: p.timestamp("expires_at").notNull(),
  token: p.text("token").notNull().unique(),
  ipAddress: p.text("ip_address"),
  userAgent: p.text("user_agent"),
  userId: p
    .uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const verificationTable = p.pgTable("verification", {
  id: idUuid,
  createdAt,
  updatedAt,
  identifier: p.text("identifier").notNull(),
  value: p.text("value").notNull(),
  expiresAt: p.timestamp("expires_at").notNull(),
});

export const userProfilesTable = p.pgTable("userprofile", {
  userId: p
    .uuid("user_id")
    .primaryKey()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  phone: p.text("phone"),
  address: p.text("address"),
  city: p.text("city"),
});

export const roleTable = p.pgTable("roles", {
  id: idUuid,
  name: p.text("name").notNull().unique(),
  description: p.text("description"),
});

export const userRolesTable = p.pgTable("user_roles", {
  id: idUuid,
  userId: p
    .uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  roleId: p
    .uuid("role_id")
    .notNull()
    .references(() => roleTable.id, { onDelete: "cascade" }),
});

export const permissionTable = p.pgTable("permissions", {
  id: idUuid,
  createdAt,
  updatedAt,
  name: p.text("name").notNull(),
  description: p.text("description"),
});

export const rolePermissionsTable = p.pgTable(
  "role_permissions",
  {
    roleId: p
      .uuid("role_id")
      .notNull()
      .references(() => roleTable.id, { onDelete: "cascade" }),
    permissionId: p
      .uuid("permission_id")
      .notNull()
      .references(() => permissionTable.id, { onDelete: "cascade" }),
  },
  (t) => [p.primaryKey({ columns: [t.roleId, t.permissionId] })]
);

export const userResourceRolesTable = p.pgTable(
  "user_resource_roles",
  {
    id: idUuid,
    createdAt,
    updatedAt,
    userId: p
      .uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    roleId: p
      .uuid("role_id")
      .notNull()
      .references(() => roleTable.id, { onDelete: "cascade" }),
    resourceType: p.text("resource_type").notNull(),
    resourceId: p.uuid("resource_id").notNull(),
    isPrimary: p.boolean("is_primary").default(false),
  }
  // Unique constraint omitted per your note; can be added via raw SQL migration if needed
);

export const exportersTable = p.pgTable("exporters", {
  id: idUuid,
  createdAt,
  updatedAt,
  name: p.varchar("name", { length: 200 }).notNull(),
  code: p.varchar("code", { length: 50 }).unique().notNull(),
  address: p.text("address"),
  website: p.varchar("website", { length: 500 }),
  bankInfo: p.json("bank_info").$type<{
    beneficiary: string;
    accountNo: string;
  }>(),
  isActive: p.boolean("is_active").default(true).notNull(),
  isVerified: p.boolean("is_verified").default(false).notNull(),
});

export const categoriesTable = p.pgTable("categories", {
  id: idUuid,
  name: p.varchar("name", { length: 255 }).notNull(),
  slug: p.varchar("slug", { length: 100 }).notNull().unique(),
  description: p.varchar("description", { length: 255 }).notNull(),
  parentId: p.uuid("parent_id"),
  sortOrder: p.integer("sort_order").default(0),
  isVisible: p.boolean("is_visible").default(true),
  icon: p.varchar("icon", { length: 255 }).default(""),
  createdAt,
  updatedAt,
});

export const factoriesTable = p.pgTable("factories", {
  id: idUuid,
  createdAt,
  updatedAt,
  name: p.varchar("name", { length: 200 }).notNull(),
  code: p.varchar("code", { length: 50 }).unique().notNull(),
  description: p.text("description"),
  website: p.varchar("website", { length: 500 }).notNull(),
  address: p.text("address").notNull(),
  contactPhone: p.varchar("contact_phone", { length: 50 }).notNull(),
  logo: p.varchar("logo", { length: 500 }),
  exporterId: p.uuid("exporter_id").references(() => exportersTable.id),
  isActive: p.boolean("is_active").default(true).notNull(),
  isVerified: p.boolean("is_verified").default(false).notNull(),
  businessLicense: p.varchar("business_license", { length: 500 }),
  mainProducts: p.text("main_products"),
  annualRevenue: p.varchar("annual_revenue", { length: 100 }),
  employeeCount: p.integer("employee_count"),
});

export const factoryCategoryTable = p.pgTable(
  "factory_category",
  {
    factoryId: p
      .uuid("factory_id")
      .notNull()
      .references(() => factoriesTable.id, { onDelete: "cascade" }),
    categoryId: p
      .uuid("category_id")
      .notNull()
      .references(() => categoriesTable.id, { onDelete: "cascade" }),
  },
  (t) => [p.primaryKey({ columns: [t.factoryId, t.categoryId] })]
);

export const salespersonsTable = p.pgTable("salespersons", {
  id: idUuid,
  createdAt,
  updatedAt,
  userId: p
    .uuid("user_id")
    .notNull()
    .unique()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  factoryId: p
    .uuid("factory_id")
    .notNull()
    .references(() => factoriesTable.id, { onDelete: "cascade" }),
  phone: p.varchar("phone", { length: 50 }),
  whatsapp: p.varchar("whatsapp", { length: 50 }),
  position: p.varchar("position", { length: 100 }),
  department: p.varchar("department", { length: 100 }),
  isActive: p.boolean("is_active").default(true).notNull(),
  avatar: p.varchar("avatar", { length: 500 }),
  lastAssignedAt: p.timestamp("last_assigned_at"),
});

export const salespersonCategoriesTable = p.pgTable(
  "salesperson_categories",
  {
    salespersonId: p
      .uuid("salesperson_id")
      .notNull()
      .references(() => salespersonsTable.id, { onDelete: "cascade" }),
    categoryId: p
      .uuid("category_id")
      .notNull()
      .references(() => categoriesTable.id, { onDelete: "cascade" }),
  },
  (t) => [p.primaryKey({ columns: [t.salespersonId, t.categoryId] })]
);

export const mediaTable = p.pgTable("media", {
  id: idUuid,
  createdAt,
  updatedAt,
  storageKey: p.varchar("storage_key", { length: 255 }).notNull(),
  category: p.varchar("category").notNull(),
  url: p.varchar("url", { length: 255 }).notNull(),
  userId: p.uuid("user_id").references(() => usersTable.id, {
    onDelete: "cascade",
  }),
  factoryId: p.uuid("factory_id").references(() => factoriesTable.id, {
    onDelete: "cascade",
  }),
  originalName: p.varchar("original_name", { length: 255 }).notNull(),
  mimeType: p.varchar("mime_type", { length: 100 }).notNull(),
  status: p.boolean("status").notNull().default(true),
  isPublic: p.boolean("is_public").notNull().default(false),
});

export const mediaMetadataTable = p.pgTable("media_metadata", {
  id: idUuid,
  fileId: p
    .uuid("file_id")
    .notNull()
    .references(() => mediaTable.id, { onDelete: "cascade" }),
  mediaType: mediaTypeEnum("media_type").notNull(),
  width: p.integer("width"),
  height: p.integer("height"),
  duration: p.integer("duration"),
  metadataJson: p.text("metadata_json").default(""),
  thumbnailKey: p.varchar("thumbnail_key", { length: 255 }),
});

export const adsTable = p.pgTable("advertisements", {
  id: idUuid,
  createdAt,
  updatedAt,
  title: p.varchar("title", { length: 255 }).notNull(),
  description: p.varchar("description", { length: 255 }).notNull(),
  type: adsTypeEnum("type").notNull(),
  image_id: p
    .uuid("image_id")
    .notNull()
    .references(() => mediaTable.id),
  link: p.varchar("link", { length: 500 }).notNull(),
  position: adsPositionEnum("ads_position").default("home-top"),
  sortOrder: p.integer("sort_order").default(0),
  isActive: p.boolean("is_active").default(true),
  startDate: p.timestamp("start_date").notNull(),
  endDate: p.timestamp("end_date").notNull(),
});

export const heroCardsTable = p.pgTable("hero_cards", {
  id: idUuid,
  createdAt,
  updatedAt,
  title: p.varchar("title", { length: 255 }).notNull(),
  description: p.text("description").notNull(),
  buttonText: p.varchar("button_text", { length: 100 }).notNull(),
  buttonUrl: p.varchar("button_url", { length: 500 }),
  backgroundClass: p
    .varchar("background_class", { length: 100 })
    .default("bg-blue-50"),
  imageId: p.uuid("image_id").references(() => mediaTable.id),
  sortOrder: p.integer("sort_order").default(0),
  isActive: p.boolean("is_active").default(true),
});

export const productsTable = p.pgTable("products_table", {
  id: idUuid,
  createdAt,
  updatedAt,
  spuCode: p.varchar("spu_code", { length: 64 }).notNull().unique(),
  name: p.varchar("name", { length: 255 }).notNull(),
  description: p.text("description"),
  status: p.integer("status").notNull().default(1),
  factoryId: p.uuid("factory_id").references(() => factoriesTable.id, {
    onDelete: "restrict",
  }),
  units: p.varchar("units", { length: 20 }),
});

export const productCategoriesTable = p.pgTable("product_categories", {
  productId: p
    .uuid("product_id")
    .notNull()
    .references(() => productsTable.id),
  categoryId: p
    .uuid("category_id")
    .notNull()
    .references(() => categoriesTable.id),
});

export const productMediaTable = p.pgTable("product_images", {
  productId: p
    .uuid("product_id")
    .notNull()
    .references(() => productsTable.id),
  imageId: p
    .uuid("image_id")
    .notNull()
    .references(() => mediaTable.id),
  isMain: p.boolean("is_main").default(false),
});

export const attributeTemplateTable = p.pgTable("attribute_templates", {
  id: idUuid,
  createdAt,
  name: p.varchar("name", { length: 100 }).notNull(),
  categoryId: p
    .uuid("category_id")
    .notNull()
    .references(() => categoriesTable.id),
});

export const attributeTable = p.pgTable("attributes_table", {
  id: idUuid,
  createdAt,
  templateId: p
    .uuid("template_id")
    .notNull()
    .references(() => attributeTemplateTable.id),
  name: p.varchar("name", { length: 100 }).notNull(),
  code: p.varchar("code", { length: 50 }).notNull(),
  inputType: InputTypeEnum("input_type").default("select"),
  isRequired: p.boolean("is_required").default(true),
  isSaleAttr: p.boolean("is_sale_attr").default(true),
  sortOrder: p.integer("sort_order").default(0),
});

export const attributeValueTable = p.pgTable("attribute_values_table", {
  id: idUuid,
  createdAt,
  attributeId: p
    .uuid("attribute_id")
    .notNull()
    .references(() => attributeTable.id),
  value: p.varchar("value", { length: 100 }).notNull(),
  valueCode: p.varchar("value_code", { length: 50 }).notNull(),
  sortOrder: p.integer("sort_order").default(0),
});

export const productTemplateTable = p.pgTable("product_template_table", {
  productId: p
    .uuid("product_id")
    .primaryKey()
    .references(() => productsTable.id, { onDelete: "cascade" }),
  templateId: p
    .uuid("template_id")
    .notNull()
    .references(() => attributeTemplateTable.id),
  createdAt: p.timestamp("created_at").defaultNow(),
});

export const skusTable = p.pgTable("skus_table", {
  id: idUuid,
  createdAt,
  updatedAt,
  skuCode: p.varchar("sku_code", { length: 100 }).notNull().unique(),
  productId: p.uuid("product_id").notNull(),
  imageId: p.uuid("image_id").references(() => mediaTable.id),
  price: p
    .decimal("price", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"),
  marketPrice: p.decimal("market_price", { precision: 10, scale: 2 }),
  costPrice: p.decimal("cost_price", { precision: 10, scale: 2 }),
  weight: p.decimal("weight", { precision: 8, scale: 3 }).default("0.000"),
  volume: p.decimal("volume", { precision: 10, scale: 3 }).default("0.000"),
  stock: p.decimal("stock").default("0"),
  specJson: p.json("spec_json").notNull(),
  extraAttributes: p.json("extra_attributes"),
  status: p.integer("status").notNull().default(1),
});

export const productFactoriesTable = p.pgTable(
  "product_factories",
  {
    productId: p
      .uuid("product_id")
      .notNull()
      .references(() => productsTable.id, { onDelete: "cascade" }),
    factoryId: p
      .uuid("factory_id")
      .notNull()
      .references(() => factoriesTable.id, { onDelete: "cascade" }),
  },
  (t) => [p.primaryKey({ columns: [t.productId, t.factoryId] })]
);

export const productStatisticsTable = p.pgTable("product_statistics", {
  id: idUuid,
  createdAt,
  updatedAt,
  productId: p.integer("product_id"), // ⚠️ 注意：这里可能是错误，应为 uuid？
  date: p.varchar("date", { length: 10 }).notNull(),
  viewType: p.varchar("view_type", { length: 50 }).notNull(),
  count: p.integer("count").default(0).notNull(),
});

export const CustomerTable = p.pgTable("customer", {
  id: idUuid,
  createdAt,
  updatedAt,
  companyName: p.varchar("company_name", { length: 200 }).notNull(),
  name: p.varchar("contact_name", { length: 100 }),
  email: p.varchar("email", { length: 255 }),
  whatsapp: p.varchar("whatsapp", { length: 50 }),
  phone: p.varchar("phone", { length: 20 }),
  address: p.text("address"),
});

export const inquiryTable = p.pgTable("inquiries", {
  id: idUuid,
  createdAt,
  updatedAt,
  customerName: p.varchar("customer_name", { length: 100 }),
  customerCompany: p.varchar("company_name", { length: 200 }).notNull(),
  customerEmail: p.varchar("email", { length: 255 }).notNull(),
  customerPhone: p.integer("phone"), // ⚠️ 可能应为 varchar
  customerWhatsapp: p.varchar("whatsapp", { length: 50 }),
  status: inquiryStatusEnum("status").default("pending").notNull(),
});

export const inquiryItemsTable = p.pgTable("inquiry_items", {
  id: idUuid,
  createdAt,
  updatedAt,
  inquiryId: p
    .uuid("inquiry_id")
    .notNull()
    .references(() => inquiryTable.id, { onDelete: "cascade" }),
  skuId: p
    .uuid("Sku_id")
    .notNull()
    .references(() => skusTable.id),
  productName: p.varchar("product_name", { length: 255 }).notNull(),
  productDescription: p.text("product_description"),
  skuQuantity: p.integer("sku_quantity").notNull(),
  skuImage: p.varchar("sku_image", { length: 500 }),
  skuPrice: p.decimal("sku_price", { precision: 10, scale: 2 }),
  paymentMethod: p.varchar("payment_method", { length: 255 }).notNull(),
  customerRequirements: p.text("customer_requirements"),
});

export const quotationsTable = p.pgTable("quotations", {
  id: idUuid,
  createdAt,
  updatedAt,
  refNo: p.varchar("ref_no", { length: 50 }).notNull(),
  date: p.date("date").notNull(),
  clientId: p
    .uuid("client_id")
    .notNull()
    .references(() => CustomerTable.id, { onDelete: "restrict" }),
  exporterId: p
    .uuid("exporter_id")
    .notNull()
    .references(() => exportersTable.id, { onDelete: "restrict" }),
  deliveryTimeDays: p.varchar("delivery_time_days", { length: 50 }),
  sampleLeadtimeDays: p.varchar("sample_leadtime_days", { length: 50 }),
  paymentTerms: p.text("payment_terms"),
  qualityRemark: p.text("quality_remark"),
  safetyCompliance: p.text("safety_compliance"),
  status: p.varchar("status", { length: 20 }).default("draft").notNull(),
});

export const quotationItemsTable = p.pgTable("quotation_items", {
  id: idUuid,
  createdAt,
  updatedAt,
  quotationId: p
    .uuid("quotation_id")
    .notNull()
    .references(() => quotationsTable.id, { onDelete: "cascade" }),
  productId: p
    .uuid("product_id")
    .notNull()
    .references(() => productsTable.id, { onDelete: "restrict" }),
  factoryId: p
    .uuid("factory_id")
    .notNull()
    .references(() => factoriesTable.id, { onDelete: "restrict" }),
  unitPriceUsd: p
    .decimal("unit_price_usd", {
      precision: 10,
      scale: 2,
    })
    .notNull(),
  quantity: p.integer("quantity").notNull(),
  totalUsd: p.decimal("total_usd", { precision: 12, scale: 2 }).notNull(),
  remark: p.text("remark"),
});

export const siteConfigTable = p.pgTable("site_config", {
  id: idUuid,
  createdAt,
  updatedAt,
  key: p.varchar("key", { length: 100 }).notNull().unique(),
  value: p.text("value").notNull().default(""),
  description: p.text("description").default(""),
  category: p.varchar("category", { length: 50 }).default("general"),
  url: p.varchar("url", { length: 255 }).default(""),
  translatable: p.boolean("translatable").default(true),
  visible: p.boolean("visible").default(false),
});

export const dailyInquiryCounterTable = p.pgTable("daily_inquiry_counter", {
  id: idUuid,
  createdAt,
  updatedAt,
  date: p.varchar("date", { length: 10 }).notNull().unique(),
  count: p.integer("count").default(0).notNull(),
  lastResetAt: p.timestamp("last_reset_at").defaultNow(),
});

export const translationDictTable = p.pgTable("translation_dict", {
  id: idUuid,
  key: p.varchar("key", { length: 255 }).notNull().unique(),
  category: p.varchar("category", { length: 100 }).default("general"),
  description: p.text("description"),
  translations: p.json("translations").notNull().$type<Record<string, any>>(),
  isActive: p.boolean("is_active").default(true),
  sortOrder: p.integer("sort_order").default(0),
  createdAt,
  updatedAt,
});

// --- Multi-site Support Tables ---

// 站点表 - 核心中的核心
export const sitesTable = p.pgTable("sites", {
  id: idUuid,
  createdAt,
  updatedAt,
  name: p.varchar("name", { length: 100 }).notNull(),
  domain: p.varchar("domain", { length: 255 }).unique().notNull(),

  // 站点类型：factory 或 exporter
  siteType: p.varchar("site_type", { enum: ["factory", "exporter"] }).notNull(),

  // 关联的业务实体ID
  entityId: p.uuid("entity_id").notNull(), // factory_id 或 exporter_id

  // 站点配置
  themeConfig: p.json("theme_config").$type<Record<string, any>>(),
  featureConfig: p.json("feature_config").$type<Record<string, any>>(),

  isActive: p.boolean("is_active").default(true),

});

// 站点分类表 - 每个站点独立的分类体系
export const siteCategoriesTable = p.pgTable("site_categories", {
  id: idUuid,
  siteId: p.uuid("site_id").references(() => sitesTable.id).notNull(),

  name: p.varchar("name", { length: 100 }).notNull(),
  parentId: p.uuid("parent_id"),
  sortOrder: p.integer("sort_order").default(0),

  // 分类可以关联到全局分类（可选，用于数据聚合）
  globalCategoryId: p.uuid("global_category_id").references(() => categoriesTable.id),

  createdAt,
  updatedAt,
});

// 站点商品关联表 - 每个站点展示的商品
export const siteProductsTable = p.pgTable("site_products", {
  id: idUuid,
  createdAt,
  updatedAt,
  siteId: p.uuid("site_id").references(() => sitesTable.id).notNull(),
  productId: p.uuid("product_id").references(() => productsTable.id).notNull(),

  // 站点级别的商品配置
  sitePrice: p.decimal("site_price", { precision: 10, scale: 2 }),
  siteName: p.varchar("site_name", { length: 200 }), // 站点可以自定义商品名
  siteDescription: p.text(), // 站点可以自定义商品描述

  // 展示控制
  isFeatured: p.boolean("is_featured").default(false),
  sortOrder: p.integer("sort_order").default(0),
  isVisible: p.boolean("is_visible").default(true),

  // SEO
  seoTitle: p.varchar("seo_title", { length: 200 }),
  seoDescription: p.text(),

  // 关联站点分类
  siteCategoryId: p.uuid("site_category_id").references(() => siteCategoriesTable.id),


});

// 用户站点权限表
export const userSitePermissionsTable = p.pgTable("user_site_permissions", {
  id: idUuid,
  userId: p.uuid("user_id").references(() => usersTable.id).notNull(),
  siteId: p.uuid("site_id").references(() => sitesTable.id).notNull(),

  role: p.varchar("role", { enum: ["admin", "editor", "viewer"] }).notNull(),

  createdAt,
  updatedAt,
});


