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
      return res?.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

export function useHeroCardsCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      subtitle?: string;
      buttonText?: string;
      buttonUrl?: string;
      buttonLabel?: string;
      mediaId?: string;
      backgroundClass?: string;
      isActive?: boolean;
      sortOrder?: number;
    }) => await handleEden(rpc.api.v1.herocards.post(data)),
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
      data: {
        title?: string;
        description?: string;
        subtitle?: string;
        buttonText?: string;
        buttonUrl?: string;
        buttonLabel?: string;
        mediaId?: string;
        backgroundClass?: string;
        isActive?: boolean;
        sortOrder?: number;
      };
    }) => await handleEden(rpc.api.v1.herocards({ id }).patch(data)),
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

export function useHeroCardsBatchDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) =>
      await handleEden(
        rpc.api.v1.herocards.delete({
          body: { ids },
        })
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-cards"] });
    },
  });
}

// 批量更新排序
export function useHeroCardsUpdateSort() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: Array<{ id: string; sortOrder: number }>) =>
      await handleEden(rpc.api.v1.herocards["sort"].patch({ items })),
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
      await handleEden(rpc.api.v1.herocards({ id })["toggle"].patch()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-cards"] });
    },
  });
}

// 获取激活的首页展示卡片（前端展示用）
export function useActiveHeroCards() {
  return useQuery({
    queryKey: ["hero-cards", "active"],
    queryFn: async () => {
      // 获取激活的首页展示卡片
      return await handleEden(rpc.api.v1.herocards["current"].get());
    },
    staleTime: 2 * 60 * 1000, // 2分钟
  });
}
