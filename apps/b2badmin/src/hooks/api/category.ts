"use client";

import { useQuery } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";

// 分类接口类型
export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  parentId?: string;
  level: number;
  sort: number;
  createdAt: string;
  updatedAt: string;
  children?: Category[];
}

// 扁平化的分类选项
export interface CategoryOption {
  value: string;
  label: string;
  level: number;
}

// 本地存储键
const CATEGORIES_CACHE_KEY = "categories_cache";
const CATEGORIES_CACHE_TIMESTAMP = "categories_cache_timestamp";

// 从本地存储获取分类缓存
function getCategoriesFromCache(): Category[] | null {
  try {
    const cached = localStorage.getItem(CATEGORIES_CACHE_KEY);
    const timestamp = localStorage.getItem(CATEGORIES_CACHE_TIMESTAMP);

    if (cached && timestamp) {
      const cacheAge = Date.now() - Number.parseInt(timestamp, 10);
      // 缓存1小时有效
      if (cacheAge < 1000 * 60 * 60) {
        return JSON.parse(cached);
      }
    }
  } catch (error) {
    console.error("读取分类缓存失败:", error);
  }
  return null;
}

// 保存分类到本地存储
function saveCategoriesToCache(categories: Category[]): void {
  try {
    localStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(categories));
    localStorage.setItem(CATEGORIES_CACHE_TIMESTAMP, Date.now().toString());
  } catch (error) {
    console.error("保存分类缓存失败:", error);
  }
}

// 获取分类列表（用于下拉选择）- 简单版本
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await rpc.api.category.get({
        query: { limit: 1000 }, // 获取所有分类
      });
      if (res.error) {
        throw new Error(res.error.message);
      }
      return res.data?.items || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// 获取分类树的hook - 带缓存版本
export function useCategoriesTree() {
  return useQuery({
    queryKey: ["categories", "tree"],
    queryFn: async () => {
      // 先尝试从缓存获取
      const cachedCategories = getCategoriesFromCache();
      if (cachedCategories) {
        return cachedCategories;
      }

      // 缓存不存在或过期，从API获取
      const response = await rpc.api.categories.tree.get();
      const { data } = handleEden(response);

      if (!data) {
        throw new Error("获取分类列表失败");
      }

      // 保存到缓存
      saveCategoriesToCache(data as unknown as Category[]);
      return data as unknown as Category[];
    },
    staleTime: 1000 * 60 * 30, // 30分钟缓存
  });
}

// 获取分类详情
export function useCategory(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["category", id],
    queryFn: async () => {
      const result = handleEden(await rpc.api.category[id].get());
      return result;
    },
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000, // 5分钟
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// 将树形结构扁平化为选项列表
export function flattenCategories(categories: Category[]): CategoryOption[] {
  const result: CategoryOption[] = [];

  function traverse(items: Category[], level = 0) {
    for (const item of items) {
      // 分类名称是字符串格式
      const name = item.name || 'Unknown';
      const prefix = '　'.repeat(level); // 使用全角空格进行缩进

      result.push({
        value: item.id,
        label: `${prefix}${name}`,
        level,
      });

      if (item.children && item.children.length > 0) {
        traverse(item.children, level + 1);
      }
    }
  }

  traverse(categories);
  return result;
}