import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";

export function useCurrentMediaQuery(
  id: string,
  options?: Partial<UseQueryOptions<string, Error>>
) {
  return useQuery({
    queryKey: queryKeys.media.url(id),
    queryFn: async () => {
      // Eden Treaty 路由参数语法：使用点号访问动态路由段
      const result = handleEden(
        await rpc.api.v1.media.url[id].get()
      ) as unknown as string;
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    retry: 2,
    refetchOnWindowFocus: false,
    // 规范 7: 健壮的启用逻辑
    // 只有当 id 存在且外部没有手动禁用时才运行
    enabled: !!id && options?.enabled !== false,
    ...options, // 允许外部覆盖默认配置
  });
}

export function useCurrentMediasQuery(ids: string[]) {
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
    enabled: ids.length > 0,
  });
}
