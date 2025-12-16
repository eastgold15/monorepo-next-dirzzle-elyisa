"use client";

import { createContext, type ReactNode, useContext, useEffect } from "react";
import { useMe } from "@/hooks/api/use-user-api";
import { useUserStore } from "@/stores/user-store";

// 创建用户上下文（为了向后兼容，主要逻辑已移到 Zustand store）
const UserContext = createContext<{
  refetch: () => void;
} | null>(null);

// 用户Provider组件
export function UserProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, error, refetch } = useMe();
  const { setUser, setLoading, setError } = useUserStore();

  // 使用 useEffect 来同步状态，避免在 render 期间调用 setState
  useEffect(() => {
    if (isLoading) {
      setLoading(true);
    } else if (error) {
      setError(error);
    } else {
      setUser(data);
      setLoading(false);
    }
  }, [data, isLoading, error, setUser, setLoading, setError]);

  return (
    <UserContext.Provider value={{ refetch }}>
      {children}
    </UserContext.Provider>
  );
}

// 使用用户上下文的Hook（向后兼容）
export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return {
    user: useUserStore(),
    refetch: context.refetch,
  };
}
