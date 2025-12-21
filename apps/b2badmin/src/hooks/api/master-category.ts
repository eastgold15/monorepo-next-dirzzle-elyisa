"use client";

import type { MasterCategoryTModel } from "@repo/contract";
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
      return (data || []) as MasterCategoryTModel["TreeEntity"][];
    },
    staleTime: 1000 * 60 * 5, // 5分钟缓存
  });
}

// 获取主分类列表（扁平化，用于下拉选择）
export function useMasterCategories(parentId?: string) {
  return useQuery({
    queryKey: ["master-categories", "flat", parentId],
    queryFn: async () => {
      const categories = await handleEden(
        rpc.api.v1.master.get({
          query: { parentId, page: 1, limit: 1000 }, // 获取所有数据用于下拉选择
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
    mutationFn: async (data: MasterCategoryTModel["Create"]) =>
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
      data: MasterCategoryTModel["Update"];
    }) => await handleEden(rpc.api.v1.master({ id }).patch(data)),
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
      await handleEden(rpc.api.v1.master.delete({ ids: [id] })),
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
      await handleEden(rpc.api.v1.master.delete({ ids })),
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

// 获取分类的完整路径（如：一级分类 > 二级分类 > 三级分类）
export function getMasterCategoryPath(
  category: MasterCategoryTModel["TreeEntity"],
  allCategories: MasterCategoryTModel["TreeEntity"][]
): string {
  const path: string[] = [];
  let currentCategory: MasterCategoryTModel["TreeEntity"] | undefined =
    category;

  while (currentCategory) {
    path.unshift(currentCategory.name);
    if (currentCategory.parentId) {
      currentCategory = findMasterCategoryById(
        currentCategory.parentId,
        allCategories
      );
    } else {
      break;
    }
  }

  return path.join(" > ");
}

// 根据ID查找主分类
function findMasterCategoryById(
  id: string,
  categories: MasterCategoryTModel["TreeEntity"][]
): MasterCategoryTModel["TreeEntity"] | undefined {
  for (const category of categories) {
    if (category.id === id) {
      return category;
    }
    if (category.children) {
      const found = findMasterCategoryById(id, category.children);
      if (found) {
        return found;
      }
    }
  }
  return;
}

// 检查主分类是否有子分类
export function hasMasterCategoryChildren(
  category: MasterCategoryTModel["TreeEntity"]
): boolean {
  return !!(category.children && category.children.length > 0);
}

// 检查是否可以删除主分类（没有子分类）
export function canDeleteMasterCategory(
  category: MasterCategoryTModel["TreeEntity"],
  allCategories: MasterCategoryTModel["TreeEntity"][]
): boolean {
  // 检查是否有子分类
  if (hasMasterCategoryChildren(category)) {
    return false;
  }

  // 这里还可以添加其他业务规则，比如检查是否有关联的站点分类、模板等
  return true;
}
