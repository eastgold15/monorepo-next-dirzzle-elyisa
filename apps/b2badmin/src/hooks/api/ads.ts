import type { AdsContract } from "@repo/contract";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";

// 广告相关 hooks
export function useAdsList(params?: AdsContract.ListQuery) {
  return useQuery({
    queryKey: ["ads", "list", params],
    queryFn: async () => {
      const res = await handleEden(
        rpc.api.v1.ads.get({
          query: {
            page: 1,
            limit: 10,
            ...params,
          },
        })
      );
      // 返回数据列表
      return res?.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

export function useAdsCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<typeof AdsContract.Create, "siteId">) =>
      await handleEden(rpc.api.v1.ads.post(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

export function useAdsUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        title?: string;
        description?: string;
        type?: string;
        link?: string;
        position?: string;
        startDate?: string;
        endDate?: string;
        sortOrder?: number;
        isActive?: boolean;
        mediaId?: string;
      };
    }) => await handleEden(rpc.api.v1.ads({ id }).patch(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

export function useAdsDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) =>
      await handleEden(rpc.api.v1.ads({ id }).delete()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

export function useAdsBatchDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) =>
      await handleEden(
        rpc.api.v1.ads.batch.delete({
          ids,
        })
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

// 批量更新排序
export function useAdsUpdateSort() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: Array<{ id: string; sortOrder: number }>) =>
      await handleEden(rpc.api.v1.ads.sort.patch({ items })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

// 切换激活状态
export function useAdsToggleStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) =>
      await handleEden(rpc.api.v1.ads({ id }).toggle.patch()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}
