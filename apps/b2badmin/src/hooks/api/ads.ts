import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";

// 广告相关 hooks
export function useAdsList(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["ads", "list", params],
    queryFn: async () => {
      return await handleEden(
        rpc.api.advertisements.get({
          query: params || {}
        })
      );
    },
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

export function useAdsCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      return await handleEden(rpc.api.advertisements.post(data));
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
      return await handleEden(rpc.api.advertisements({ id }).put(data));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

export function useAdsDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await handleEden(rpc.api.advertisements({ id }).delete());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

export function useAdsBatchDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      return await handleEden(
        rpc.api.advertisements.batchDel.delete({
          ids
        })
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}