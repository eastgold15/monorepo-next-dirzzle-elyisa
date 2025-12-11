"use client";
import { useQuery } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";
import type { CommonRes } from "@/server/utils/Res";

type ExtractDataType<T> = T extends CommonRes<infer D> ? D : never;
/**
 * 上传
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