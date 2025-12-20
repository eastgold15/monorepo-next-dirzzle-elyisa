import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";

// 商品相关 hooks
export function useProductsList(params?: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
}) {
  return useQuery({
    queryKey: ["products", "list", params],
    queryFn: async () => {
      const res = await handleEden(
        rpc.api.v1.products.site.get({
          query: {
            page: 1,
            limit: 10,
            ...params,
          },
        })
      );
      // 返回数据列表
      return res?.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

export function useProductsCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      spuCode: string;
      description?: string;
      siteCategoryId: string;
      price?: number;
      siteName?: string;
      siteDescription?: string;
      imageIds?: string[];
      mainImageId?: string;
    }) => await handleEden(rpc.api.v1.products.post(data)),
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
      data: {
        name?: string;
        spuCode?: string;
        description?: string;
        siteCategoryId?: string;
        price?: number;
        siteName?: string;
        siteDescription?: string;
        imageIds?: string[];
        mainImageId?: string;
      };
    }) => await handleEden(rpc.api.v1.products({ id }).patch(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
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

// 获取商品模板
export function useProductsTemplates(search?: string) {
  return useQuery({
    queryKey: ["products", "templates", search],
    queryFn: async () => {
      const res = await handleEden(
        rpc.api.v1.products.templates.get({
          query: search ? { search } : {},
        })
      );
      return res || [];
    },
    staleTime: 10 * 60 * 1000, // 10分钟
  });
}

// 获取单个商品详情
export function useProductDetail(id: string) {
  return useQuery({
    queryKey: ["products", "detail", id],
    queryFn: async () => await handleEden(rpc.api.v1.products({ id }).get()),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
