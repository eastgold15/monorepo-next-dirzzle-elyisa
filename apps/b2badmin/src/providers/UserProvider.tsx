"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, type ReactNode, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/hooks/api/use-user-api";

import { useAuthStore } from "@/stores/auth-store";

// 创建用户上下文（为了向后兼容，主要逻辑已移到 Zustand store）
const UserContext = createContext<{
  refetch: () => void;
} | null>(null);

// 用户Provider组件
export function UserProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublicPage = pathname === "/login" || pathname === "/signup";

  // 1. 发起请求
  const { data, error, isLoading } = useMe();

  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  // 2. 结构化副作用处理：监听 data 和 error
  useEffect(() => {
    if (data) {
      // 成功：一次性同步所有 Store
      setAuth(data);
    } else if (error) {
      // 失败：清理并重定向
      clearAuth();
      if (!isPublicPage) {
        router.push("/login");
      }
    }
  }, [data, error, isPublicPage, setAuth, clearAuth, router]);

  // 3. 渲染控制
  if (isPublicPage) return <>{children}</>;
  if (isLoading) return <Skeleton className="h-screen w-full" />;
  if (!data) return null;

  return <>{children}</>;
}
