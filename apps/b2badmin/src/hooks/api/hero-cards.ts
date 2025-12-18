import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";

// 首页展示卡片相关 hooks
export function useHeroCardsList(params?: {
  page?: number;
  limit?: number;
  title?: string;
  isActive?: boolean;
  sortOrder?: "asc" | "desc";
  sort?: string;
}) {
  return useQuery({
    queryKey: ["hero-cards", "list", params],
    queryFn: async () => {
      const res = await handleEden(
        rpc.api["hero-cards"].get({
          query: {
            page: 1,
            limit: 10,
            ...params,
          },
        })
      );

      return res;
    },
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

export function useHeroCardsCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      buttonText: string;
      buttonUrl?: string;
      mediaId: string[];
      backgroundClass?: string;
      isActive?: boolean;
      sortOrder?: number;
    }) => {
      return await handleEden(rpc.api["hero-cards"].post(data));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-cards"] });
    },
  });
}

export function useHeroCardsUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: {
      id: string;
      data: {
        title?: string;
        description?: string;
        buttonText?: string;
        buttonUrl?: string;
        mediaId?: string[];
        backgroundClass?: string;
        isActive?: boolean;
        sortOrder?: number;
      };
    }) => {
      return await handleEden(rpc.api["hero-cards"]({ id }).put(data));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-cards"] });
    },
  });
}

export function useHeroCardsDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await handleEden(rpc.api["hero-cards"]({ id }).delete());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-cards"] });
    },
  });
}

export function useHeroCardsBatchDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      return await handleEden(
        rpc.api["hero-cards"].delete({
          body: { ids },
        })
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-cards"] });
    },
  });
}

export function useActiveHeroCards() {
  return useQuery({
    queryKey: ["hero-cards", "active"],
    queryFn: async () => {
      // 获取激活的首页展示卡片
      return await handleEden(
        rpc.api["hero-cards"].get({
          query: {
            page: 1,
            limit: 100,
            isActive: true,
          },
        })
      );
    },
    staleTime: 2 * 60 * 1000, // 2分钟
  });
}
