import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";

// 广告相关 hooks
export function useAdsList() {
  return useQuery({
    queryKey: ["ads", "list"],
    queryFn: async () => {
      const result = handleEden(await rpc.api.ads.get());
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

export function useAdsCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const result = handleEden(await rpc.api.ads.post({ data }));
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

export function useAdsUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const result = handleEden(await rpc.api.ads[id].put({ data }));
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

export function useAdsDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const result = handleEden(await rpc.api.ads.delete({ ids }));
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}