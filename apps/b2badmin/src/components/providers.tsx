"use client"; // 🔴 必须在第一行

import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { MasterCategoriesProvider } from "@/providers/master-categories-provider";
import { SiteCategoryProvider } from "@/providers/site-category-provider";
import { UserProvider } from "@/providers/UserProvider";

// 这里的函数用于创建 QueryClient
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 在服务端渲染期间，通常将 staleTime 设置为大于 0
        // 以避免在初始渲染后立即在客户端重新获取数据
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (isServer) {
    // Server: 总是创建一个新的 QueryClient
    return makeQueryClient();
  }
  // Browser: 创建一个全新的 QueryClient (如果是首次)
  // 否则复用已有的 client，防止 React Suspense 导致的重新创建
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: ReactNode }) {
  // 🔴 关键修复：使用单例模式获取 client
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <MasterCategoriesProvider>
        <SiteCategoryProvider>
          <UserProvider>{children}</UserProvider>
        </SiteCategoryProvider>
      </MasterCategoriesProvider>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
