/**
 * 权限系统类型定义
 */

export type UserRole = 'exporter_admin' | 'factory_admin' | 'salesperson';

export interface UserPermission {
  role: UserRole;
  // 出口商权限
  exporterId?: string;
  // 工厂权限
  factoryId?: string;
  // 业务员权限
  salespersonId?: string;
  // 权限范围
  permissions: Permission[];
}

export type Permission =
  // 用户管理
  | 'view_users'
  | 'create_users'
  | 'edit_users'
  | 'delete_users'
  // 工厂管理
  | 'view_factories'
  | 'create_factories'
  | 'edit_factories'
  | 'delete_factories'
  // 商品管理
  | 'view_products'
  | 'create_products'
  | 'edit_products'
  | 'delete_products'
  | 'publish_products'
  // 媒体管理
  | 'view_media'
  | 'upload_media'
  | 'delete_media'
  // 订单管理
  | 'view_orders'
  | 'process_orders'
  // 统计报表
  | 'view_analytics'
  | 'export_reports'
  // 系统配置
  | 'view_site_config'
  | 'edit_site_config'
  // 分类管理
  | 'view_categories'
  | 'edit_categories'
  | 'assign_categories';

// 角色权限映射
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  exporter_admin: [
    'view_users', 'create_users', 'edit_users', 'delete_users',
    'view_factories', 'create_factories', 'edit_factories', 'delete_factories',
    'view_products', 'create_products', 'edit_products', 'delete_products', 'publish_products',
    'view_media', 'upload_media', 'delete_media',
    'view_orders', 'process_orders',
    'view_analytics', 'export_reports',
    'view_site_config', 'edit_site_config',
    'view_categories', 'edit_categories', 'assign_categories'
  ],
  factory_admin: [
    'view_users', 'create_users', 'edit_users', // 只能管理本工厂业务员
    'view_factories', 'edit_factories', // 只能编辑自己的工厂
    'view_products', 'create_products', 'edit_products', 'delete_products', 'publish_products',
    'view_media', 'upload_media', 'delete_media',
    'view_orders', 'process_orders',
    'view_analytics',
    'view_categories', 'assign_categories' // 可以分配类别给业务员
  ],
  salesperson: [
    'view_products', 'create_products', 'edit_products', // 只能编辑自己的商品
    'view_media', 'upload_media', 'delete_media',
    'view_orders'
  ]
};

// 数据过滤范围
export interface DataScope {
  // 商品可见范围
  products: 'all' | 'factory' | 'own';
  // 用户可见范围
  users: 'all' | 'factory' | 'own';
  // 工厂可见范围
  factories: 'all' | 'own';
  // 订单可见范围
  orders: 'all' | 'factory' | 'own';
}