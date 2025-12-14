import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";

// 商品相关 hooks
export function useProductsList(query?: any) {
  return useQuery({
    queryKey: ["products", "list", query],
    queryFn: async () => {
      const result = handleEden(await rpc.api.product.get({ $query: query }));
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

export function useProductDetail(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const result = handleEden(await rpc.api.product[id].get());
      return result;
    },
    enabled: !!id,
  });
}

export function useProductCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const result = handleEden(await rpc.api.product.post({ data }));
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useProductUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const result = handleEden(await rpc.api.product[id].put({ data }));
      return result;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
    },
  });
}

export function useProductDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const result = handleEden(await rpc.api.product.delete({ ids }));
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// SKU 相关 hooks
export function useSkusList(productId?: string) {
  return useQuery({
    queryKey: ["skus", "list", productId],
    queryFn: async () => {
      const query = productId ? { productId } : {};
      const result = handleEden(await rpc.api.sku.get({ $query: query }));
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

export function useSkuCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const result = handleEden(await rpc.api.sku.post({ data }));
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
      const result = handleEden(await rpc.api.sku[id].put({ data }));
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
      const result = handleEden(await rpc.api.sku.delete({ ids }));
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skus"] });
    },
  });
}