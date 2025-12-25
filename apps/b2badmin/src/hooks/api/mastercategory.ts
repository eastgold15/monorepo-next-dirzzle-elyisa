"use client";

import type { MasterContract, MasterDTO, } from "@repo/contract";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";

// 获取主分类树
export function useMasterCategoriesTree() {
  return useQuery({
    queryKey: ["master-categories", "tree"],
    queryFn: async () => {
      const data = await handleEden(rpc.api.v1.master.tree.get());
      // 确保返回数组，即使是空数组
      return (data || []) as MasterDTO["TreeEntity"][];
    },
    staleTime: 1000 * 60 * 5, // 5分钟缓存
  });
}

// 获取主分类列表（扁平化，用于下拉选择）
export function useMasterCategories(
  query: typeof MasterContract.ListQuery.static
) {
  return useQuery({
    queryKey: ["master-categories", "flat", query],
    queryFn: async () => {
      const categories = await handleEden(
        rpc.api.v1.master.get({
          query,
        })
      );
      return categories || [];
    },
    staleTime: 1000 * 60 * 5, // 5分钟缓存
  });
}

// 创建主分类
export function useCreateMasterCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: typeof MasterContract.Create.static) =>
      await handleEden(rpc.api.v1.master.post(data)),
    onSuccess: () => {
      // 刷新主分类树和列表
      queryClient.invalidateQueries({ queryKey: ["master-categories"] });
    },
  });
}

// 更新主分类
export function useUpdateMasterCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: typeof MasterContract.Update.static;
    }) => await handleEden(rpc.api.v1.master({ id }).put(data)),
    onSuccess: () => {
      // 刷新主分类树和列表
      queryClient.invalidateQueries({ queryKey: ["master-categories"] });
    },
  });
}

// 删除主分类
export function useDeleteMasterCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) =>
      await handleEden(rpc.api.v1.master({ id }).delete()),
    onSuccess: () => {
      // 刷新主分类树和列表
      queryClient.invalidateQueries({ queryKey: ["master-categories"] });
    },
  });
}

// 批量删除主分类
export function useBatchDeleteMasterCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids }: { ids: string[] }) =>
      await handleEden(rpc.api.v1.master.batch.delete({ ids })),
    onSuccess: () => {
      // 刷新主分类树和列表
      queryClient.invalidateQueries({ queryKey: ["master-categories"] });
    },
  });
}

// 获取主分类详情
export function useMasterCategory(id: string) {
  return useQuery({
    queryKey: ["master-category", id],
    queryFn: async () => await handleEden(rpc.api.v1.master({ id }).get()),
    enabled: !!id,
  });
}
