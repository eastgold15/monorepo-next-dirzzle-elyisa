"use client";
import { useQuery } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";

export interface ProductListRes {
  items: Item[];
  meta: Meta;
}
interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
interface Item {
  id: string;
  name: string;
  price: string;
  status: number;
  createdAt: string;
  mainImageUrl: string;
  hasVideo: boolean;
}
/**
 * 获取商品列表
 */
/**
 * 获取商品列表
 */
export function useProductListQuery(
  params: {
    page?: number;
    limit?: number;
    categoryId?: string;
    name?: string;
  } = {}, // 给个默认空对象
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      // 过滤掉 undefined 的参数
      const cleanParams = Object.fromEntries(
        Object.entries({
          page: 1, // 默认值
          limit: 10,
          ...params,
        }).filter(([_, v]) => v !== undefined)
      );

      const response = await rpc.api.v1.products.get({
        $query: cleanParams as any,
      });

      return handleEden(response) as ProductListRes;
    },
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000,
  });
}

export interface ProductDetailRes {
  id: string;
  createdAt: string;
  updatedAt: string;
  spuCode: string;
  name: string;
  description: string;
  status: number;
  units: string;
  exporterId?: any;
  factoryId?: any;
  ownerId?: any;
  isPublic: boolean;
  siteId: string;
  productMedia: ProductMedia[];
  siteCategory: any[];
  skus: Skus[];
}
interface Skus {
  id: string;
  createdAt: string;
  updatedAt: string;
  skuCode: string;
  price: string;
  marketPrice?: any;
  costPrice?: any;
  weight: string;
  volume: string;
  stock: string;
  specJson: Record<string, string>;
  extraAttributes?: any;
  status: number;
  productId: string;
  exporterId?: any;
  factoryId?: any;
  ownerId?: any;
  isPublic: boolean;
  siteId?: any;
  media: Media[];
}

interface ProductMedia {
  productId: string;
  mediaId: string;
  isMain: boolean;
  sortOrder: number;
  media: Media;
}
interface Media {
  id: string;
  createdAt: string;
  updatedAt: string;
  storageKey: string;
  category: string;
  url: string;
  originalName: string;
  mimeType: string;
  status: boolean;
  thumbnailUrl?: any;
  mediaType: string;
  exporterId: string;
  factoryId?: any;
  ownerId?: any;
  isPublic: boolean;
  siteId: string;
}

/**
 * 获取单个商品详情
 */
export function useProductQuery(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) throw new Error("Product ID is required");
      const result = handleEden(await rpc.api.v1.products[id].get());
      return result as unknown as ProductDetailRes;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    retry: 2,
  });
}
// // 👇 新增：导出 product 数据的类型（自动推导！）
// type ComProduct = Awaited<ReturnType<typeof useProductQuery>>["data"];
// export type BackendProduct = ComProduct;
