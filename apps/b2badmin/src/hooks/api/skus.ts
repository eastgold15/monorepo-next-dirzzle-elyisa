"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";
// SKU 相关 hooks
export function useSkusList(productId?: string) {
  return useQuery({
    queryKey: ["skus", "list", productId],
    queryFn: async () => {
      const query = productId ? { productId } : {};
      const result = await handleEden(rpc.api.v1.skus.get({ query }));
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

// 获取商品列表（用于SKU创建时选择）
export function useProductsForSKU() {
  return useQuery({
    queryKey: ["products", "for-sku"],
    queryFn: async () => {
      const result = await handleEden(
        rpc.api.v1.products.get({
          query: { page: 1, limit: 100 },
        })
      );
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

export function useCreateSKUBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { productId: string; skus: any[] }) => {
      const result = await rpc.api.v1.skus.batch.post(data);
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
      const result = await rpc.api.v1.skus.batch.delete({ body: { ids } });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skus"] });
    },
  });
}
