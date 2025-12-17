import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";

// 广告相关 hooks
export function useAdsList(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["ads", "list", params],
    queryFn: async () => {
      const result = handleEden(await rpc.api.advertisements.get({
        query: params || {}
      }));
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

export function useAdsCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const result = handleEden(await rpc.api.advertisements.post({
        data
      }));
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
      const result = handleEden(await rpc.api.advertisements[id].put({
        data
      }));
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
      const result = handleEden(await rpc.api.advertisements.batchDel.delete({
        data: { ids }
      }));
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

export function useAdsDetail(id: string) {
  return useQuery({
    queryKey: ["ads", "detail", id],
    queryFn: async () => {
      const result = handleEden(await rpc.api.advertisements[id].get());
      return result;
    },
    enabled: !!id,
  });
}

export function useCurrentCarouselAds() {
  return useQuery({
    queryKey: ["ads", "carousel", "current"],
    queryFn: async () => {
      const result = handleEden(await rpc.api.advertisements["carousel/current"].get());
      return result;
    },
    staleTime: 2 * 60 * 1000, // 2分钟
  });
}