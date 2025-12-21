"use client";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";
import type { Treaty } from "@elysiajs/eden";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
// 主要的 useUser hook（支持站点参数）
export function useMe(options?: { siteId?: string }) {
  return useQuery({
    queryKey: ["user", "me", options?.siteId],
    queryFn: async () => {
      return await handleEden(rpc.api.v1.users.me.get()); // 只返回数据
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export type UserMeRes = Treaty.Data<typeof rpc.api.v1.users.me.get>;

// 获取可管理的用户列表
export function useManageableUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: ["user-management", "users", params],
    queryFn: async () =>
      await handleEden(
        rpc.api.v1.users.get({
          query: params || {},
        })
      ),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// 更新用户状态
export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      isActive,
    }: {
      userId: string;
      isActive: boolean;
    }) =>
      await handleEden(
        rpc.api.v1.users({ id: userId }).patch({
          isActive,
        })
      ),
    onSuccess: () => {
      toast.success("用户状态更新成功");
      queryClient.invalidateQueries({ queryKey: ["user-management"] });
    },
    onError: (error) => {
      toast.error(error.message || "更新用户状态失败");
    },
  });
}
