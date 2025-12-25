import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";

// 工厂相关 hooks
export function useFactoriesList() {
  return useQuery({
    queryKey: ["factories", "list"],
    queryFn: async () => await handleEden(rpc.api.v1.factories.list.get()),
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

export function useFactoryDetail(id: string) {
  return useQuery({
    queryKey: ["factory", id],
    queryFn: async () =>
      await handleEden(rpc.api.v1.factories.detail({ id }).get()),
    enabled: !!id,
  });
}

export function useFactoryCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) =>
      await handleEden(rpc.api.v1.factories.post(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["factories"] });
    },
  });
}

export function useFactoryUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) =>
      await handleEden(rpc.api.v1.factories({ id }).put(data)),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["factories"] });
      queryClient.invalidateQueries({ queryKey: ["factory", id] });
    },
  });
}

export function useFactoryDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) =>
      await handleEden(rpc.api.v1.factories({ id }).delete()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["factories"] });
    },
  });
}
