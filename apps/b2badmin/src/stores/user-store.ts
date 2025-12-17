import type { SiteTModel, UserTModel } from "@repo/contract";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { rpc } from "@/lib/rpc";

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
  // 用户信息
  userInfo: {
    user: UserTModel["Entity"];
    currentSite: SiteTModel["Entity"];
    tenantId: string;
    tenantType: "factory" | "exporter";
    roles: string;
    permissions: string[];
    can: (action: string) => boolean;
    allSites: SiteInfo[];
  } | null;
  isLoading: boolean;
  error: any;

  // 站点信息
  currentSiteId: string | null;
  accessibleSites: SiteInfo[];
  currentSite: SiteInfo | null;

  // Actions
  setUser: (user: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: any) => void;
  setAccessibleSites: (sites: SiteInfo[]) => void;
  setCurrentSite: (siteId: string) => void;
  rehydrateSite: () => void;
  switchSite: (siteId: string) => Promise<boolean>;
  refreshSites: () => Promise<void>;
  clearUser: () => void;
}

// 创建用户状态管理
export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        userInfo: null,
        isLoading: true,
        error: null,
        currentSiteId: null,
        accessibleSites: [],
        currentSite: null,

        // 从 localStorage 恢复站点信息
        rehydrateSite: () => {
          const currentState = get();
          if (currentState.currentSiteId && currentState.accessibleSites.length > 0 && !currentState.currentSite) {
            const site = currentState.accessibleSites.find(s => s.site.id === currentState.currentSiteId);
            if (site) {
              set({ currentSite: site });
            }
          }
        },

        // 设置用户信息
        setUser: (user: any) => {
          set({ userInfo: user, error: null });

          // 从用户信息中提取站点信息
          if (user?.allSites) {
            const { setAccessibleSites } = get();
            setAccessibleSites(user.allSites);

            // 尝试恢复站点信息
            const { rehydrateSite } = get();
            rehydrateSite();

            // 如果当前没有选中站点，使用后端返回的 currentSite
            const currentState = get();
            if (!currentState.currentSiteId && user.currentSite) {
              const currentSiteInfo = user.allSites.find((site: SiteInfo) => site.site.id === user.currentSite.id);
              if (currentSiteInfo) {
                set({
                  currentSiteId: currentSiteInfo.site.id,
                  currentSite: currentSiteInfo,
                });
                // 保存到 localStorage
                localStorage.setItem("SiteId", currentSiteInfo.site.id);
              }
            }
          }
        },

        // 设置加载状态
        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },

        // 设置错误
        setError: (error: any) => {
          set({ error });
        },

        // 设置可访问站点
        setAccessibleSites: (sites: SiteInfo[]) => {
          set({ accessibleSites: sites });

          // 如果当前站点不在可访问列表中，重置当前站点
          const { currentSiteId } = get();
          if (currentSiteId && !sites.find(s => s.site.id === currentSiteId)) {
            const firstSite = sites[0];
            if (firstSite) {
              set({
                currentSiteId: firstSite.site.id,
                currentSite: firstSite,
              });
              localStorage.setItem("SiteId", firstSite.site.id);
            } else {
              set({
                currentSiteId: null,
                currentSite: null,
              });
              localStorage.removeItem("SiteId");
            }
          }
        },

        // 设置当前站点
        setCurrentSite: (siteId: string) => {
          const { accessibleSites } = get();
          const site = accessibleSites.find((s) => s.site.id === siteId);

          if (site) {
            set({
              currentSiteId: siteId,
              currentSite: site,
            });
            localStorage.setItem("SiteId", siteId);
          }
        },

        // 切换站点（调用API）
        switchSite: async (siteId: string): Promise<boolean> => {
          try {
            const response = await rpc.api.site.switch.post({ siteId });
            const { data, error } = response;

            if (error || !data) {
              console.error("站点切换失败:", error);
              return false;
            }

            // 更新本地状态
            const { setUser, setCurrentSite } = get();

            // 更新用户信息和站点信息
            setUser(data);
            setCurrentSite(siteId);

            return true;
          } catch (error) {
            console.error("站点切换失败:", error);
            return false;
          }
        },

        // 刷新站点列表
        refreshSites: async () => {
          try {
            const response = await rpc.api.site.accessible.get();
            const { data } = response;

            if (data?.sites) {
              const { setAccessibleSites } = get();
              setAccessibleSites(data.sites);
            }
          } catch (error) {
            console.error("刷新站点列表失败:", error);
          }
        },

        // 清除用户信息（登出时使用）
        clearUser: () => {
          set({
            userInfo: null,
            isLoading: false,
            error: null,
            currentSiteId: null,
            accessibleSites: [],
            currentSite: null,
          });
          localStorage.removeItem("SiteId");
        },
      }),
      {
        name: "user-storage",
        // 持久化必要的信息
        partialize: (state) => ({
          currentSiteId: state.currentSiteId,
        }),
      }
    ),
    {
      name: "user-store",
    }
  )
);

// 便捷的hooks
export const useUserInfo = () => useUserStore((state) => state.userInfo);
export const useCurrentUser = () => useUserStore((state) => state.userInfo?.user);
export const useIsUserLoading = () => useUserStore((state) => state.isLoading);
export const useUserError = () => useUserStore((state) => state.error);
export const useUserPermissions = () => useUserStore((state) => state.userInfo?.permissions || []);
export const useUserRole = () => useUserStore((state) => state.userInfo?.roles);
export const useUserCan = () => useUserStore((state) => state.userInfo?.can || (() => false));
export const useTenantId = () => useUserStore((state) => state.userInfo?.tenantId);
export const useTenantType = () => useUserStore((state) => state.userInfo?.tenantType);

// 站点相关hooks
export const useCurrentSite = () => useUserStore((state) => state.currentSite);
export const useCurrentSiteId = () => useUserStore((state) => state.currentSiteId);
export const useAccessibleSites = () => useUserStore((state) => state.accessibleSites);

// 获取当前用户的角色
export const useCurrentRole = () => useUserStore((state) => state.currentSite?.role.name);

// 判断角色权限
export const useIsSuperAdmin = () => {
  const currentRole = useCurrentRole();
  return currentRole === "super_admin";
};

export const useIsExporterAdmin = () => {
  const currentRole = useCurrentRole();
  return currentRole === "exporter_admin";
};

export const useIsFactoryAdmin = () => {
  const currentRole = useCurrentRole();
  return currentRole === "factory_admin";
};

export const useIsSalesperson = () => {
  const currentRole = useCurrentRole();
  return currentRole === "salesperson";
};

// 获取站点类型
export const useSiteType = () => useUserStore((state) => state.currentSite?.site.siteType);

// 判断站点类型
export const useIsFactorySite = () => {
  const siteType = useSiteType();
  return siteType === "factory";
};

export const useIsExporterSite = () => {
  const siteType = useSiteType();
  return siteType === "exporter";
};