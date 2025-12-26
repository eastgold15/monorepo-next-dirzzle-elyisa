import type { SiteConfigContract } from "@repo/contract";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";

// 站点配置相关 hooks
export function useSiteConfigList(
  query: typeof SiteConfigContract.ListQuery.static = { page: 1, limit: 10 }
) {
  return useQuery({
    queryKey: ["site-config", "list", query],
    queryFn: async () =>
      await handleEden(
        rpc.api.v1.siteconfig.list.get({
          query,
        })
      ),
    staleTime: 10 * 60 * 1000, // 10分钟
  });
}

export function useSiteConfigDetail(id: string) {
  return useQuery({
    queryKey: ["site-config", id],
    queryFn: async () => await handleEden(rpc.api.v1.siteconfig({ id }).get()),
    enabled: !!id,
  });
}

export function useSiteConfigUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: typeof SiteConfigContract.Update.static;
    }) => await handleEden(rpc.api.v1.siteconfig({ id }).put(data)),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["site-config", id] });
    },
  });
}
