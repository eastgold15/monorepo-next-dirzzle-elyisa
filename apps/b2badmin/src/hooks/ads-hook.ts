import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";

/**
 * 获取当前有效广告的 Hook
 * 最多返回 4 条广告数据
 */
export function useCurrentAdsQuery() {
  return useQuery({
    queryKey: queryKeys.ads.current(),
    queryFn: async () => {
      const result = handleEden(await rpc.api.ads.current.get());
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
