import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserMeRes } from "@/hooks/api";
import type { PermissionType } from "@/types/permission";

interface AuthState {
  // --- 原始状态 ---
  user: UserMeRes["user"] | null;
  permissions: Set<string>;
  currentSite: UserMeRes["currentSite"] | null; // 后端返回的完整站点对象
  currentSiteId: string | null; // 落地 localStorage 的 ID
  isSuperAdmin: boolean;
  allSites: UserMeRes["allSites"] | []; // 所有站点列表
  // --- 操作方法 ---
  setAuth: (data: UserMeRes | null) => void;
  clearAuth: () => void;
  hasPermission: (permission: PermissionType) => boolean;

  hasAnyPermission: (permissions: PermissionType[]) => boolean;

  /** 切换站点：更新 ID 并触发刷新以重新拉取对应站点的权限 */
  switchSite: (siteId: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      permissions: new Set(),
      currentSite: null,
      currentSiteId: null,
      isSuperAdmin: false,
      allSites: [], // 初始化时为空

      setAuth: (data) => {
        if (!data) {
          get().clearAuth();
          return;
        }
        set({
          user: data.user,
          permissions: new Set(data.permissions || []),
          currentSite: data.currentSite,
          // 只有当 data.currentSite 存在时才覆盖当前 ID
          currentSiteId: data.currentSite?.id || null,
          isSuperAdmin: !!data.user?.isSuperAdmin,
          allSites: data.allSites || [],
        });
      },

      hasPermission: (perm: PermissionType) => {
        const { permissions, isSuperAdmin } = get();
        return isSuperAdmin ? true : permissions.has(perm);
      },

      hasAnyPermission: (perms) => {
        const { permissions, isSuperAdmin } = get();
        if (isSuperAdmin) return true;
        return perms.some((perm) => permissions.has(perm));
      },

      clearAuth: () => {
        set({
          user: null,
          permissions: new Set(),
          currentSite: null,
          currentSiteId: null, // 注销时通常建议连站点 ID 也清理
          isSuperAdmin: false,
        });
      },

      switchSite: (siteId) => {
        set({ currentSiteId: siteId });
        // 站点 ID 变化后，需要重新从后端获取该站点的权限
        // 最简单的办法是刷新页面，让根组件的 useMe 重新带着新 SiteId 发起请求
        window.location.reload();
      },
    }),
    {
      name: "auth-storage",
      // 【关键】只持久化 currentSiteId，不持久化用户信息和权限
      partialize: (state) => ({ currentSiteId: state.currentSiteId }),
    }
  )
);
