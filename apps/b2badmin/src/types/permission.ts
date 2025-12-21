/**
 * 1. 定义所有资源基础名称 (从你的 getAllTableNames 提取)
 */
export const PERMISSION_RESOURCES = [
  "USERS",
  "ACCOUNT",
  "SESSION",
  "VERIFICATION",
  "ROLES",
  "PERMISSIONS",
  "ROLE_PERMISSIONS",
  "USER_SITE_ROLES",
  "EXPORTERS",
  "MASTER_CATEGORIES",
  "FACTORIES",
  "SALESPERSONS",
  "SALESPERSON_AFFILIATIONS",
  "SALESPERSON_CATEGORIES",
  "MEDIA",
  "MEDIA_METADATA",
  "ADVERTISEMENTS",
  "HERO_CARDS",
  "PRODUCTS_TABLE",
  "PRODUCT_MASTER_CATEGORIES",
  "PRODUCT_MEDIA",
  "ATTRIBUTE_TEMPLATES",
  "ATTRIBUTES_TABLE",
  "ATTRIBUTE_VALUES_TABLE",
  "PRODUCT_TEMPLATE_TABLE",
  "SKUS_TABLE",
  "SKU_MEDIA",
  "CUSTOMER",
  "INQUIRIES",
  "INQUIRY_ITEMS",
  "QUOTATIONS",
  "QUOTATION_ITEMS",
  "SITE_CONFIG",
  "DAILY_INQUIRY_COUNTER",
  "TRANSLATION_DICT",
  "SITES",
  "SITE_CATEGORIES",
  "SITE_PRODUCTS",
] as const; // 使用 as const 锁定字面量

/**
 * 2. 定义标准操作
 */
export type PermissionAction = "VIEW" | "CREATE" | "EDIT" | "DELETE";

/**
 * 3. 组合生成 PermissionType
 * 这行代码会自动生成类似 "USERS_VIEW" | "USERS_CREATE" ... 的联合类型
 */
type CRUDPermissions =
  `${(typeof PERMISSION_RESOURCES)[number]}_${PermissionAction}`;

/**
 * 4. 加上特殊的非标准权限
 */
export type ExtraPermissions = "SITES_MANAGE";

/**
 * 最终导出的权限类型
 */
export type PermissionType = CRUDPermissions | ExtraPermissions;

/**
 * 5. (可选) 导出权限常量对象，方便在代码中直接引用而非写字符串
 * 这样写：PERMISSIONS.USERS_VIEW 而不是 "USERS_VIEW"
 */
export const PERMISSIONS = [
  ...PERMISSION_RESOURCES.flatMap((res) => [
    `${res}_VIEW`,
    `${res}_CREATE`,
    `${res}_EDIT`,
    `${res}_DELETE`,
  ]),
  "SITES_MANAGE",
].reduce(
  (acc, curr) => {
    acc[curr as PermissionType] = curr as PermissionType;
    return acc;
  },
  {} as Record<PermissionType, PermissionType>
);
