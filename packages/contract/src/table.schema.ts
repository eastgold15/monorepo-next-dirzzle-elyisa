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

const Audit = {
  id: idUuid,
  createdAt,
  updatedAt,
};
// 定义一个“租户组合”
export const tenantCols = {
  // 1. 物理归属：属于哪个出口商
  exporterId: p.uuid("exporter_id").references(() => exportersTable.id),
  // 2. 物理归属：属于哪个工厂
  factoryId: p.uuid("factory_id").references(() => factoriesTable.id),
  // 3. 个人归属：属于哪个业务员
  ownerId: p.uuid("owner_id").references(() => usersTable.id),
  // 4. 公开属性：是否是“公海”数据
  isPublic: p.boolean("is_public").default(false).notNull(),
  siteId: p.uuid("site_id").references(() => sitesTable.id),
};
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
]);

export const entityTypeEnum = p.pgEnum("entity_type", ["exporter", "factory"]);

// --- Tables ---
export const usersTable = p.pgTable("user_table", {
  ...Audit,
  name: p.text("name").notNull(),
  email: p.text("email").notNull().unique(),
  emailVerified: p.boolean("email_verified").default(false).notNull(),
  image: p.text("image"),
  //
  isSuperAdmin: p.boolean("is_super_admin").default(false).notNull(),
  isActive: p.boolean("is_active").default(true).notNull(),
  phone: p.text("phone"),
  address: p.text("address"),
  city: p.text("city"),
});

export const accountTable = p.pgTable("account", {
  ...Audit,
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
  ...Audit,
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
  ...Audit,
  identifier: p.text("identifier").notNull(),
  value: p.text("value").notNull(),
  expiresAt: p.timestamp("expires_at").notNull(),
});

export const roleTable = p.pgTable("roles", {
  id: idUuid,
  name: p.text("name").notNull().unique(),
  description: p.text("description"),
  // 🔥 新增：区分这是"系统内置角色"还是"用户自定义角色"
  type: p
    .varchar("type", { enum: ["system", "custom"] })
    .default("custom")
    .notNull(),

  // 🔥 新增：权重值
  // 100 = Owner, 80 = Admin, 50 = Editor, 10 = Viewer
  priority: p.integer("priority").default(0).notNull(),

  // 新增：支持角色继承
  parentRoleId: p.uuid("parent_role_id"), // 🔥 自引用外键
});

