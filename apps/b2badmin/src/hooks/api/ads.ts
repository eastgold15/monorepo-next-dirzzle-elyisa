import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";

// 广告相关 hooks
export function useAdsList(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["ads", "list", params],
    queryFn: async () => {
      const { data, error } = await rpc.api.advertisements.get({
        query: params || {}
      });
      if (error || !data) {
        // @ts-expect-error
        throw new Error(error.message || "获取广告列表失败");
      }
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

export function useAdsCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const result = await rpc.api.advertisements.post(data);
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
      const { data: res, error } = await rpc.api.advertisements({ id }).put(data);
      if (error || !data) {
        // @ts-expect-error
        throw new Error(error.message || "更新广告失败");
      }
      return res;
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
      const { data, error } = await rpc.api.advertisements({ id }).delete();
      if (error || !data) {
        // @ts-expect-error
        throw new Error(error.message || "删除广告失败");
      }
      return data;
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
      const { data, error } = await rpc.api.advertisements.batchDel.delete({
        ids
      });
      if (error || !data) {
        // @ts-expect-error
        throw new Error(error.message || "批量删除广告失败");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}