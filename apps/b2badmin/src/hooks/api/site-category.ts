"use client";

import type { SiteCategoryTModel } from "@repo/contract";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";

// 获取当前站点的分类树
export function useSiteCategoriesTree() {
  return useQuery({
    queryKey: ["site-categories", "tree"],
    queryFn: async () => {
      const response = await rpc.api.site.category.get();
      // 直接返回 response，因为我们的API返回的是数据本身而不是包装对象
      if (response.error) {
        // @ts-expect-error
        throw new Error(response.error.message || "获取站点分类失败");
      }
      // 确保返回数组，即使是空数组
      return (response.data || []) as SiteCategoryTModel["Entity"][];
    },
    staleTime: 1000 * 60 * 5, // 5分钟缓存
  });
}

// 获取当前站点的扁平化分类列表（用于下拉选择）
export function useSiteCategories() {
  return useQuery({
    queryKey: ["site-categories", "flat"],
    queryFn: async () => {
      const response = await rpc.api.site.category.get();
      if (response.error) {
        // @ts-expect-error
        throw new Error(response.error.message || "获取站点分类失败");
      }
      const categories = response.data || [];
      return categories;
    },
    staleTime: 1000 * 60 * 5, // 5分钟缓存
  });
}

// 创建站点分类
export function useCreateSiteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SiteCategoryTModel["Create"]) => {
      const response = await rpc.api.site.category.post(data);
      if (response.error) {
        // @ts-expect-error
        throw new Error(response.error.message || "创建分类失败");
      }
      return response.data;
    },
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
      data: SiteCategoryTModel["Update"];
    }) => {
      const response = await rpc.api.site.category.update({ id }).put(data);
      if (response.error) {
        // @ts-expect-error
        throw new Error(response.error.message || "更新分类失败");
      }
      return response.data;
    },
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
    mutationFn: async (id: string) => {
      const response = await rpc.api.site.category.delete({ id }).delete();
      if (response.error) {
        // @ts-expect-error
        throw new Error(response.error.message || "删除分类失败");
      }
      return response.data;
    },
    onSuccess: () => {
      // 刷新分类树
      queryClient.invalidateQueries({ queryKey: ["site-categories"] });
    },
  });
}

// 获取分类的完整路径（如：一级分类 > 二级分类 > 三级分类）
export function getCategoryPath(
  category: SiteCategoryTModel["TreeEntity"],
  allCategories: SiteCategoryTModel["TreeEntity"][]
): string {
  const path: string[] = [];
  let currentCategory: SiteCategoryTModel["TreeEntity"] | undefined = category;

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
  categories: SiteCategoryTModel["TreeEntity"][]
): SiteCategoryTModel["TreeEntity"] | undefined {
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
  category: SiteCategoryTModel["TreeEntity"]
): boolean {
  return !!(category.children && category.children.length > 0);
}

// 检查是否可以删除分类（没有子分类）
export function canDeleteCategory(
  category: SiteCategoryTModel["TreeEntity"],
  allCategories: SiteCategoryTModel["TreeEntity"][]
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
      const deletePromises = ids.map(async (id) => {
        const response = await rpc.api.site.category.delete({ id }).delete();
        if (response.error) {
          // @ts-expect-error
          throw new Error(response.error.message || `删除分类 ${id} 失败`);
        }
        return response.data;
      });

      await Promise.all(deletePromises);
      return ids; // 返回删除的ID列表
    },
    onSuccess: () => {
      // 刷新分类树
      queryClient.invalidateQueries({ queryKey: ["site-categories"] });
    },
  });
}