export const permissionTable = p.pgTable("permissions", {
  ...Audit,
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

// 5. 🔥 核心：用户-站点-角色 关联表 (工牌表)
// 这张表决定了 "谁" 在 "哪个站" 是 "什么身份"
export const userSiteRolesTable = p.pgTable(
  "user_site_roles",
  {
    userId: p
      .uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    siteId: p
      .uuid("site_id")
      .notNull()
      .references(() => sitesTable.id, { onDelete: "cascade" }),
    roleId: p
      .uuid("role_id")
      .notNull()
      .references(() => roleTable.id, { onDelete: "restrict" }),
    createdAt: p.timestamp("created_at").defaultNow(),
  },
  (t) => [p.primaryKey({ columns: [t.userId, t.siteId] })] // 一个用户在一个站点只能有一个角色(通常足够)，若需兼职可去掉此主键限制
);

export const exportersTable = p.pgTable("exporters", {
  ...Audit,
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

export const masterTable = p.pgTable("master_categories", {
  id: idUuid,
  name: p.varchar("name", { length: 255 }).notNull(),
  slug: p.varchar("slug", { length: 100 }).notNull().unique(),
  description: p.varchar("description", { length: 255 }).notNull(),
  parentId: p.uuid("parent_id"),
  sortOrder: p.integer("sort_order").default(0),
  isActive: p.boolean("is_active").default(true),
  icon: p.varchar("icon", { length: 255 }).default(""),
  createdAt,
  updatedAt,
});

export const factoriesTable = p.pgTable("factories", {
  ...Audit,
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

// export const factoryCategoryTable = p.pgTable(
//   "factory_category",
//   {
//     factoryId: p
//       .uuid("factory_id")
//       .notNull()
//       .references(() => factoriesTable.id, { onDelete: "cascade" }),
//     categoryId: p
//       .uuid("category_id")
//       .notNull()
//       .references(() => MasterTable.id, { onDelete: "cascade" }),
//   },
//   (t) => [p.primaryKey({ columns: [t.factoryId, t.categoryId] })]
// );

export const salespersonsTable = p.pgTable("salespersons", {
  ...Audit,
  userId: p
    .uuid("user_id")
    .notNull()
    .unique()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  phone: p.varchar("phone", { length: 50 }),
  whatsapp: p.varchar("whatsapp", { length: 50 }),
  position: p.varchar("position", { length: 100 }),
  department: p.varchar("department", { length: 100 }),
  isActive: p.boolean("is_active").default(true).notNull(),
  avatar: p.varchar("avatar", { length: 500 }),
  lastAssignedAt: p.timestamp("last_assigned_at"),
});

export const salespersonAffiliationsTable = p.pgTable(
  "salesperson_affiliations",
  {
    ...Audit,
    salespersonId: p
      .uuid("salesperson_id")
      .notNull()
      .references(() => salespersonsTable.id, { onDelete: "cascade" }),
    // 只能有一个非空
    factoryId: p.uuid("factory_id").references(() => factoriesTable.id, {
      onDelete: "cascade",
    }),
    exporterId: p.uuid("exporter_id").references(() => exportersTable.id, {
      onDelete: "cascade",
    }),
    entityType: entityTypeEnum("entity_type").notNull(),
  }
);

export const salespersonMasterCategoriesTable = p.pgTable(
  "salesperson_categories",
  {
    salespersonId: p
      .uuid("salesperson_id")
      .notNull()
      .references(() => salespersonsTable.id, { onDelete: "cascade" }),
    masterCategoryId: p
      .uuid("master_category_id")
      .notNull()
      .references(() => masterTable.id, { onDelete: "cascade" }),
  },
  (t) => [p.primaryKey({ columns: [t.salespersonId, t.masterCategoryId] })]
);

export const mediaTable = p.pgTable("media", {
  ...Audit,
  storageKey: p.varchar("storage_key", { length: 255 }).notNull(),
  category: p.varchar("category").notNull(),
  url: p.varchar("url", { length: 255 }).notNull(),
  originalName: p.varchar("original_name", { length: 255 }).notNull(),
  mimeType: p.varchar("mime_type", { length: 100 }).notNull(),
  status: p.boolean("status").notNull().default(true),
  thumbnailUrl: p.text("thumbnail_url"), // 如果是视频，存储封面图
  // 关键字段：使用枚举或字符串
  // 'image' | 'video'
  mediaType: p.varchar("media_type", { length: 20 }).notNull().default("image"),
  ...tenantCols,
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
  ...Audit,
  title: p.varchar("title", { length: 255 }).notNull(),
  description: p.varchar("description", { length: 255 }).notNull(),
  type: adsTypeEnum("type").notNull(),
  mediaId: p
    .uuid("media_id")
    .notNull()
    .references(() => mediaTable.id),
  link: p.varchar("link", { length: 500 }).notNull(),
  position: adsPositionEnum("ads_position").default("home-top"),
  sortOrder: p.integer("sort_order").default(0),
  isActive: p.boolean("is_active").default(true),
  startDate: p.timestamp("start_date").notNull(),
  endDate: p.timestamp("end_date").notNull(),
  // 🔥 必须新增：属于哪个站点
  siteId: p
    .uuid("site_id")
    .notNull()
    .references(() => sitesTable.id, { onDelete: "cascade" }),
});

export const heroCardsTable = p.pgTable("hero_cards", {
  ...Audit,
  title: p.varchar("title", { length: 255 }).notNull(),
  description: p.text("description").notNull(),
  buttonText: p.varchar("button_text", { length: 100 }).notNull(),
  buttonUrl: p.varchar("button_url", { length: 500 }).notNull(),
  backgroundClass: p
    .varchar("background_class", { length: 100 })
    .default("bg-blue-50"),
  sortOrder: p.integer("sort_order").default(0),
  isActive: p.boolean("is_active").default(true),
  mediaId: p
    .uuid("media_id")
    .references(() => mediaTable.id)
    .notNull(),
  // 🔥 必须新增：属于哪个站点
  siteId: p
    .uuid("site_id")
    .notNull()
    .references(() => sitesTable.id, { onDelete: "cascade" }),
});

export const productsTable = p.pgTable("products_table", {
  ...Audit,
  spuCode: p.varchar("spu_code", { length: 64 }).notNull().unique(),
  name: p.varchar("name", { length: 255 }).notNull(),
  description: p.text("description"),
  status: p.integer("status").notNull().default(1),
  units: p.varchar("units", { length: 20 }),
  ...tenantCols,
});

export const productMasterCategoriesTable = p.pgTable(
  "product_categories",
  {
    productId: p
      .uuid("product_id")
      .notNull()
      .references(() => productsTable.id),
    masterCategoryId: p
      .uuid("category_id")
      .notNull()
      .references(() => masterTable.id),
  },
  (t) => [p.primaryKey({ columns: [t.productId, t.masterCategoryId] })]
);

export const productSiteCategoriesTable = p.pgTable(
  "product_site_categories",
  {
    productId: p
      .uuid("product_id")
      .notNull()
      .references(() => productsTable.id),
    siteCategoryId: p
      .uuid("category_id")
      .notNull()
      .references(() => siteCategoriesTable.id),
  },
  (t) => [p.primaryKey({ columns: [t.productId, t.siteCategoryId] })]
);

export const productMediaTable = p.pgTable(
  "product_media",
  {
    productId: p
      .uuid("product_id")
      .notNull()
      .references(() => productsTable.id),
    mediaId: p
      .uuid("media_id")
      .notNull()
      .references(() => mediaTable.id),
    isMain: p.boolean("is_main").default(false),
    sortOrder: p.integer("sort_order").notNull().default(0),
  },
  (t) => [p.primaryKey({ columns: [t.productId, t.mediaId] })]
);

export const attributeTemplateTable = p.pgTable("attribute_templates", {
  id: idUuid,
  name: p.varchar("name", { length: 100 }).notNull(),
  masterCategoryId: p
    .uuid("master_category_id")
    .notNull()
    .references(() => masterTable.id),
  siteCategoryId: p
    .uuid("site_category_id")
    .references(() => siteCategoriesTable.id), // 允许为 null：模板可以不关联站点分类
});

export const attributeTable = p.pgTable("attributes_table", {
  id: idUuid,
  templateId: p
    .uuid("template_id")
    .notNull()
    .references(() => attributeTemplateTable.id),
  key: p.varchar("key", { length: 100 }).notNull(),
  code: p.varchar("code", { length: 50 }).notNull(),
  inputType: InputTypeEnum("input_type").default("select"),
  isRequired: p.boolean("is_required").default(true),
  isSkuSpec: p.boolean("is_sku_spec").default(true),
  sortOrder: p.integer("sort_order").default(0),
});

export const attributeValueTable = p.pgTable("attribute_values_table", {
  id: idUuid,
  attributeId: p
    .uuid("attribute_id")
    .notNull()
    .references(() => attributeTable.id),
  value: p.varchar("value", { length: 100 }).notNull(),
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
});

export const skusTable = p.pgTable("skus_table", {
  ...Audit,
  skuCode: p.varchar("sku_code", { length: 100 }).notNull().unique(),

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
  productId: p
    .uuid("product_id")
    .references(() => productsTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),

  ...tenantCols,
});

export const skuMediaTable = p.pgTable(
  "sku_media",
  {
    skuId: p
      .uuid("sku_id")
      .notNull()
      .references(() => skusTable.id, { onDelete: "cascade" }),
    mediaId: p
      .uuid("media_id")
      .notNull()
      .references(() => mediaTable.id, { onDelete: "restrict" }),
    isMain: p.boolean("is_main").default(false), // 标记主图
    sortOrder: p.integer("sort_order").default(0),

    ...tenantCols,
  },
  (t) => [p.primaryKey({ columns: [t.skuId, t.mediaId] })]
);

export const CustomerTable = p.pgTable("customer", {
  ...Audit,
  companyName: p.varchar("company_name", { length: 200 }).notNull(),
  name: p.varchar("contact_name", { length: 100 }),
  email: p.varchar("email", { length: 255 }),
  whatsapp: p.varchar("whatsapp", { length: 50 }),
  phone: p.varchar("phone", { length: 20 }),
  address: p.text("address"),
  ...tenantCols,
});

export const inquiryTable = p.pgTable("inquiries", {
  ...Audit,
  inquiryNumber: p.varchar("inquiry_number", { length: 50 }).notNull(),
  customerName: p.varchar("customer_name", { length: 100 }),
  customerCompany: p.varchar("company_name", { length: 200 }).notNull(),
  customerEmail: p.varchar("email", { length: 255 }).notNull(),
  customerPhone: p.varchar("phone", { length: 50 }),
  customerWhatsapp: p.varchar("whatsapp", { length: 50 }),
  status: inquiryStatusEnum("status").default("pending").notNull(),
  ...tenantCols,
});

export const inquiryItemsTable = p.pgTable("inquiry_items", {
  ...Audit,
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
  skuPrice: p.decimal("sku_price", { precision: 10, scale: 2 }),
  paymentMethod: p.varchar("payment_method", { length: 255 }).notNull(),
  customerRequirements: p.text("customer_requirements"),
});

export const quotationsTable = p.pgTable("quotations", {
  ...Audit,
  refNo: p.varchar("ref_no", { length: 50 }).notNull(),
  date: p.date("date").notNull(),
  clientId: p
    .uuid("client_id")
    .notNull()
    .references(() => CustomerTable.id, { onDelete: "restrict" }),
  deliveryTimeDays: p.varchar("delivery_time_days", { length: 50 }),
  sampleLeadtimeDays: p.varchar("sample_leadtime_days", { length: 50 }),
  paymentTerms: p.text("payment_terms"),
  qualityRemark: p.text("quality_remark"),
  safetyCompliance: p.text("safety_compliance"),
  status: p.varchar("status", { length: 20 }).default("draft").notNull(),
  ...tenantCols,
});

export const quotationItemsTable = p.pgTable("quotation_items", {
  ...Audit,
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
  ...Audit,
  key: p.varchar("key", { length: 100 }).notNull().unique(),
  value: p.text("value").notNull().default(""),
  description: p.text("description").default(""),
  category: p.varchar("category", { length: 50 }).default("general"),
  url: p.varchar("url", { length: 255 }).default(""),
  translatable: p.boolean("translatable").default(true),
  visible: p.boolean("visible").default(false),
  // 🔥 必须新增：属于哪个站点
  siteId: p
    .uuid("site_id")
    .notNull()
    .references(() => sitesTable.id, { onDelete: "cascade" }),
});

export const dailyInquiryCounterTable = p.pgTable("daily_inquiry_counter", {
  ...Audit,
  date: p.varchar("date", { length: 10 }).notNull().unique(),
  count: p.integer("count").default(0).notNull(),
  lastResetAt: p.timestamp("last_reset_at").defaultNow(),
});

export const translationDictTable = p.pgTable("translation_dict", {
  ...Audit,
  key: p.varchar("key", { length: 255 }).notNull().unique(),
  category: p.varchar("category", { length: 100 }).default("general"),
  description: p.text("description"),
  translations: p.json("translations").notNull().$type<Record<string, any>>(),
  isActive: p.boolean("is_active").default(true),
  sortOrder: p.integer("sort_order").default(0),
});

// --- Multi-site Support Tables ---

// 站点表 - 核心中的核心
export const sitesTable = p.pgTable("sites", {
  ...Audit,

  name: p.varchar("name", { length: 100 }).notNull(),
  domain: p.varchar("domain", { length: 255 }).unique().notNull(),
  isActive: p.boolean("is_active").default(true),

  // 站点类型：factory 或 exporter
  siteType: entityTypeEnum("site_type").notNull(),
  factoryId: p.uuid("factory_id").references(() => factoriesTable.id),
  exporterId: p.uuid("exporter_id").references(() => exportersTable.id),
});

// 站点分类表 - 每个站点独立的分类体系
export const siteCategoriesTable = p.pgTable("site_categories", {
  ...Audit,

  name: p.varchar("name", { length: 100 }).notNull(),
  description: p.text("description"),
  parentId: p.uuid("parent_id"),
  sortOrder: p.integer("sort_order").default(0),
  isActive: p.boolean("is_active").default(true),

  siteId: p
    .uuid("site_id")
    .references(() => sitesTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  // 分类可以关联到全局分类（可选，用于数据聚合）
  masterCategoryId: p
    .uuid("master_category_id")
    .references(() => masterTable.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
});

// 站点商品关联表 - 每个站点展示的商品
export const siteProductsTable = p.pgTable("site_products", {
  ...Audit,

  // 站点级别的商品配置
  sitePrice: p.decimal("site_price", { precision: 10, scale: 2 }),
  siteName: p.varchar("site_name", { length: 200 }), // 站点可以自定义商品名
  siteDescription: p.text("site_description"), // 站点可以自定义商品描述

  // 展示控制
  isFeatured: p.boolean("is_featured").default(false),
  sortOrder: p.integer("sort_order").default(0),
  isVisible: p.boolean("is_visible").default(true),

  // SEO
  seoTitle: p.varchar("seo_title", { length: 200 }),

  siteId: p
    .uuid("site_id")
    .references(() => sitesTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  productId: p
    .uuid("product_id")
    .references(() => productsTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  // 关联站点分类
  siteCategoryId: p
    .uuid("site_category_id")
    .references(() => siteCategoriesTable.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
});
