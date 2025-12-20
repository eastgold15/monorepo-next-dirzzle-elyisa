// 权限常量定义
export const PERMISSIONS = {
  // 用户管理权限
  USER: {
    CREATE: "user:create",
    READ: "user:read",
    UPDATE: "user:update",
    DELETE: "user:delete",
    LIST: "user:list",
    MANAGE_ROLES: "user:manage_roles",
  },

  // 商品管理权限
  PRODUCT: {
    CREATE: "product:create",
    READ: "product:read",
    UPDATE: "product:update",
    DELETE: "product:delete",
    LIST: "product:list",
    MANAGE_TEMPLATES: "product:manage_templates",
    MANAGE_CATEGORIES: "product:manage_categories",
  },

  // SKU 管理权限
  SKU: {
    CREATE: "sku:create",
    READ: "sku:read",
    UPDATE: "sku:update",
    DELETE: "sku:delete",
    LIST: "sku:list",
    MANAGE_STOCK: "sku:manage_stock",
  },

  // 订单管理权限
  ORDER: {
    CREATE: "order:create",
    READ: "order:read",
    UPDATE: "order:update",
    DELETE: "order:delete",
    LIST: "order:list",
    MANAGE_STATUS: "order:manage_status",
    EXPORT: "order:export",
  },

  // 站点管理权限
  SITE: {
    CREATE: "site:create",
    READ: "site:read",
    UPDATE: "site:update",
    DELETE: "site:delete",
    LIST: "site:list",
    MANAGE_CONFIG: "site:manage_config",
    SWITCH: "site:switch",
  },

  // 站点分类权限
  SITE_CATEGORY: {
    CREATE: "site_category:create",
    READ: "site_category:read",
    UPDATE: "site_category:update",
    DELETE: "site_category:delete",
    LIST: "site_category:list",
  },

  // 媒体文件权限
  MEDIA: {
    UPLOAD: "media:upload",
    READ: "media:read",
    UPDATE: "media:update",
    DELETE: "media:delete",
    LIST: "media:list",
    MANAGE_STORAGE: "media:manage_storage",
  },

  // 首页卡片权限
  HERO_CARDS: {
    CREATE: "hero_cards:create",
    READ: "hero_cards:read",
    UPDATE: "hero_cards:update",
    DELETE: "hero_cards:delete",
    LIST: "hero_cards:list",
    MANAGE_ORDER: "hero_cards:manage_order",
  },

  // 广告管理权限
  ADVERTISEMENT: {
    CREATE: "advertisement:create",
    READ: "advertisement:read",
    UPDATE: "advertisement:update",
    DELETE: "advertisement:delete",
    LIST: "advertisement:list",
    MANAGE_POSITIONS: "advertisement:manage_positions",
  },

  // 工厂管理权限
  FACTORY: {
    CREATE: "factory:create",
    READ: "factory:read",
    UPDATE: "factory:update",
    DELETE: "factory:delete",
    LIST: "factory:list",
    MANAGE_AFFILIATIONS: "factory:manage_affiliations",
  },

  // 出口商管理权限
  EXPORTER: {
    CREATE: "exporter:create",
    READ: "exporter:read",
    UPDATE: "exporter:update",
    DELETE: "exporter:delete",
    LIST: "exporter:list",
    MANAGE_AFFILIATIONS: "exporter:manage_affiliations",
  },

  // 系统管理权限
  SYSTEM: {
    DASHBOARD: "system:dashboard",
    LOGS: "system:logs",
    CONFIG: "system:config",
    HEALTH: "system:health",
  },

  // 超级管理员权限
  SUPER: "*", // 所有权限
} as const;

// 权限分组，方便快速判断
export const PERMISSION_GROUPS = {
  // 用户管理相关权限
  USER_MANAGEMENT: [
    PERMISSIONS.USER.CREATE,
    PERMISSIONS.USER.READ,
    PERMISSIONS.USER.UPDATE,
    PERMISSIONS.USER.DELETE,
    PERMISSIONS.USER.LIST,
    PERMISSIONS.USER.MANAGE_ROLES,
  ],

  // 商品管理相关权限
  PRODUCT_MANAGEMENT: [
    PERMISSIONS.PRODUCT.CREATE,
    PERMISSIONS.PRODUCT.READ,
    PERMISSIONS.PRODUCT.UPDATE,
    PERMISSIONS.PRODUCT.DELETE,
    PERMISSIONS.PRODUCT.LIST,
    PERMISSIONS.PRODUCT.MANAGE_TEMPLATES,
    PERMISSIONS.PRODUCT.MANAGE_CATEGORIES,
    PERMISSIONS.SKU.CREATE,
    PERMISSIONS.SKU.READ,
    PERMISSIONS.SKU.UPDATE,
    PERMISSIONS.SKU.DELETE,
    PERMISSIONS.SKU.LIST,
    PERMISSIONS.SKU.MANAGE_STOCK,
  ],

  // 订单管理相关权限
  ORDER_MANAGEMENT: [
    PERMISSIONS.ORDER.CREATE,
    PERMISSIONS.ORDER.READ,
    PERMISSIONS.ORDER.UPDATE,
    PERMISSIONS.ORDER.DELETE,
    PERMISSIONS.ORDER.LIST,
    PERMISSIONS.ORDER.MANAGE_STATUS,
    PERMISSIONS.ORDER.EXPORT,
  ],

  // 内容管理相关权限
  CONTENT_MANAGEMENT: [
    PERMISSIONS.HERO_CARDS.CREATE,
    PERMISSIONS.HERO_CARDS.READ,
    PERMISSIONS.HERO_CARDS.UPDATE,
    PERMISSIONS.HERO_CARDS.DELETE,
    PERMISSIONS.HERO_CARDS.LIST,
    PERMISSIONS.HERO_CARDS.MANAGE_ORDER,
    PERMISSIONS.ADVERTISEMENT.CREATE,
    PERMISSIONS.ADVERTISEMENT.READ,
    PERMISSIONS.ADVERTISEMENT.UPDATE,
    PERMISSIONS.ADVERTISEMENT.DELETE,
    PERMISSIONS.ADVERTISEMENT.LIST,
    PERMISSIONS.ADVERTISEMENT.MANAGE_POSITIONS,
  ],

  // 站点管理相关权限
  SITE_MANAGEMENT: [
    PERMISSIONS.SITE.CREATE,
    PERMISSIONS.SITE.READ,
    PERMISSIONS.SITE.UPDATE,
    PERMISSIONS.SITE.DELETE,
    PERMISSIONS.SITE.LIST,
    PERMISSIONS.SITE.MANAGE_CONFIG,
    PERMISSIONS.SITE.SWITCH,
    PERMISSIONS.SITE_CATEGORY.CREATE,
    PERMISSIONS.SITE_CATEGORY.READ,
    PERMISSIONS.SITE_CATEGORY.UPDATE,
    PERMISSIONS.SITE_CATEGORY.DELETE,
    PERMISSIONS.SITE_CATEGORY.LIST,
  ],

  // 系统管理相关权限
  SYSTEM_MANAGEMENT: [
    PERMISSIONS.SYSTEM.DASHBOARD,
    PERMISSIONS.SYSTEM.LOGS,
    PERMISSIONS.SYSTEM.CONFIG,
    PERMISSIONS.SYSTEM.HEALTH,
  ],
} as const;

