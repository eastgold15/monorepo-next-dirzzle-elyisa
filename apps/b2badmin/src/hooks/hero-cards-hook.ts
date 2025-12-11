import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";

/**
 * 获取当前有效 Hero Cards 的 Hook
 * 最多返回 4 条卡片数据
 */
export function useCurrentHeroCardsQuery() {
  return useQuery({
    queryKey: queryKeys.heroCards.current(),
    queryFn: async () => {
      const result = handleEden(await rpc.api["hero-cards"].current.get());
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
