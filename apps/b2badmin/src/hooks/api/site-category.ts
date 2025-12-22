"use client";

import type { SiteCategoriesContractDTO as SiteCategoriesContractDto } from "@repo/contract";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";
import type { MyInferQuery } from "./utils";

export interface SiteCategoryTree {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  parentId?: string;
  sortOrder: number;
  siteId: string;
  masterCategoryId?: string;
  children: SiteCategoryTree[];
}

// 获取当前站点的分类树
export function useSiteCategoriesTree() {
  return useQuery({
    queryKey: ["site-categories", "tree"],
    queryFn: async () => {
      const data = await handleEden(rpc.api.v1.sitecategories.tree.get());
      // 确保返回数组，即使是空数组
      return (data || []) as SiteCategoryTree[];
    },
    staleTime: 1000 * 60 * 5, // 5分钟缓存
  });
}

// 获取当前站点的扁平化分类列表（用于下拉选择）
export function useSiteCategories(
  query: MyInferQuery<typeof rpc.api.v1.sitecategories.tree.get>
) {
  return useQuery({
    queryKey: ["site-categories", "flat"],
    queryFn: async () => {
      const categories = await handleEden(
        rpc.api.v1.sitecategories.get({
          query,
        })
      );
      return categories?.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5分钟缓存
  });
}

// 创建站点分类
export function useCreateSiteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      parentId?: string;
      sortOrder?: number;
      isActive?: boolean;
    }) => await handleEden(rpc.api.v1.sitecategories.post(data)),
    onSuccess: () => {
      // 刷新分类树
      queryClient.invalidateQueries({ queryKey: ["site-categories"] });
    },
  });
}

// 更新站点分类
export function useUpdateSiteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        name?: string;
        description?: string;
        parentId?: string;
        sortOrder?: number;
        isActive?: boolean;
      };
    }) => await handleEden(rpc.api.v1.sitecategories({ id }).patch(data)),
    onSuccess: () => {
      // 刷新分类树
      queryClient.invalidateQueries({ queryKey: ["site-categories"] });
    },
  });
}

// 删除站点分类
export function useDeleteSiteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) =>
      await handleEden(rpc.api.v1.sitecategories({ id }).delete()),
    onSuccess: () => {
      // 刷新分类树
      queryClient.invalidateQueries({ queryKey: ["site-categories"] });
    },
  });
}

// 移动分类
export function useMoveCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      newParentId,
    }: {
      id: string;
      newParentId?: string;
    }) =>
      await handleEden(
        rpc.api.v1.sitecategories({ id }).move.patch({ newParentId })
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-categories"] });
    },
  });
}

// 批量更新排序
export function useUpdateCategoriesSort() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: Array<{ id: string; sortOrder: number }>) =>
      await handleEden(rpc.api.v1.sitecategories.sort.patch({ items })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-categories"] });
    },
  });
}

// 切换激活状态
export function useToggleCategoryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) =>
      await handleEden(rpc.api.v1.sitecategories({ id }).toggle.patch()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-categories"] });
    },
  });
}

// 获取分类的完整路径（如：一级分类 > 二级分类 > 三级分类）
export function getCategoryPath(
  category: SiteCategoriesContractDto["TreeResponse"],
  allCategories: SiteCategoriesContractDto["TreeResponse"][]
): string {
  const path: string[] = [];
  let currentCategory: SiteCategoriesContractDto["TreeResponse"] | undefined =
    category;

  while (currentCategory) {
    path.unshift(currentCategory.name);
    if (currentCategory.parentId) {
      currentCategory = findCategoryById(
        currentCategory.parentId,
        allCategories
      );
    } else {
      break;
    }
  }

  return path.join(" > ");
}

// 根据ID查找分类
function findCategoryById(
  id: string,
  categories: SiteCategoriesContractDto["TreeResponse"][]
): SiteCategoriesContractDto["TreeResponse"] | undefined {
  for (const category of categories) {
    if (category.id === id) {
      return category;
    }
    if (category.children) {
      const found = findCategoryById(id, category.children);
      if (found) {
        return found;
      }
    }
  }
  return;
}

// 检查分类是否有子分类
export function hasChildren(
  category: SiteCategoriesContractDto["TreeResponse"]
): boolean {
  return !!(category.children && category.children.length > 0);
}

// 检查是否可以删除分类（没有子分类）
export function canDeleteCategory(
  category: SiteCategoriesContractDto["TreeResponse"],
  allCategories: SiteCategoriesContractDto["TreeResponse"][]
): boolean {
  // 检查是否有子分类
  if (hasChildren(category)) {
    return false;
  }

  // 这里还可以添加其他业务规则，比如检查是否有关联的商品等
  return true;
}

// 批量删除站点分类
export function useBatchDeleteSiteCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids }: { ids: string[] }) => {
      // 由于 Elysia 的限制，我们需要逐个删除
      // 在实际应用中，可能需要创建一个批量删除的接口
      const deletePromises = ids.map(
        async (id) =>
          await handleEden(rpc.api.v1.sitecategories({ id }).delete())
      );

      await Promise.all(deletePromises);
      return ids; // 返回删除的ID列表
    },
    onSuccess: () => {
      // 刷新分类树
      queryClient.invalidateQueries({ queryKey: ["site-categories"] });
    },
  });
}
