import { create } from "zustand/react";

// 定义用户信息类型
interface User {
  role: {
    description: string | null;
    name: string;
    id: string;
    type: "custom" | "system";
    priority: number;
    parentRoleId: string | null;
  };
  site: {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean | null;
    domain: string;
    siteType: "exporter" | "factory";
    exporterId: string | null;
    factoryId: string | null;
  };
  name: string;
  image: string | null;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  isSuperAdmin: boolean;
  isActive: boolean;
  phone: string | null;
  address: string | null;
  city: string | null;
}

// 定义 store 状态类型
interface AuthState {
  // 用户信息
  user: User | null;
  permissions: string[];

  // 权限检查
  can: (requiredPermission: string) => boolean;
  hasRole: (role: string | string[]) => boolean;
  hasPermission: (permission: string | string[]) => boolean;

  // 更新方法
  setUser: (user: User | null) => void;
  setPermissions: (permissions: string[]) => void;
  clearAuth: () => void;

  // 工具方法
  isSuperAdmin: () => boolean;
  isFactoryAdmin: () => boolean;
  isExporterAdmin: () => boolean;
  getCurrentSiteId: () => string | null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // 初始状态
  user: null,
  permissions: [],

  // 设置用户信息
  setUser: (user) => set({ user }),

  // 设置权限列表
  setPermissions: (permissions) => set({ permissions }),

  // 清除认证信息
  clearAuth: () => set({ user: null, permissions: [] }),

  // 检查单个权限
  can: (requiredPermission) => {
    const { permissions } = get();
    if (permissions.includes("*")) return true; // 超级管理员权限

    return permissions.some((p) => {
      // 1. 完全匹配
      if (p === requiredPermission) return true;
      // 2. 通配符匹配 (例如 p 是 'sku:*'，required 是 'sku:create')
      if (p.endsWith(":*")) {
        const prefix = p.split(":")[0];
        return requiredPermission.startsWith(`${prefix}:`);
      }
      return false;
    });
  },

  // 检查角色
  hasRole: (role) => {
    const { user } = get();
    if (!user?.role?.name) return false;

    const requiredRoles = Array.isArray(role) ? role : [role];
    return requiredRoles.includes(user.role.name);
  },

  // 检查权限（支持单个或多个）
  hasPermission: (permission) => {
    const { can } = get();
    const permissions = Array.isArray(permission) ? permission : [permission];
    return permissions.every((p) => can(p));
  },

  // 是否是超级管理员
  isSuperAdmin: () => {
    const { user } = get();
    return user?.isSuperAdmin;
  },

  // 是否是工厂管理员
  isFactoryAdmin: () => {
    const { hasRole } = get();
    return hasRole("factory_admin");
  },

  // 是否是出口商管理员
  isExporterAdmin: () => {
    const { hasRole } = get();
    return hasRole("exporter_admin");
  },

  // 获取当前站点ID
  getCurrentSiteId: () => {
    const { user } = get();
    return user?.site?.id || null;
  },
}));
