import type { SiteTModel, UserTModel } from "@repo/contract";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// 站点信息的类型定义（与后端返回的 allSites 结构一致）
export interface SiteInfo {
  role: {
    name: string;
    priority: number;
  };
  site: SiteTModel["Entity"];
}

// 用户状态接口
interface UserState {
  // 用户信息（不包含权限，权限由 auth-store 管理）
  userInfo: {
    user: UserTModel["Entity"];
    currentSite: SiteTModel["Entity"];
    tenantId: string;
    tenantType: "factory" | "exporter";
    allSites: SiteInfo[];
  } | null;
  isLoading: boolean;
  error: any;

  // Actions
  setUser: (user: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: any) => void;
  setAccessibleSites: (sites: SiteInfo[]) => void;
  clearUser: () => void;
}

// 创建用户状态管理
export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        userInfo: null,
        isLoading: false,
        error: null,

        // 设置用户信息
        setUser: (user: any) => {
          set({ userInfo: user, error: null });
        },

        // 设置加载状态
        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },

        // 设置错误
        setError: (error: any) => {
          set({ error });
        },

        // 设置可访问站点（保留此功能用于站点切换器）
        setAccessibleSites: (sites: SiteInfo[]) => {
          set((state) => ({
            userInfo: state.userInfo ? { ...state.userInfo, allSites: sites } : null,
          }));
        },

        // 清除用户信息（登出时使用）
        clearUser: () => {
          set({
            userInfo: null,
            isLoading: false,
            error: null,
          });
        },
      }),
      {
        name: "user-info-storage",
        // 持久化必要的信息
        partialize: (state) => ({}), // 不持久化敏感信息
      }
    ),
    {
      name: "user-info-store",
    }
  )
);

// 便捷的hooks
export const useUserInfo = () => useUserStore((state) => state.userInfo);
export const useCurrentUser = () =>
  useUserStore((state) => state.userInfo?.user);
export const useIsUserLoading = () => useUserStore((state) => state.isLoading);
export const useUserError = () => useUserStore((state) => state.error);
export const useAllSites = () =>
  useUserStore((state) => state.userInfo?.allSites || []);
export const useTenantId = () =>
  useUserStore((state) => state.userInfo?.tenantId);
export const useTenantType = () =>
  useUserStore((state) => state.userInfo?.tenantType);

// 当前站点相关hooks
export const useCurrentSite = () =>
  useUserStore((state) => state.userInfo?.currentSite);

// 当前角色相关hooks
export const useCurrentRole = () => {
  const allSites = useAllSites();
  const currentSite = useCurrentSite();

  // 从可访问站点列表中找到当前站点的角色
  const currentSiteInfo = allSites.find(site => site.site?.id === currentSite?.id);
  return currentSiteInfo?.role?.name;
};

// 可访问站点 - 为了向后兼容
export const useAccessibleSites = useAllSites;