"use client";

import { createContext, type ReactNode, useContext, useEffect } from "react";
import { useSiteCategoriesTree } from "@/hooks/api/site-category";
import { useSiteCategoryStore } from "@/stores/site-category-store";

// Context 类型定义
interface SiteCategoryContextType {
  // 这里可以添加一些共用的方法
  refresh: () => void;
}

// 创建 Context
const SiteCategoryContext = createContext<SiteCategoryContextType | undefined>(
  undefined
);

// Provider 组件
export function SiteCategoryProvider({ children }: { children: ReactNode }) {
  const { data: categories, isLoading, refetch } = useSiteCategoriesTree();
  const { setTreeData, setLoading } = useSiteCategoryStore();

  // 刷新数据的方法
  const refresh = () => {
    refetch();
  };

  // 当数据变化时更新 store
  useEffect(() => {
    setLoading(isLoading);
    if (categories) {
      setTreeData(categories);
    }
  }, [categories, isLoading, setTreeData, setLoading]);

  return (
    <SiteCategoryContext.Provider value={{ refresh }}>
      {children}
    </SiteCategoryContext.Provider>
  );
}

// Hook to use the context
export function useSiteCategoryContext() {
  const context = useContext(SiteCategoryContext);
  if (context === undefined) {
    throw new Error(
      "useSiteCategoryContext must be used within a SiteCategoryProvider"
    );
  }
  return context;
}
