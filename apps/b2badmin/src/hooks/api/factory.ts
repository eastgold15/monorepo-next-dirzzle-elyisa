import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";

// 工厂相关 hooks
export function useFactoriesList() {
  return useQuery({
    queryKey: ["factories", "list"],
    queryFn: async () => {
      const result = handleEden(await rpc.api.factory.get());
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

export function useFactoryDetail(id: string) {
  return useQuery({
    queryKey: ["factory", id],
    queryFn: async () => {
      const result = handleEden(await rpc.api.factory[id].get());
      return result;
    },
    enabled: !!id,
  });
}

export function useFactoryCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const result = handleEden(await rpc.api.factory.post({ data }));
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["factories"] });
    },
  });
}

export function useFactoryUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const result = handleEden(await rpc.api.factory[id].put({ data }));
      return result;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["factories"] });
      queryClient.invalidateQueries({ queryKey: ["factory", id] });
    },
  });
}

export function useFactoryDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const result = handleEden(await rpc.api.factory.delete({ ids }));
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["factories"] });
    },
  });
}