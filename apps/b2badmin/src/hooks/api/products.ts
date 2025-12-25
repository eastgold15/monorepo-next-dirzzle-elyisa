import type { ProductsDTO } from "@repo/contract";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";
// 获取商品列表
export function useProductsList(query: ProductsDTO["ListQuery"]) {
  return useQuery({
    queryKey: ["products", "list", query],
    queryFn: () => handleEden(rpc.api.v1.products.get({ query })),
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

export function useProductsCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductsDTO["Create"]) =>
      handleEden(rpc.api.v1.products.post(data)),
    onSuccess: () => {
      // 刷新商品列表
      queryClient.invalidateQueries({ queryKey: ["products"] });
      // 刷新站点商品列表
      queryClient.invalidateQueries({ queryKey: ["site-products"] });
    },
  });
}

export function useProductsDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) =>
      await handleEden(rpc.api.v1.products({ id }).delete()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useProductsBatchDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) =>
      await handleEden(
        rpc.api.v1.products.batch.delete({
          ids,
        })
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useProductsUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: ProductsDTO["Update"];
    }) => await handleEden(rpc.api.v1.products({ id }).put(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
