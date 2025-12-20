"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";

// 获取商品列表
export function useProductsList(query?: {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  status?: number;
}) {
  return useQuery({
    queryKey: ["products", "list", query],
    queryFn: async () => {
      const result = await rpc.api.product.get({ $query: query || {} });
      if (result.error) {
        throw new Error(result.error.message || "获取商品列表失败");
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

// 根据站点分类获取可用模板
export function useProductTemplatesBySiteCategory(siteCategoryId: string) {
  return useQuery({
    queryKey: ["product-templates", "site-category", siteCategoryId],
    queryFn: async () => {
      if (!siteCategoryId) return [];

      const response =
        await rpc.api.product["templates"]["by-site-category"][
          siteCategoryId
        ].get();
      if (response.error) {
        throw new Error(response.error.message || "获取模板列表失败");
      }
      return response.data || [];
    },
    enabled: !!siteCategoryId,
    staleTime: 10 * 60 * 1000, // 10分钟缓存
  });
}

export function useProductDetail(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const result = await rpc.api.product[id].get();
      if (result.error) {
        throw new Error(result.error.message || "获取商品详情失败");
      }
      return result.data;
    },
    enabled: !!id,
  });
}

export function useProductCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      // 商品基础信息
      name: string;
      spuCode: string;
      description?: string;
      status?: number;
      units?: string;

      // 站点分类（必选）
      siteCategoryId: string;

      // 模板（可选）
      templateId?: string;

      // 站点商品配置
      price?: number;
      siteName?: string;
      siteDescription?: string;
      seoTitle?: string;

      // 图片关联（简化为单个图片ID）
      imageId?: string;
    }) => {
      // 转换数据格式以匹配后端接口
      const requestData = {
        name: data.name,
        spuCode: data.spuCode,
        description: data.description,
        status: data.status,
        units: data.units,
        siteCategoryId: data.siteCategoryId,
        templateId: data.templateId,
        price: data.price,
        siteName: data.siteName,
        siteDescription: data.siteDescription,
        seoTitle: data.seoTitle,
        // 如果有图片ID，转换为数组格式
        imageIds: data.imageId ? [data.imageId] : undefined,
        mainImageId: data.imageId,
      };

      const response = await rpc.api.product.post(requestData);
      if (response.error) {
        throw new Error(response.error.message || "创建商品失败");
      }
      return response.data;
    },
    onSuccess: () => {
      // 刷新商品列表
      queryClient.invalidateQueries({ queryKey: ["products"] });
      // 刷新站点商品列表
      queryClient.invalidateQueries({ queryKey: ["site-products"] });
    },
  });
}

export function useProductUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const result = await rpc.api.product[id].put({ data });
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
      const result = await rpc.api.product.delete({ ids });
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
      const result = await rpc.api.sku.get({ $query: query });
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

export function useSkuCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const result = await rpc.api.sku.post({ data });
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
      const result = await rpc.api.sku[id].put({ data });
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
      const result = await rpc.api.sku.delete({ ids });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skus"] });
    },
  });
}
