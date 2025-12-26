import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";
export interface AdsRes {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  description: string;
  type: string;
  mediaId: string;
  link: string;
  position: string;
  sortOrder: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  siteId: string;
}
/**
 * 获取当前有效广告的 Hook
 * 最多返回 4 条广告数据
 */

export function useCurrentAdsQuery() {
  return useQuery({
    queryKey: queryKeys.ads.current(),
    queryFn: async () => {
      const res = await rpc.api.v1.ads.current.get();
      return handleEden(res);
    },
    // select: 数据清洗核心逻辑
    select: (data: any): AdsRes[] => {
      if (!Array.isArray(data)) return [];
      return (
        data
          // 1. 过滤未激活的
          .filter((ad: AdsRes) => ad.isActive !== false)
          // 2. 按 sortOrder 排序
          .sort(
            (a: AdsRes, b: AdsRes) => (a.sortOrder || 0) - (b.sortOrder || 0)
          )
      );
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
