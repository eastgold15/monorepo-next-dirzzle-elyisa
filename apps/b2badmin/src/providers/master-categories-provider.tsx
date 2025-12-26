"use client";

import { createContext, type ReactNode, useContext, useEffect } from "react";
import { useMasterCategoriesTree } from "@/hooks/api/master-categories";
import { useAuthStore } from "@/stores/auth-store";
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
export function MasterCategoriesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const user = useAuthStore((s) => s.user);

  // 只在用户已登录时才获取数据
  const {
    data: categories,
    isLoading,
    refetch,
  } = useMasterCategoriesTree({
    enabled: !!user, // 只有当 user 存在时才启用查询
  });
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
