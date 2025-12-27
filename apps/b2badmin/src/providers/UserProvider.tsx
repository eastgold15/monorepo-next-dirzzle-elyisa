"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/hooks/api/user";

import { useAuthStore } from "@/stores/auth-store";

// 用户Provider组件
export function UserProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublicPage = pathname === "/login" || pathname === "/signup";

  // 1. 发起请求（仅在非公共页面时才查询用户信息）
  const { data, error, isLoading } = useMe({
    enabled: !isPublicPage,
  });

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
  if (isLoading)
    return (
      <div className="h-screen w-full">
        <Skeleton className="h-full w-full" />
      </div>
    );
  if (!data) return null;

  return <>{children}</>;
}
