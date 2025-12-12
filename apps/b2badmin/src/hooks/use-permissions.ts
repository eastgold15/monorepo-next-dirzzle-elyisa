"use client";

import { useUser } from "./use-user";
import type { UserRole, Permission, DataScope } from "@repo/contract";

export function usePermissions() {
  const { data: user, isLoading, error } = useUser();

  // 获取用户角色
  const getRole = (): UserRole | null => {
    if (!user) return null;

    // 根据用户关联的工厂和出口商判断角色
    if (user.primaryExporter) {
      return user.exporters?.some(e => e.role === 'admin') ? 'exporter_admin' : 'factory_admin';
    }

    if (user.primaryFactory) {
      return user.factories?.some(f => f.role === 'admin') ? 'factory_admin' : 'salesperson';
    }

    return 'salesperson'; // 默认为业务员
  };

  // 检查是否有特定权限
  const hasPermission = (permission: Permission): boolean => {
    const role = getRole();
    if (!role) return false;

    // 这里可以扩展为从后端获取用户的完整权限列表
    const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
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
        'view_users', 'create_users', 'edit_users',
        'view_factories', 'edit_factories',
        'view_products', 'create_products', 'edit_products', 'delete_products', 'publish_products',
        'view_media', 'upload_media', 'delete_media',
        'view_orders', 'process_orders',
        'view_analytics',
        'view_categories', 'assign_categories'
      ],
      salesperson: [
        'view_products', 'create_products', 'edit_products',
        'view_media', 'upload_media', 'delete_media',
        'view_orders'
      ]
    };

    return ROLE_PERMISSIONS[role].includes(permission);
  };

  // 检查是否有任一权限
  const hasAnyPermission = (permissions: Permission[]): boolean =>
    permissions.some(permission => hasPermission(permission));

  // 检查是否有所有权限
  const hasAllPermissions = (permissions: Permission[]): boolean =>
    permissions.every(permission => hasPermission(permission));

  // 获取数据访问范围
  const getDataScope = (): DataScope => {
    const role = getRole();
    if (!role) {
      return {
        products: 'own',
        users: 'own',
        factories: 'own',
        orders: 'own'
      };
    }

    switch (role) {
      case 'exporter_admin':
        return {
          products: 'all',
          users: 'all',
          factories: 'all',
          orders: 'all'
        };
      case 'factory_admin':
        return {
          products: 'factory',
          users: 'factory',
          factories: 'own',
          orders: 'factory'
        };
      case 'salesperson':
        return {
          products: 'own',
          users: 'own',
          factories: 'own',
          orders: 'own'
        };
      default:
        return {
          products: 'own',
          users: 'own',
          factories: 'own',
          orders: 'own'
        };
    }
  };

  // 获取用户可以访问的工厂ID列表
  const getAccessibleFactoryIds = (): string[] => {
    if (!user) return [];

    const role = getRole();
    if (role === 'exporter_admin') {
      // 出口商管理员可以访问所有下属工厂
      return user.factories?.map(f => f.id) || [];
    }

    if (role === 'factory_admin' || role === 'salesperson') {
      // 工厂管理员和业务员只能访问自己的工厂
      return user.primaryFactory ? [user.primaryFactory.id] : [];
    }

    return [];
  };

  // 获取用户可以访问的出口商ID
  const getAccessibleExporterId = (): string | null => {
    if (!user) return null;

    const role = getRole();
    if (role === 'exporter_admin') {
      return user.primaryExporter?.id || null;
    }

    if (role === 'factory_admin' || role === 'salesperson') {
      // 工厂管理员和业务员通过工厂关联到出口商
      return user.primaryExporter?.id || null;
    }

    return null;
  };

  return {
    user,
    isLoading,
    error,
    role: getRole(),
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    dataScope: getDataScope(),
    getAccessibleFactoryIds,
    getAccessibleExporterId,
    // 便捷方法
    canViewUsers: () => hasPermission('view_users'),
    canCreateUsers: () => hasPermission('create_users'),
    canEditUsers: () => hasPermission('edit_users'),
    canDeleteUsers: () => hasPermission('delete_users'),

    canViewFactories: () => hasPermission('view_factories'),
    canCreateFactories: () => hasPermission('create_factories'),
    canEditFactories: () => hasPermission('edit_factories'),

    canViewProducts: () => hasPermission('view_products'),
    canCreateProducts: () => hasPermission('create_products'),
    canEditProducts: () => hasPermission('edit_products'),
    canDeleteProducts: () => hasPermission('delete_products'),
    canPublishProducts: () => hasPermission('publish_products'),

    canUploadMedia: () => hasPermission('upload_media'),
    canDeleteMedia: () => hasPermission('delete_media'),

    canViewAnalytics: () => hasPermission('view_analytics'),
    canEditSiteConfig: () => hasPermission('edit_site_config'),
  };
}