// 角色定义
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  EXPORTER_ADMIN: "exporter_admin",
  FACTORY_ADMIN: "factory_admin",
  SALESPERSON: "salesperson",
} as const;

// 角色默认权限配置
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [ROLES.SUPER_ADMIN]: [PERMISSIONS.SUPER],

  [ROLES.EXPORTER_ADMIN]: [
    ...PERMISSION_GROUPS.USER_MANAGEMENT,
    ...PERMISSION_GROUPS.PRODUCT_MANAGEMENT,
    ...PERMISSION_GROUPS.ORDER_MANAGEMENT,
    ...PERMISSION_GROUPS.CONTENT_MANAGEMENT,
    ...PERMISSION_GROUPS.SITE_MANAGEMENT,
    PERMISSIONS.FACTORY.CREATE,
    PERMISSIONS.FACTORY.READ,
    PERMISSIONS.FACTORY.UPDATE,
    PERMISSIONS.FACTORY.DELETE,
    PERMISSIONS.FACTORY.LIST,
    PERMISSIONS.FACTORY.MANAGE_AFFILIATIONS,
    PERMISSIONS.MEDIA.UPLOAD,
    PERMISSIONS.MEDIA.READ,
    PERMISSIONS.MEDIA.UPDATE,
    PERMISSIONS.MEDIA.DELETE,
    PERMISSIONS.MEDIA.LIST,
  ],

  [ROLES.FACTORY_ADMIN]: [
    PERMISSIONS.USER.LIST,
    PERMISSIONS.USER.READ,
    PERMISSIONS.USER.CREATE,
    ...PERMISSION_GROUPS.PRODUCT_MANAGEMENT,
    ...PERMISSION_GROUPS.ORDER_MANAGEMENT,
    PERMISSIONS.SITE.READ,
    PERMISSIONS.SITE.UPDATE,
    PERMISSIONS.SITE.MANAGE_CONFIG,
    PERMISSIONS.SITE_CATEGORY.CREATE,
    PERMISSIONS.SITE_CATEGORY.READ,
    PERMISSIONS.SITE_CATEGORY.UPDATE,
    PERMISSIONS.SITE_CATEGORY.DELETE,
    PERMISSIONS.SITE_CATEGORY.LIST,
    ...PERMISSION_GROUPS.CONTENT_MANAGEMENT,
    PERMISSIONS.MEDIA.UPLOAD,
    PERMISSIONS.MEDIA.READ,
    PERMISSIONS.MEDIA.UPDATE,
    PERMISSIONS.MEDIA.DELETE,
    PERMISSIONS.MEDIA.LIST,
  ],

  [ROLES.SALESPERSON]: [
    PERMISSIONS.PRODUCT.READ,
    PERMISSIONS.PRODUCT.LIST,
    PERMISSIONS.SKU.READ,
    PERMISSIONS.SKU.LIST,
    PERMISSIONS.SKU.MANAGE_STOCK,
    PERMISSIONS.ORDER.CREATE,
    PERMISSIONS.ORDER.READ,
    PERMISSIONS.ORDER.LIST,
    PERMISSIONS.ORDER.UPDATE,
    PERMISSIONS.SITE.READ,
    PERMISSIONS.SITE_CATEGORY.READ,
    PERMISSIONS.SITE_CATEGORY.LIST,
    PERMISSIONS.HERO_CARDS.READ,
    PERMISSIONS.HERO_CARDS.LIST,
    PERMISSIONS.ADVERTISEMENT.READ,
    PERMISSIONS.ADVERTISEMENT.LIST,
    PERMISSIONS.MEDIA.UPLOAD,
    PERMISSIONS.MEDIA.READ,
    PERMISSIONS.MEDIA.LIST,
  ],
} as const;
