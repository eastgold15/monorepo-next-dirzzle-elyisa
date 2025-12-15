import { defineRelations } from "drizzle-orm";
import * as schema from "./table.schema";

export const relations = defineRelations(
  schema,
  (r) => ({
    // --- Auth ---
    usersTable: {
      userProfile: r.one.userProfilesTable({
        from: r.usersTable.id,
        to: r.userProfilesTable.userId,
      }),
      userRoles: r.many.userRolesTable(),
      roles: r.many.roleTable({
        from: r.usersTable.id.through(r.userRolesTable.userId),
        to: r.roleTable.id.through(r.userRolesTable.roleId),
      }),
      userResourceRoles: r.many.userResourceRolesTable(),
      accounts: r.many.accountTable(),
      sessions: r.many.sessionTable({
        alias: "sessions",
      }),
      salesperson: r.one.salespersonsTable({
        from: r.usersTable.id,
        to: r.salespersonsTable.userId,
      }),
    },
    userRolesTable: {
      user: r.one.usersTable({
        from: r.userRolesTable.userId,
        to: r.usersTable.id,
        alias: 'user',
      }),
      role: r.one.roleTable({
        from: r.userRolesTable.roleId,
        to: r.roleTable.id,
        alias: 'role',
      }),
    },

    userResourceRolesTable: {
      user: r.one.usersTable({
        from: r.userResourceRolesTable.userId,
        to: r.usersTable.id,
        alias: 'user',
      }),
      role: r.one.roleTable({
        from: r.userResourceRolesTable.roleId,
        to: r.roleTable.id,
        alias: 'role',
      }),
    },

    roleTable: {
      users: r.many.usersTable({
        from: r.roleTable.id.through(r.userRolesTable.roleId),
        to: r.usersTable.id.through(r.userRolesTable.userId),
      }),
      permissions: r.many.permissionTable({
        from: r.roleTable.id.through(r.rolePermissionsTable.roleId),
        to: r.permissionTable.id.through(r.rolePermissionsTable.permissionId),
      }),
      userRoles: r.many.userRolesTable({
        alias: 'user_roles',
      }),
      rolePermissions: r.many.rolePermissionsTable({
        alias: 'role_permissions',
      }),
      userResourceRoles: r.many.userResourceRolesTable({
        alias: 'user_resource_roles',
      }),
    },
    rolePermissionsTable: {
      role: r.one.roleTable({
        from: r.rolePermissionsTable.roleId,
        to: r.roleTable.id,
        alias: 'role',
      }),
      permission: r.one.permissionTable({
        from: r.rolePermissionsTable.permissionId,
        to: r.permissionTable.id,
        alias: 'permission',
      }),
    },
    permissionTable: {
      roles: r.many.roleTable({
        from: r.permissionTable.id.through(r.rolePermissionsTable.permissionId),
        to: r.roleTable.id.through(r.rolePermissionsTable.roleId),
      }),
      rolePermissions: r.many.rolePermissionsTable({
        alias: 'role_permissions',
      }),
    },

    // // --- Exporters & Factories ---
    exportersTable: {
      factories: r.many.factoriesTable({
        alias: 'factories',
      }),
      quotations: r.many.quotationsTable({
        alias: 'quotations',
      }),
    },

    factoriesTable: {
      exporter: r.one.exportersTable({
        from: r.factoriesTable.exporterId,
        to: r.exportersTable.id,
        alias: 'exporter',
      }),
      categories: r.many.categoriesTable({
        from: r.factoriesTable.id.through(r.factoryCategoryTable.factoryId),
        to: r.categoriesTable.id.through(r.factoryCategoryTable.categoryId),
      }),
      salespersons: r.many.salespersonsTable({
        alias: 'salespersons',
      }),
      products: r.many.productsTable({
        from: r.factoriesTable.id.through(r.productFactoriesTable.factoryId),
        to: r.productsTable.id.through(r.productFactoriesTable.productId),
      }),
      productsViaFactory: r.many.productFactoriesTable({
        alias: 'products_via_factory',
      }),
      media: r.many.mediaTable({
        alias: 'media',
      }),
    },

    factoryCategoryTable: {
      factory: r.one.factoriesTable({
        from: r.factoryCategoryTable.factoryId,
        to: r.factoriesTable.id,
        alias: 'factory',
      }),
      category: r.one.categoriesTable({
        from: r.factoryCategoryTable.categoryId,
        to: r.categoriesTable.id,
        alias: 'category',
      }),
    },

    // // --- Salespersons ---
    salespersonsTable: {
      user: r.one.usersTable({
        from: r.salespersonsTable.userId,
        to: r.usersTable.id,
        alias: 'user',
      }),
      factory: r.one.factoriesTable({
        from: r.salespersonsTable.factoryId,
        to: r.factoriesTable.id,
        alias: 'factory',
      }),
      categories: r.many.categoriesTable({
        from: r.salespersonsTable.id.through(r.salespersonCategoriesTable.salespersonId),
        to: r.categoriesTable.id.through(r.salespersonCategoriesTable.categoryId),
      }),
      assignedCategories: r.many.salespersonCategoriesTable({
        alias: 'assigned_categories',
      }),
    },

    salespersonCategoriesTable: {
      salesperson: r.one.salespersonsTable({
        from: r.salespersonCategoriesTable.salespersonId,
        to: r.salespersonsTable.id,
        alias: 'salesperson',
      }),
      category: r.one.categoriesTable({
        from: r.salespersonCategoriesTable.categoryId,
        to: r.categoriesTable.id,
        alias: 'category',
      }),
    },

    // --- Categories ---
    categoriesTable: {
      parent: r.one.categoriesTable({
        from: r.categoriesTable.parentId,
        to: r.categoriesTable.id,
        alias: 'parent',
      }),
      children: r.many.categoriesTable({
        from: r.categoriesTable.id,
        to: r.categoriesTable.parentId,
      }),
      factories: r.many.factoriesTable({
        from: r.categoriesTable.id.through(r.factoryCategoryTable.categoryId),
        to: r.factoriesTable.id.through(r.factoryCategoryTable.factoryId),
      }),
      factoryCategories: r.many.factoryCategoryTable({
        alias: 'factory_categories',
      }),
      salespersons: r.many.salespersonsTable({
        from: r.categoriesTable.id.through(r.salespersonCategoriesTable.categoryId),
        to: r.salespersonsTable.id.through(r.salespersonCategoriesTable.salespersonId),
      }),
      salespersonCategories: r.many.salespersonCategoriesTable({
        alias: 'salespersons',
      }),
      products: r.many.productsTable({
        from: r.categoriesTable.id.through(r.productCategoriesTable.categoryId),
        to: r.productsTable.id.through(r.productCategoriesTable.productId),
      }),
      productCategories: r.many.productCategoriesTable({
        alias: 'products',
      }),
      attributeTemplates: r.many.attributeTemplateTable({
        alias: 'attribute_templates',
      }),
    },

    // --- Media ---
    mediaTable: {
      metadata: r.one.mediaMetadataTable({
        from: r.mediaTable.id,
        to: r.mediaMetadataTable.fileId,
        alias: 'metadata',
      }),
      ads: r.many.adsTable({
        alias: 'ads',
      }),
      heroCards: r.many.heroCardsTable({
        alias: 'hero_cards',
      }),
      productMedia: r.many.productMediaTable({
        alias: 'product_media',
      }),
      skus: r.many.skusTable({
        alias: 'skus',
      }),
      user: r.one.usersTable({
        from: r.mediaTable.userId,
        to: r.usersTable.id,
        alias: 'user',
      }),
      factory: r.one.factoriesTable({
        from: r.mediaTable.factoryId,
        to: r.factoriesTable.id,
        alias: 'factory',
      }),
    },

    mediaMetadataTable: {
      media: r.one.mediaTable({
        from: r.mediaMetadataTable.fileId,
        to: r.mediaTable.id,
        alias: 'media',
      }),
    },

    // --- Ads & Hero Cards ---
    adsTable: {
      imageRef: r.one.mediaTable({
        from: r.adsTable.image_id,
        to: r.mediaTable.id,
        alias: 'image_ref',
      }),
    },

    heroCardsTable: {
      media: r.one.mediaTable({
        from: r.heroCardsTable.imageId,
        to: r.mediaTable.id,
      }),
    },

    // --- Products ---
    productsTable: {
      categories: r.many.categoriesTable({
        from: r.productsTable.id.through(r.productCategoriesTable.productId),
        to: r.categoriesTable.id.through(r.productCategoriesTable.categoryId),
      }),
      factories: r.many.factoriesTable({
        from: r.productsTable.id.through(r.productFactoriesTable.productId),
        to: r.factoriesTable.id.through(r.productFactoriesTable.factoryId),
      }),
      productMedia: r.many.productMediaTable({
        alias: 'product_media',
      }),
      productCategories: r.many.productCategoriesTable({
        alias: 'product_categories',
      }),
      skus: r.many.skusTable({
        alias: 'skus',
      }),
      productTemplate: r.one.productTemplateTable({
        from: r.productsTable.id,
        to: r.productTemplateTable.productId,
      }),
      productFactories: r.many.productFactoriesTable({
        alias: 'product_factories',
      }),
      factory: r.one.factoriesTable({
        from: r.productsTable.factoryId,
        to: r.factoriesTable.id,
      }),
      quotationItems: r.many.quotationItemsTable({
        alias: 'quotation_items',
      }),
    },

    productCategoriesTable: {
      product: r.one.productsTable({
        from: r.productCategoriesTable.productId,
        to: r.productsTable.id,
        alias: 'product',
      }),
      category: r.one.categoriesTable({
        from: r.productCategoriesTable.categoryId,
        to: r.categoriesTable.id,
        alias: 'category',
      }),
    },

    productMediaTable: {
      product: r.one.productsTable({
        from: r.productMediaTable.productId,
        to: r.productsTable.id,
      }),
      media: r.one.mediaTable({
        from: r.productMediaTable.imageId,
        to: r.mediaTable.id,
      }),
    },

    productFactoriesTable: {
      product: r.one.productsTable({
        from: r.productFactoriesTable.productId,
        to: r.productsTable.id,
      }),
      factory: r.one.factoriesTable({
        from: r.productFactoriesTable.factoryId,
        to: r.factoriesTable.id,
      }),
    },

    // --- Attributes ---
    attributeTemplateTable: {
      category: r.one.categoriesTable({
        from: r.attributeTemplateTable.categoryId,
        to: r.categoriesTable.id,
      }),
      attributes: r.many.attributeTable({
        from: r.attributeTemplateTable.id,
        to: r.attributeTable.templateId,
      }),
      productTemplates: r.many.productTemplateTable({
        from: r.attributeTemplateTable.id,
        to: r.productTemplateTable.templateId,
        alias: 'product_templates',
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
      media: r.one.mediaTable({
        from: r.skusTable.imageId,
        to: r.mediaTable.id,
      }),
      inquiryItems: r.many.inquiryItemsTable({
        alias: 'inquiry_items',
      }),
    },

    // --- Inquiries ---
    inquiryTable: {
      items: r.many.inquiryItemsTable({
        alias: 'items',
      }),
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
      items: r.many.quotationItemsTable({
      }),
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

    // --- Sites ---
    sitesTable: {
      siteCategories: r.many.siteCategoriesTable(),
      siteProducts: r.many.siteProductsTable(),
    },

    siteCategoriesTable: {
      site: r.one.sitesTable({
        from: r.siteCategoriesTable.siteId,
        to: r.sitesTable.id,
        alias: 'site',
      }),
      parent: r.one.siteCategoriesTable({
        from: r.siteCategoriesTable.parentId,
        to: r.siteCategoriesTable.id,
        alias: 'parent',
      }),
      children: r.many.siteCategoriesTable({
        alias: 'children',
      }),
      globalCategory: r.one.categoriesTable({
        from: r.siteCategoriesTable.globalCategoryId,
        to: r.categoriesTable.id,
        alias: 'global_category',
      }),
      siteProducts: r.many.siteProductsTable(),
    },

    siteProductsTable: {
      site: r.one.sitesTable({
        from: r.siteProductsTable.siteId,
        to: r.sitesTable.id,
        alias: 'site',
      }),
      product: r.one.productsTable({
        from: r.siteProductsTable.productId,
        to: r.productsTable.id,
        alias: 'product',
      }),
      siteCategory: r.one.siteCategoriesTable({
        from: r.siteProductsTable.siteCategoryId,
        to: r.siteCategoriesTable.id,
        alias: 'site_category',
      }),
    },

    userSitePermissionsTable: {
      user: r.one.usersTable({
        from: r.userSitePermissionsTable.userId,
        to: r.usersTable.id,
        alias: 'user',
      }),
      site: r.one.sitesTable({
        from: r.userSitePermissionsTable.siteId,
        to: r.sitesTable.id,
        alias: 'site',
      }),
    },
  })
);
