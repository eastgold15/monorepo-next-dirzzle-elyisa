"use client";

import { useQuery } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";

/**
 * 获取用户可访问的站点列表
 */
export function useAccessibleSites() {
  return useQuery({
    queryKey: ["sites", "accessible"],
    queryFn: async () => {
      const result = await handleEden(rpc.api.v1.sites.accessible.get());
      // 返回站点数组，处理超管和普通用户两种不同的数据结构
      if (!result?.sites) return [];

      return result.sites.map((s: any) => {
        // 超管数据结构: { currentSite: {...}, role: {...} }
        if (s.currentSite) {
          return s.currentSite;
        }
        // 普通用户数据结构: { site: {...}, role: {...} }
        if (s.site) {
          return s.site;
        }
        // 兜底返回
        return s;
      });
    },
    staleTime: 1000 * 60 * 5, // 5分钟缓存
  });
}

/**
 * 获取站点列表（管理员）
 */
export function useSitesList() {
  return useQuery({
    queryKey: ["sites", "list"],
    queryFn: async () => {
      const result = await handleEden(rpc.api.v1.sites.get());
      return result?.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}
