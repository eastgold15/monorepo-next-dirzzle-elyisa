import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";

export function useCurrentMediaQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.media.url(id),
    queryFn: async () => {
      // Eden Treaty 路由参数语法：使用点号访问动态路由段
      const result = handleEden(await rpc.api.v1.media.url[id].get());
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: !!id, // 仅在 id 存在时执行查询
  });
}
export function useCurrentMediasQuery(ids: number[]) {
  return useQuery({
    queryKey: queryKeys.media.urls(ids),
    queryFn: async () => {
      // Eden Treaty 路由参数语法：使用点号访问动态路由段
      const result = handleEden(
        await rpc.api.v1.media.urls.get({
          $query: { ids },
        })
      );
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: false,
  });
}
