"use client";

import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  factories?: Array<{
    id: string;
    isPrimary: boolean;
    role?: string;
  }>;
  exporters?: Array<{
    id: string;
    isPrimary: boolean;
    role?: string;
  }>;
  primaryFactory?: {
    id: string;
    isPrimary: boolean;
    role?: string;
  };
  primaryExporter?: {
    id: string;
    isPrimary: boolean;
    role?: string;
  };
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export function useUser() {
  return useQuery<User>({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await fetch("/api/me", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("未登录");
        }
        throw new Error("获取用户信息失败");
      }

      const result: ApiResponse<User> = await response.json();
      return result.data;
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}