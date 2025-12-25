"use client";

import { createContext, type ReactNode, useContext, useEffect } from "react";
import { useMasterCategoriesTree } from "@/hooks/api";
import { useMasterCategoryStore } from "@/stores/master-categories-store";

// Context 类型定义
interface MasterCategoryContextType {
  // 这里可以添加一些共用的方法
  refresh: () => void;
}

// 创建 Context
const MasterCategoryContext = createContext<
  MasterCategoryContextType | undefined
>(undefined);

// Provider 组件
export function MasterCategoriesProvider({ children }: { children: ReactNode }) {
  const { data: categories, isLoading, refetch } = useMasterCategoriesTree();
  const { setTreeData, setLoading } = useMasterCategoryStore();

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
    <MasterCategoryContext.Provider value={{ refresh }}>
      {children}
    </MasterCategoryContext.Provider>
  );
}

// Hook to use the context
export function useMasterCategoriesContext() {
  const context = useContext(MasterCategoryContext);
  if (context === undefined) {
    throw new Error(
      "useMasterCategoriesContext must be used within a MasterCategoriesProvider"
    );
  }
  return context;
}

// 向后兼容的导出
export { MasterCategoriesProvider as MasterCategoryProvider };
export { useMasterCategoriesContext as useMasterCategoryContext };
