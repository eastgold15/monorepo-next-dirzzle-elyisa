"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "@/hooks/api/user";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { data, isLoading } = useUser();
  const user = data?.userInfo;
  const router = useRouter();

  useEffect(() => {
    // 如果加载完成且用户未登录，重定向到登录页
    if (!(isLoading || user)) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return fallback || <div>Loading...</div>;
  }

  // 如果用户未登录，不渲染内容（等待重定向）
  if (!user) {
    return fallback || null;
  }

  // 用户已登录，渲染子组件
  return <>{children}</>;
}
