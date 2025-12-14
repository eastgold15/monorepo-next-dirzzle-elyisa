import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";

// 站点配置相关 hooks
export function useSiteConfigList() {
  return useQuery({
    queryKey: ["site-config", "list"],
    queryFn: async () => {
      const result = handleEden(await rpc.api.siteConfig.get());
      return result;
    },
    staleTime: 10 * 60 * 1000, // 10分钟
  });
}

export function useSiteConfigDetail(key: string) {
  return useQuery({
    queryKey: ["site-config", key],
    queryFn: async () => {
      const result = handleEden(await rpc.api.siteConfig[key].get());
      return result;
    },
    enabled: !!key,
  });
}

export function useSiteConfigUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, data }: { key: string; data: any }) => {
      const result = handleEden(await rpc.api.siteConfig[key].put({ data }));
      return result;
    },
    onSuccess: (_, { key }) => {
      queryClient.invalidateQueries({ queryKey: ["site-config"] });
      queryClient.invalidateQueries({ queryKey: ["site-config", key] });
    },
  });
}