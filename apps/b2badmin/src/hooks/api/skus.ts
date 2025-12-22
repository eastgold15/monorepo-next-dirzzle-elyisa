"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
// SKU 相关 hooks
export function useSkusList(productId?: string) {
  return useQuery({
    queryKey: ["skus", "list", productId],
    queryFn: async () => {
      const query = productId ? { productId } : {};
      const result = await rpc.api.v1.skus.get({ query });
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

export function useSkuCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const result = await rpc.api.v1.skus.post(data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skus"] });
    },
  });
}

export function useSkuUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const result = await rpc.api.v1.skus({ id }).patch(data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skus"] });
    },
  });
}

export function useSkuDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const result = await rpc.api.v1.skus.delete({ body: { ids } });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skus"] });
    },
  });
}
