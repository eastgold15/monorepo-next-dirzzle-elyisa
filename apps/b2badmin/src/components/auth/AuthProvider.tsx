"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useIsUserLoading, useUserInfo } from "@/stores/user-store";

interface AuthProviderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthProvider({ children, fallback }: AuthProviderProps) {
  const userInfo = useUserInfo();
  const isLoading = useIsUserLoading();
  const router = useRouter();

  useEffect(() => {
    // 如果加载完成且用户未登录，重定向到登录页
    if (!(isLoading || userInfo)) {
      router.push("/login");
    }
  }, [userInfo, isLoading, router]);

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return fallback || <div>Loading...</div>;
  }

  // 如果用户未登录，不渲染内容（等待重定向）
  if (!userInfo) {
    return fallback || null;
  }

  // 用户已登录，渲染子组件
  return <>{children}</>;
}
