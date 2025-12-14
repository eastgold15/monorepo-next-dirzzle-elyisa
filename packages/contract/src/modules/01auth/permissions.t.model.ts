/**
 * 权限系统类型定义
 */

export type UserRole = 'exporter_admin' | 'factory_admin' | 'salesperson';

export interface UserPermission {
  role: UserRole;
  // 出口商ID（出口商管理员、工厂管理员、业务员都必须关联到某个出口商）
  exporterId?: string;
  // 工厂ID（工厂管理员和业务员必须有）
  factoryId?: string;
  // 业务员ID
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
    'view_users', 'create_users', 'edit_users', 'delete_users', // 只能管理自己出口商下的用户
    'view_factories', 'create_factories', 'edit_factories', 'delete_factories', // 只能管理自己出口商下的工厂
    'view_products', 'create_products', 'edit_products', 'delete_products', 'publish_products', // 只能管理自己出口商下的商品
    'view_media', 'upload_media', 'delete_media',
    'view_orders', 'process_orders', // 只能处理自己出口商的订单
    'view_analytics', 'export_reports', // 只能查看自己出口商的数据
    'view_site_config', 'edit_site_config', // 只能编辑自己出口商的配置
    'view_categories', 'edit_categories', 'assign_categories'
  ],
  factory_admin: [
    'view_users', 'create_users', 'edit_users', // 只能管理本工厂业务员
    'view_factories', 'edit_factories', // 只能编辑自己的工厂信息
    'view_products', 'create_products', 'edit_products', 'delete_products', 'publish_products', // 只能管理本工厂商品
    'view_media', 'upload_media', 'delete_media',
    'view_orders', 'process_orders', // 只能处理本工厂的订单
    'view_analytics', // 只能查看本工厂的分析数据
    'view_categories', 'assign_categories' // 可以分配类别给业务员
  ],
  salesperson: [
    'view_products', 'create_products', 'edit_products', // 只能编辑自己的商品
    'view_media', 'upload_media', 'delete_media',
    'view_orders' // 只能查看自己的订单
  ]
};

// 数据过滤范围
export interface DataScope {
  // 商品可见范围
  products: 'all' | 'exporter' | 'factory' | 'own';
  // 用户可见范围
  users: 'all' | 'exporter' | 'factory' | 'own';
  // 工厂可见范围
  factories: 'all' | 'exporter' | 'own';
  // 订单可见范围
  orders: 'all' | 'exporter' | 'factory' | 'own';
}

// 角色数据范围映射
export const ROLE_DATA_SCOPE: Record<UserRole, DataScope> = {
  exporter_admin: {
    products: 'exporter', // 只能查看自己出口商的商品
    users: 'exporter',    // 只能查看自己出口商的用户
    factories: 'exporter', // 只能查看自己出口商的工厂
    orders: 'exporter',    // 只能查看自己出口商的订单
  },
  factory_admin: {
    products: 'factory', // 只能查看本工厂的商品
    users: 'factory',    // 只能查看本工厂的用户
    factories: 'own',    // 只能查看自己的工厂
    orders: 'factory',    // 只能查看本工厂的订单
  },
  salesperson: {
    products: 'own',     // 只能查看自己的商品
    users: 'own',        // 只能查看自己
    factories: 'own',    // 只能查看自己的工厂信息
    orders: 'own',       // 只能查看自己的订单
  }
};