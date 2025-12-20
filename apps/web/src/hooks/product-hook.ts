"use client";
import { useQuery } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";
/**
 * 获取商品列表
 */
export function useProductListQuery(
  params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    name?: string;
  },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      // 确保必需的参数有默认值
      const queryParams = {
        page: params?.page || 1,
        limit: params?.limit || 10,
        categoryId: params?.categoryId,
        name: params?.name,
      };
      Object.keys(queryParams).forEach((key) => {
        if (queryParams[key as keyof typeof queryParams] === undefined) {
          delete queryParams[key as keyof typeof queryParams];
        }
      });
      const result = await rpc.api.v1.products.get({
        $query: queryParams,
      });
      return handleEden(result);
    },
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * 获取单个商品详情
 */
export function useProductQuery(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) throw new Error("Product ID is required");
      const result = handleEden(await rpc.api.v1.products[id].);
      return result;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    retry: 2,
  });
}
// 👇 新增：导出 product 数据的类型（自动推导！）
type ComProduct = Awaited<ReturnType<typeof useProductQuery>>["data"];
export type BackendProduct = ComProduct
