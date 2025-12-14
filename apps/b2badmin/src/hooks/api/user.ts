"use client";

import type { DataScope, Permission, UserRole } from "@repo/contract";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";

// 用户信息接口类型（基于后端返回的数据结构）
export interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  exporter: {
    id: string;
    name: string;
    code: string;
    address: string;
    website: string | null;
    isActive: boolean;
    isVerified: boolean;
  } | null;
  factory: {
    id: string;
    role: string;
    isPrimary: boolean;
  } | null;
  accessibleFactories: Array<{
    id: string;
    name: string;
    code: string;
    description: string | null;
    website: string | null;
    address: string;
    contactPhone: string;
    logo: string | null;
    isActive: boolean;
    isVerified: boolean;
  }>;
  scope: {
    factoriesCount: number;
    manageScope: string;
  };
}

export interface Team {
  managers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string;
    isPrimary: boolean;
  }>;
  colleagues: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string;
    isPrimary: boolean;
  }>;
  subordinates: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
  }>;
  stats: {
    managersCount: number;
    colleaguesCount: number;
    subordinatesCount: number;
    teamSize: number;
  };
}

export interface QuickAccess {
  primaryRole: UserRole;
  canManage: boolean;
  actions: {
    canCreateUser: boolean;
    canCreateFactory: boolean;
    canViewReports: boolean;
    canManageProducts: boolean;
  };
}

// 完整的用户数据响应类型
export interface UserMeResponse {
  userInfo: UserInfo;
  organization: Organization;
  team: Team;
  quickAccess: QuickAccess;
}

// 主要的 useUser hook
export function useUser() {
  const router = useRouter();
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: async () => {
      const response = await rpc.api.user.me.get();
      const { data } = handleEden(response);

      if (!data) {
        router.push("/login");
        return null;
      }

      return data as unknown as UserMeResponse;
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// 权限相关的 hook
export function usePermissions() {
  const { data: userData, isLoading, error } = useUser();

  // 获取用户角色
  const getRole = (): UserRole | null => userData?.userInfo?.role || null;

  // 获取角色显示名称
  const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
      case "exporter_admin":
        return "出口商管理员";
      case "factory_admin":
        return "工厂管理员";
      case "salesperson":
        return "业务员";
      default:
        return "未知角色";
    }
  };

  // 获取角色图标
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "exporter_admin":
        return "🏢"; // 公司图标
      case "factory_admin":
        return "🏭"; // 工厂图标
      case "salesperson":
        return "💼"; // 公文包图标
      default:
        return "👤"; // 默认人物图标
    }
  };

  // 检查是否有特定权限
  const hasPermission = (permission: Permission): boolean => {
    // 从 quickAccess 中获取权限
    if (userData?.quickAccess) {
      switch (permission) {
        case "view_users":
          return true; // 所有角色都可以查看用户
        case "create_users":
          return userData.quickAccess.actions.canCreateUser;
        case "edit_users":
          return userData.quickAccess.actions.canCreateUser; // 能创建就能编辑
        case "delete_users":
          return userData.quickAccess.actions.canCreateUser; // 能创建就能删除
        case "view_factories":
          return true;
        case "create_factories":
          return userData.quickAccess.actions.canCreateFactory;
        case "edit_factories":
          return userData.quickAccess.actions.canCreateFactory;
        case "delete_factories":
          return userData.quickAccess.actions.canCreateFactory;
        case "view_products":
        case "create_products":
        case "edit_products":
        case "delete_products":
        case "publish_products":
          return userData.quickAccess.actions.canManageProducts;
        case "view_media":
        case "upload_media":
        case "delete_media":
          return true;
        case "view_orders":
          return true;
        case "process_orders":
          return userData.quickAccess.canManage;
        case "view_analytics":
        case "export_reports":
          return userData.quickAccess.actions.canViewReports;
        case "view_site_config":
        case "edit_site_config":
          return userData.quickAccess.canManage;
        case "view_categories":
        case "edit_categories":
        case "assign_categories":
          return userData.quickAccess.canManage;
        default:
          return false;
      }
    }

    return false;
  };

  // 检查是否有任一权限
  const hasAnyPermission = (permissions: Permission[]): boolean =>
    permissions.some((permission) => hasPermission(permission));

  // 检查是否有所有权限
  const hasAllPermissions = (permissions: Permission[]): boolean =>
    permissions.every((permission) => hasPermission(permission));

  // 获取数据访问范围
  const getDataScope = (): DataScope => {
    const role = getRole();
    if (!role) {
      return {
        products: "own",
        users: "own",
        factories: "own",
        orders: "own",
      };
    }

    switch (role) {
      case "exporter_admin":
        return {
          products: "exporter",
          users: "exporter",
          factories: "exporter",
          orders: "exporter",
        };
      case "factory_admin":
        return {
          products: "factory",
          users: "factory",
          factories: "own",
          orders: "factory",
        };
      case "salesperson":
        return {
          products: "own",
          users: "own",
          factories: "own",
          orders: "own",
        };
      default:
        return {
          products: "own",
          users: "own",
          factories: "own",
          orders: "own",
        };
    }
  };

  // 获取用户可以访问的工厂ID列表
  const getAccessibleFactoryIds = (): string[] => {
    if (!userData?.organization?.accessibleFactories) return [];
    return userData.organization.accessibleFactories.map((f) => f.id);
  };

  // 获取用户可以访问的出口商ID
  const getAccessibleExporterId = (): string | null => {
    if (!userData?.organization?.exporter) return null;
    return userData.organization.exporter.id;
  };

  // 获取主要工厂ID
  const getPrimaryFactoryId = (): string | null => {
    if (!userData?.organization?.factory) return null;
    return userData.organization.factory.id;
  };

  return {
    user: userData?.userInfo,
    organization: userData?.organization,
    team: userData?.team,
    quickAccess: userData?.quickAccess,
    userData, // 保留完整的用户数据
    isLoading,
    error,
    role: getRole(),
    getRoleDisplayName,
    getRoleIcon,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    dataScope: getDataScope(),
    getAccessibleFactoryIds,
    getAccessibleExporterId,
    getPrimaryFactoryId,

    // 便捷方法
    canViewUsers: () => hasPermission("view_users"),
    canCreateUsers: () => hasPermission("create_users"),
    canEditUsers: () => hasPermission("edit_users"),
    canDeleteUsers: () => hasPermission("delete_users"),

    canViewFactories: () => hasPermission("view_factories"),
    canCreateFactories: () => hasPermission("create_factories"),
    canEditFactories: () => hasPermission("edit_factories"),

    canViewProducts: () => hasPermission("view_products"),
    canCreateProducts: () => hasPermission("create_products"),
    canEditProducts: () => hasPermission("edit_products"),
    canDeleteProducts: () => hasPermission("delete_products"),
    canPublishProducts: () => hasPermission("publish_products"),

    canUploadMedia: () => hasPermission("upload_media"),
    canDeleteMedia: () => hasPermission("delete_media"),

    canViewAnalytics: () => hasPermission("view_analytics"),
    canEditSiteConfig: () => hasPermission("edit_site_config"),
  };
}

