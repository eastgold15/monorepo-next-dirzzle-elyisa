import type { HeroCardsContract } from "@repo/contract";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";

// 首页展示卡片相关 hooks
export function useHeroCardsList(params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}) {
  return useQuery({
    queryKey: ["hero-cards", "list", params],
    queryFn: async () => {
      const res = await handleEden(
        rpc.api.v1.herocards.get({
          query: {
            page: 1,
            limit: 10,
            ...params,
          },
        })
      );
      // 返回数据列表
      return res.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

export function useHeroCardsCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: typeof HeroCardsContract.Create.static) =>
      await handleEden(rpc.api.v1.herocards.post(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-cards"] });
    },
  });
}

export function useHeroCardsUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: typeof HeroCardsContract.Update.static;
    }) => await handleEden(rpc.api.v1.herocards({ id }).put(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-cards"] });
    },
  });
}

export function useHeroCardsDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) =>
      await handleEden(rpc.api.v1.herocards({ id }).delete()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-cards"] });
    },
  });
}

// 批量删除首页展示卡片
// export function useHeroCardsBatchDelete() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (ids: string[]) =>
//       await handleEden(rpc.api.v1.herocards.batch.delete({ ids })),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["hero-cards"] });
//     },
//   });
// }

// 批量更新排序
export function useHeroCardsUpdateSort() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: Array<{ id: string; sortOrder: number }>) =>
      await handleEden(rpc.api.v1.herocards.sort.patch({ items })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-cards"] });
    },
  });
}

// 切换激活状态
export function useHeroCardsToggleStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) =>
      await handleEden(rpc.api.v1.herocards.toggle({ id }).patch()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-cards"] });
    },
  });
}
