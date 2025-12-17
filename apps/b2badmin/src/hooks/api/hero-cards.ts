import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";

// 首页展示卡片相关 hooks
export function useHeroCardsList(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["hero-cards", "list", params],
    queryFn: async () => {
      const { data, error } = await rpc.api["hero-cards"].get({
        query: params || {},
      });
      if (error || !data) {
        // @ts-expect-error
        throw new Error(error.message || "获取首页展示卡片列表失败");
      }
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

export function useHeroCardsCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await rpc.api["hero-cards"].post({
        data,
      });
      if (error || !result) {
        // @ts-expect-error
        throw new Error(error.message || "创建首页展示卡片失败");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-cards"] });
    },
  });
}

export function useHeroCardsUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { data: result, error } = await rpc.api["hero-cards"][id].put({
        data,
      });
      if (error || !result) {
        // @ts-expect-error
        throw new Error(error.message || "更新首页展示卡片失败");
      }
      return result;
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
      const { data: result, error } = await rpc.api["hero-cards"][id].delete();
      if (error || !result) {
        // @ts-expect-error
        throw new Error(error.message || "删除首页展示卡片失败");
      }
      return result;
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
      const { data: result, error } = await rpc.api["hero-cards"].batch.delete({
        data: { ids },
      });
      if (error || !result) {
        // @ts-expect-error
        throw new Error(error.message || "批量删除首页展示卡片失败");
      }
      return result;
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
      const { data, error } = await rpc.api["hero-cards"].active.get();
      if (error || !data) {
        // @ts-expect-error
        throw new Error(error.message || "获取启用的首页展示卡片失败");
      }
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2分钟
  });
}