// 团队信息相关的 hook
export function useTeam() {
  const { team, isLoading } = usePermissions();

  return {
    team,
    isLoading,

    // 获取管理员列表
    getManagers: () => team?.managers || [],

    // 获取同事列表
    getColleagues: () => team?.colleagues || [],

    // 获取下属列表
    getSubordinates: () => team?.subordinates || [],

    // 获取团队统计
    getTeamStats: () =>
      team?.stats || {
        managersCount: 0,
        colleaguesCount: 0,
        subordinatesCount: 0,
        teamSize: 0,
      },
  };
}

// 组织架构相关的 hook
export function useOrganization() {
  const { organization, isLoading } = usePermissions();

  return {
    organization,
    isLoading,

    // 获取出口商信息
    getExporter: () => organization?.exporter || null,

    // 获取主要工厂信息
    getPrimaryFactory: () => organization?.factory || null,

    // 获取所有可访问的工厂
    getAccessibleFactories: () => organization?.accessibleFactories || [],

    // 获取工厂数量
    getFactoriesCount: () => organization?.scope?.factoriesCount || 0,

    // 获取管理范围描述
    getManageScope: () => organization?.scope?.manageScope || "",
  };
}

// 快速访问相关的 hook
export function useQuickAccess() {
  const { quickAccess, isLoading } = usePermissions();

  return {
    quickAccess,
    isLoading,

    // 是否有管理权限
    canManage: () => quickAccess?.canManage,

    // 可以创建用户
    canCreateUser: () => quickAccess?.actions?.canCreateUser,

    // 可以创建工厂
    canCreateFactory: () => quickAccess?.actions?.canCreateFactory,

    // 可以查看报表
    canViewReports: () => quickAccess?.actions?.canViewReports,

    // 可以管理商品
    canManageProducts: () => quickAccess?.actions?.canManageProducts,
  };
}

// 用户团队信息的独立 hook（用于通过邮箱查询）
export function useUserTeamInfo(email: string) {
  return useQuery({
    queryKey: ["user-team", email],
    queryFn: async () => {
      if (!email) return null;

      const response = await rpc.api.user_team.info[email].get();

      if (response.data && response.success) {
        return response.data;
      }

      return null;
    },
    enabled: !!email && email.includes("@"),
    staleTime: 1000 * 60 * 5, // 5分钟缓存
    retry: 1, // 只重试一次
  });
}