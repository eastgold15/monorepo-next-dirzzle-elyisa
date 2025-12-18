import { useAuthStore } from "@/stores/auth-store";

// 权限控制 hooks
export function usePermissions() {
  const {
    can,
    hasRole,
    hasPermission,
    isSuperAdmin,
    isFactoryAdmin,
    isExporterAdmin,
    user,
    permissions,
  } = useAuthStore();

  return {
    // 基础权限检查
    can,
    hasRole,
    hasPermission,

    // 角色检查
    isSuperAdmin,
    isFactoryAdmin,
    isExporterAdmin,

    // 用户信息
    user,
    permissions,

    // 常用权限组合
    canManageUsers: can('user:create') || can('user:update') || can('user:delete'),
    canManageProducts: can('product:create') || can('product:update') || can('product:delete'),
    canManageOrders: can('order:create') || can('order:update') || can('order:delete'),
    canManageSite: can('site:update') || can('site:config:update'),

    // 权限装饰器
    withPermission: (permission: string) => (fn: () => void) => {
      return () => {
        if (can(permission)) {
          fn();
        }
      };
    },

    // 获取用户显示名称
    getUserDisplayName: () => {
      return user?.name || user?.email || '未知用户';
    },

    // 获取用户角色显示名称
    getUserRoleDisplay: () => {
      const roleMap: Record<string, string> = {
        super_admin: '超级管理员',
        exporter_admin: '出口商管理员',
        factory_admin: '工厂管理员',
        salesperson: '业务员',
      };
      return roleMap[user?.role?.name || ''] || user?.role?.name || '未知角色';
    },
  };
}

// 单个权限 hook
export function usePermission(permission: string) {
  const { can } = useAuthStore();
  return can(permission);
}

// 多个权限 hook（全部满足）
export function useAllPermissions(permissions: string[]) {
  const { can } = useAuthStore();
  return permissions.every(p => can(p));
}

// 多个权限 hook（满足任一）
export function useAnyPermission(permissions: string[]) {
  const { can } = useAuthStore();
  return permissions.some(p => can(p));
}

// 角色 hook
export function useRole(role: string | string[]) {
  const { hasRole } = useAuthStore();
  return hasRole(role);
}