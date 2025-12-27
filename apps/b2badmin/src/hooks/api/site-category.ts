"use client";

import type { SiteCategoriesContract, SiteCategoriesDTO } from "@repo/contract";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";
import type { MyInferQuery } from "./utils";

// 获取当前站点的分类树
export function useSiteCategoriesTree(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["site-categories", "tree"],
    queryFn: async () => {
      const data = await handleEden(rpc.api.v1.sitecategories.tree.get());
      // 确保返回数组，即使是空数组
      return (data || []) as SiteCategoriesDTO["TreeResponse"][];
    },
    staleTime: 1000 * 60 * 5, // 5分钟缓存
    enabled: options?.enabled ?? true, // 默认启用，可通过 options 控制
  });
}

// 获取当前站点的扁平化分类列表（用于下拉选择）
export function useSiteCategories(
  query?: MyInferQuery<typeof rpc.api.v1.sitecategories.tree.get>
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
    mutationFn: async (data: typeof SiteCategoriesContract.Create.static) =>
      await handleEden(rpc.api.v1.sitecategories.post(data)),
    onSuccess: () => {
      toast.success("站点分类创建成功");
      queryClient.invalidateQueries({ queryKey: ["site-categories"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "创建站点分类失败");
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
      data: typeof SiteCategoriesContract.Update.static;
    }) => await handleEden(rpc.api.v1.sitecategories({ id }).put(data)),
    onSuccess: () => {
      toast.success("站点分类更新成功");
      queryClient.invalidateQueries({ queryKey: ["site-categories"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "更新站点分类失败");
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
      toast.success("站点分类删除成功");
      queryClient.invalidateQueries({ queryKey: ["site-categories"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "删除站点分类失败");
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
      toast.success("分类移动成功");
      queryClient.invalidateQueries({ queryKey: ["site-categories"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "移动分类失败");
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
      toast.success("排序更新成功");
      queryClient.invalidateQueries({ queryKey: ["site-categories"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "更新排序失败");
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
      toast.success("状态更新成功");
      queryClient.invalidateQueries({ queryKey: ["site-categories"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "更新状态失败");
    },
  });
}

// 获取分类的完整路径（如：一级分类 > 二级分类 > 三级分类）
export function getCategoryPath(
  category: SiteCategoriesDTO["TreeResponse"],
  allCategories: SiteCategoriesDTO["TreeResponse"][]
): string {
  const path: string[] = [];
  let currentCategory: SiteCategoriesDTO["TreeResponse"] | undefined = category;

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
  categories: SiteCategoriesDTO["TreeResponse"][]
): SiteCategoriesDTO["TreeResponse"] | undefined {
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
  category: SiteCategoriesDTO["TreeResponse"]
): boolean {
  return !!(category.children && category.children.length > 0);
}

// 检查是否可以删除分类（没有子分类）
export function canDeleteCategory(
  category: SiteCategoriesDTO["TreeResponse"],
  allCategories: SiteCategoriesDTO["TreeResponse"][]
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
      toast.success("批量删除成功");
      // 刷新分类树
      queryClient.invalidateQueries({ queryKey: ["site-categories"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "批量删除失败");
    },
  });
}
