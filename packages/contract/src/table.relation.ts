import { defineRelations } from "drizzle-orm";
import * as schema from "./table.schema";

export const relations = defineRelations(schema, (r) => ({
  // --- Auth ---
  usersTable: {
    // 🔥 关键修改 1: 用户 <-> 站点-角色 (通过 userSiteRolesTable)
    siteRoles: r.many.userSiteRolesTable(),
    accounts: r.many.accountTable(),
    sessions: r.many.sessionTable(),
    salesperson: r.one.salespersonsTable({
      from: r.usersTable.id,
      to: r.salespersonsTable.userId,
    }),
    userSiteRoles: r.one.userSiteRolesTable({
      from: r.usersTable.id,
      to: r.userSiteRolesTable.userId,
    }),
  },

  // 🔥 关键修改 2: 核心权限关联表 (新架构的中心)
  userSiteRolesTable: {
    user: r.one.usersTable({
      from: [r.userSiteRolesTable.userId],
      to: [r.usersTable.id],
    }),
    site: r.one.sitesTable({
      from: [r.userSiteRolesTable.siteId],
      to: [r.sitesTable.id],
      optional: false,
    }),
    role: r.one.roleTable({
      from: [r.userSiteRolesTable.roleId],
      to: [r.roleTable.id],
      optional: false,
    }),
  },

  roleTable: {
    // 用户不再直接关联角色，而是通过站点关联
    userSiteRoles: r.many.userSiteRolesTable(),
    Permissions: r.many.permissionTable({
      from: r.roleTable.id.through(r.rolePermissionsTable.roleId),
      to: r.permissionTable.id.through(r.rolePermissionsTable.permissionId),
      alias: "role_permissions",
    }),
    parentRole: r.one.roleTable({
      from: r.roleTable.parentRoleId,
      to: r.roleTable.id,
      alias: "parent_role",
    }),
  },

  rolePermissionsTable: {
    role: r.one.roleTable({
      from: r.rolePermissionsTable.roleId,
      to: r.roleTable.id,
      optional: false,
      alias: "role",
    }),
    permission: r.one.permissionTable({
      from: r.rolePermissionsTable.permissionId,
      to: r.permissionTable.id,
      alias: "permission",
      optional: false,
    }),
  },
  permissionTable: {
    roles: r.many.roleTable({
      from: r.permissionTable.id.through(r.rolePermissionsTable.permissionId),
      to: r.roleTable.id.through(r.rolePermissionsTable.roleId),
    }),
  },

  // // --- Exporters & Factories ---
  exportersTable: {
    factories: r.many.factoriesTable({
      from: r.exportersTable.id,
      to: r.factoriesTable.exporterId,
      alias: "factories",
    }),
    quotations: r.many.quotationsTable({
      from: r.exportersTable.id,
      to: r.quotationsTable.exporterId,
      alias: "quotations",
    }),
    // 🔥 站点可以被 Exporter 拥有
    sites: r.many.sitesTable({
      from: r.exportersTable.id,
      to: r.sitesTable.exporterId,
      alias: "sites",
    }),
  },

  factoriesTable: {
    exporter: r.one.exportersTable({
      from: r.factoriesTable.exporterId,
      to: r.exportersTable.id,
      alias: "exporter",
    }),
    // categories: r.many.MasterTable({
    //   from: r.factoriesTable.id.through(r.factoryCategoryTable.factoryId),
    //   to: r.MasterTable.id.through(r.factoryCategoryTable.categoryId),
    // }),
    // salespersons: r.many.salespersonsTable({
    //   from: r.factoriesTable.id.through(r.salespersonCategoriesTable.factoryId),
    //   to: r.salespersonsTable.id.through(r.salespersonCategoriesTable.salespersonId),
    //   alias: 'salespersons',
    // }),
    // media: r.many.mediaTable({
    //   from: r.factoriesTable.id.through(r.mediaTable.factoryId),
    //   to: r.mediaTable.id.through(r.factoriesTable.id),
    //   alias: 'media',
    // }),
    // 🔥 站点可以被 Factory 拥有
    sites: r.many.sitesTable({
      from: r.factoriesTable.id,
      to: r.sitesTable.factoryId,
      alias: "sites",
    }),
  },

  // --- Master Categories (全局标准) ---
  masterTable: {
    // 假设您已将原 categoriesTable 重命名为 MasterTable
    parent: r.one.masterTable({
      from: r.masterTable.parentId,
      to: r.masterTable.id,
      alias: "parent",
    }),
    children: r.many.masterTable({
      from: r.masterTable.id,
      to: r.masterTable.parentId,
      alias: "children",
    }),

    sites: r.many.sitesTable({
      from: r.masterTable.id.through(r.siteCategoriesTable.masterCategoryId),
      to: r.sitesTable.id.through(r.siteCategoriesTable.siteId),
      alias: "sites",
    }),

    // factoryCategories: r.many.factoryCategoryTable({
    //   from: r.MasterTable.id,
    //   to: r.factoryCategoryTable.categoryId,
    // }),
    // salespersonCategories: r.many.salespersonCategoriesTable({
    //   from: r.MasterTable.id,
    //   to: r.salespersonCategoriesTable.categoryId,
    // }),
    // productCategories: r.many.productCategoriesTable({
    //   from: r.MasterTable.id,
    //   to: r.productCategoriesTable.categoryId,
    // }),
    attributeTemplates: r.many.attributeTemplateTable({
      from: r.masterTable.id,
      to: r.attributeTemplateTable.masterCategoryId,
    }),

    // 🔥 关联到站点分类 (可选关系，用于数据聚合)
    siteCategories: r.many.siteCategoriesTable({
      from: r.masterTable.id,
      to: r.siteCategoriesTable.masterCategoryId,
    }),
  },

  // --- Sites (新架构的中心) ---
  sitesTable: {
    // 🔥 站点归属: 站点关联到 Factory 或 Exporter (通过 entityId)
    exporterOwner: r.one.exportersTable({
      from: r.sitesTable.exporterId,
      to: r.exportersTable.id,
    }),
    factoryOwner: r.one.factoriesTable({
      from: r.sitesTable.factoryId,
      to: r.factoriesTable.id,
    }),

    // 关联到所有依赖站点的展示/配置数据
    userSiteRoles: r.many.userSiteRolesTable(),
    siteCategories: r.many.siteCategoriesTable(),
    siteProducts: r.many.siteProductsTable(),
    ads: r.many.adsTable(),
    heroCards: r.many.heroCardsTable(),
    siteConfig: r.many.siteConfigTable(),
    inquiries: r.many.inquiryTable(),
  },
  siteProductsTable: {
    site: r.one.sitesTable({
      from: r.siteProductsTable.siteId,
      to: r.sitesTable.id,
    }),
    product: r.one.productsTable({
      from: r.siteProductsTable.productId,
      to: r.productsTable.id,
    }),
    siteCategory: r.one.siteCategoriesTable({
      from: r.siteProductsTable.siteCategoryId,
      to: r.siteCategoriesTable.id,
    }),
  },

  siteCategoriesTable: {
    site: r.one.sitesTable({
      from: r.siteCategoriesTable.siteId,
      to: r.sitesTable.id,
    }),
    parent: r.one.siteCategoriesTable({
      from: r.siteCategoriesTable.parentId,
      to: r.siteCategoriesTable.id,
      alias: "parent",
    }),
    children: r.many.siteCategoriesTable({
      from: r.siteCategoriesTable.id,
      to: r.siteCategoriesTable.parentId,
    }),
    globalCategory: r.one.masterTable({
      from: r.siteCategoriesTable.masterCategoryId,
      to: r.masterTable.id,
      alias: "global_category",
    }),
    siteProducts: r.many.siteProductsTable(),
  },

  // --- Products (资源层) ---
  productsTable: {
    siteProducts: r.many.siteProductsTable(), // 产品被多个站点引用
    masterCategories: r.many.masterTable({
      //一个产品只有一个主分类
      from: r.productsTable.id.through(
        r.productMasterCategoriesTable.productId
      ),
      to: r.masterTable.id.through(
        r.productMasterCategoriesTable.masterCategoryId
      ),
    }),
    siteCategory: r.many.siteCategoriesTable({
      from: r.productsTable.id.through(r.productSiteCategoriesTable.productId),
      to: r.siteCategoriesTable.id.through(
        r.productSiteCategoriesTable.siteCategoryId
      ),
    }),
    productMedia: r.many.productMediaTable(),
    // productCategories: r.many.productCategoriesTable({
    //   alias: 'product_categories',
    // }),
    skus: r.many.skusTable({}),
    productTemplate: r.one.productTemplateTable({
      from: r.productsTable.id,
      to: r.productTemplateTable.productId,
    }),
    quotationItems: r.many.quotationItemsTable({}),
  },

  // --- Inquiries ---
  inquiryTable: {
    items: r.many.inquiryItemsTable({}),
    // 🔥 新增站点关系
    site: r.one.sitesTable({
      from: [r.inquiryTable.siteId],
      to: [r.sitesTable.id],
    }),
  },

  // --- Ads & Hero Cards ---
  adsTable: {
    site: r.one.sitesTable({
      from: [r.adsTable.siteId],
      to: [r.sitesTable.id],
    }),
    media: r.one.mediaTable({
      from: [r.adsTable.mediaId],
      to: [r.mediaTable.id],
    }),
  },
  heroCardsTable: {
    site: r.one.sitesTable({
      from: [r.heroCardsTable.siteId],
      to: [r.sitesTable.id],
    }),
    media: r.one.mediaTable({
      from: r.heroCardsTable.mediaId,
      to: r.mediaTable.id,
    }),
  },

  // --- Site Config ---
  siteConfigTable: {
    site: r.one.sitesTable({
      from: r.siteConfigTable.siteId,
      to: r.sitesTable.id,
    }),
  },
  // factoryCategoryTable: {
  //   factory: r.one.factoriesTable({
  //     from: r.factoryCategoryTable.factoryId,
  //     to: r.factoriesTable.id,
  //     alias: 'factory',
  //   }),
  //   category: r.one.MasterTable({
  //     from: r.factoryCategoryTable.categoryId,
  //     to: r.MasterTable.id,
  //     alias: 'category',
  //   }),
  // },

  // // --- Salespersons ---
  salespersonsTable: {
    user: r.one.usersTable({
      from: r.salespersonsTable.userId,
      to: r.usersTable.id,
      alias: "user",
    }),

    // 从属分类
    affiliations: r.many.salespersonAffiliationsTable({
      from: r.salespersonsTable.id,
      to: r.salespersonAffiliationsTable.salespersonId,
      alias: "affiliations",
    }),
    // factory: r.one.factoriesTable({
    //   from: r.salespersonsTable.factoryId,
    //   to: r.factoriesTable.id,
    //   alias: 'factory',
    // }),
    masterCategories: r.many.masterTable({
      from: r.salespersonsTable.id.through(
        r.salespersonMasterCategoriesTable.salespersonId
      ),
      to: r.masterTable.id.through(
        r.salespersonMasterCategoriesTable.masterCategoryId
      ),
    }),
    // assignedCategories: r.many.salespersonCategoriesTable({
    //   alias: 'assigned_categories',
    // }),
  },

  salespersonAffiliationsTable: {
    salesperson: r.one.salespersonsTable({
      from: r.salespersonAffiliationsTable.salespersonId,
      to: r.salespersonsTable.id,
      alias: "salesperson",
    }),
    factory: r.one.factoriesTable({
      from: r.salespersonAffiliationsTable.factoryId,
      to: r.factoriesTable.id,
      alias: "factory",
    }),
    exporter: r.one.exportersTable({
      from: r.salespersonAffiliationsTable.exporterId,
      to: r.exportersTable.id,
      alias: "exporter",
    }),
    // category: r.one.MasterTable({
    //   from: r.salespersonCategoriesTable.categoryId,
    //   to: r.MasterTable.id,
    //   alias: 'category',
    // }),
  },

  // --- Media ---
  mediaTable: {
    metadata: r.one.mediaMetadataTable({
      from: r.mediaTable.id,
      to: r.mediaMetadataTable.fileId,
      alias: "metadata",
    }),
    ads: r.many.adsTable({}),
    heroCards: r.many.heroCardsTable({}),
    productMedia: r.many.productMediaTable({}),
    skuMedia: r.one.skuMediaTable({
      from: r.mediaTable.id,
      to: r.skuMediaTable.mediaId,
    }),
    // factory: r.one.factoriesTable({
    //   from: r.mediaTable.factoryId,
    //   to: r.factoriesTable.id,
    // }),
  },

  mediaMetadataTable: {
    media: r.one.mediaTable({
      from: r.mediaMetadataTable.fileId,
      to: r.mediaTable.id,
      alias: "media",
    }),
  },

  productCategoriesTable: {
    // product: r.one.productsTable({
    //   from: r.productCategoriesTable.productId,
    //   to: r.productsTable.id,
    //   alias: 'product',
    // }),
    // category: r.one.MasterTable({
    //   from: r.productCategoriesTable.categoryId,
    //   to: r.MasterTable.id,
    //   alias: 'category',
    // }),
  },

  productMediaTable: {
    product: r.one.productsTable({
      from: r.productMediaTable.productId,
      to: r.productsTable.id,
    }),
    media: r.one.mediaTable({
      from: r.productMediaTable.mediaId,
      to: r.mediaTable.id,
    }),
  },

  // --- Attributes ---
  attributeTemplateTable: {
    masterCategory: r.one.masterTable({
      from: r.attributeTemplateTable.masterCategoryId,
      to: r.masterTable.id,
    }),
    siteCategory: r.one.siteCategoriesTable({
      from: r.attributeTemplateTable.siteCategoryId,
      to: r.siteCategoriesTable.id,
    }),
    attributes: r.many.attributeTable({
      from: r.attributeTemplateTable.id,
      to: r.attributeTable.templateId,
    }),
    productTemplates: r.many.productTemplateTable({
      from: r.attributeTemplateTable.id,
      to: r.productTemplateTable.templateId,
      alias: "product_templates",
    }),
  },

  attributeTable: {
    template: r.one.attributeTemplateTable({
      from: r.attributeTable.templateId,
      to: r.attributeTemplateTable.id,
    }),
    values: r.many.attributeValueTable({
      from: r.attributeTable.id,
      to: r.attributeValueTable.attributeId,
    }),
  },

  attributeValueTable: {
    attribute: r.one.attributeTable({
      from: r.attributeValueTable.attributeId,
      to: r.attributeTable.id,
    }),
  },

  productTemplateTable: {
    product: r.one.productsTable({
      from: r.productTemplateTable.productId,
      to: r.productsTable.id,
    }),
    template: r.one.attributeTemplateTable({
      from: r.productTemplateTable.templateId,
      to: r.attributeTemplateTable.id,
    }),
  },

  // --- SKUs ---
  skusTable: {
    product: r.one.productsTable({
      from: r.skusTable.productId,
      to: r.productsTable.id,
    }),
    media: r.many.mediaTable({
      from: r.skusTable.id.through(r.skuMediaTable.skuId),
      to: r.mediaTable.id.through(r.skuMediaTable.mediaId),
    }),
    inquiryItems: r.many.inquiryItemsTable(),
  },

  inquiryItemsTable: {
    inquiry: r.one.inquiryTable({
      from: r.inquiryItemsTable.inquiryId,
      to: r.inquiryTable.id,
    }),
    sku: r.one.skusTable({
      from: r.inquiryItemsTable.skuId,
      to: r.skusTable.id,
    }),
  },

  // --- Quotations ---
  quotationsTable: {
    client: r.one.CustomerTable({
      from: r.quotationsTable.clientId,
      to: r.CustomerTable.id,
    }),
    exporter: r.one.exportersTable({
      from: r.quotationsTable.exporterId,
      to: r.exportersTable.id,
    }),
    items: r.many.quotationItemsTable({}),
  },

  quotationItemsTable: {
    quotation: r.one.quotationsTable({
      from: r.quotationItemsTable.quotationId,
      to: r.quotationsTable.id,
    }),
    product: r.one.productsTable({
      from: r.quotationItemsTable.productId,
      to: r.productsTable.id,
    }),
    factory: r.one.factoriesTable({
      from: r.quotationItemsTable.factoryId,
      to: r.factoriesTable.id,
    }),
  },

  // --- Others ---
  CustomerTable: {
    quotations: r.many.quotationsTable(),
  },

  accountTable: {
    user: r.one.usersTable({
      from: r.accountTable.userId,
      to: r.usersTable.id,
    }),
  },

  sessionTable: {
    user: r.one.usersTable({
      from: r.sessionTable.userId,
      to: r.usersTable.id,
    }),
  },
}));
