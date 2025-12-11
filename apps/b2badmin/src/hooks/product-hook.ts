"use client";
import { useQuery } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";
import type { CommonRes } from "@/server/utils/Res";

type ExtractDataType<T> = T extends CommonRes<infer D> ? D : never;
/**
 * 获取商品列表
 */
export function useProductListQuery(
  params?: {
    page?: number;
    limit?: number;
    categoryId?: number;
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
      const response = await rpc.api.product.get({
        $query: queryParams,
      });
      return response.data;
    },
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
type ComProductList = Awaited<ReturnType<typeof useProductListQuery>>["data"];
export type BackendProductList = ExtractDataType<ComProductList>;

/**
 * 获取单个商品详情
 */
export function useProductQuery(id: number) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const result = handleEden(await rpc.api.product[id].get());
      return result;
    },
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    retry: 2,
  });
}
// 👇 新增：导出 product 数据的类型（自动推导！）
type ComProduct = Awaited<ReturnType<typeof useProductQuery>>["data"];
export type BackendProduct = ExtractDataType<ComProduct>;
