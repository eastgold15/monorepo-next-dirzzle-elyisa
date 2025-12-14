import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";

// Hero Cards 相关 hooks
export function useHeroCardsList() {
  return useQuery({
    queryKey: ["hero-cards", "list"],
    queryFn: async () => {
      const result = handleEden(await rpc.api.heroCards.get());
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

export function useHeroCardDetail(id: string) {
  return useQuery({
    queryKey: ["hero-card", id],
    queryFn: async () => {
      const result = handleEden(await rpc.api.heroCards[id].get());
      return result;
    },
    enabled: !!id,
  });
}

export function useHeroCardCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const result = handleEden(await rpc.api.heroCards.post({ data }));
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-cards"] });
    },
  });
}

export function useHeroCardUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const result = handleEden(await rpc.api.heroCards[id].put({ data }));
      return result;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["hero-cards"] });
      queryClient.invalidateQueries({ queryKey: ["hero-card", id] });
    },
  });
}

export function useHeroCardDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const result = handleEden(await rpc.api.heroCards.delete({ ids }));
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-cards"] });
    },
  });
}