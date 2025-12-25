"use client";
import type { Treaty } from "@elysiajs/eden";
import type { UsersContract } from "@repo/contract";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";
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

export function useCreateUser() {
  return useMutation({
    mutationFn: async (data: Parameters<typeof rpc.api.v1.users.post>[0]) =>
      await handleEden(rpc.api.v1.users.post(data)),
    onSuccess: () => {
      toast.success("用户代表创建成功");
    },
    onError: (error) => {
      toast.error(error.message || "创建用户代表失败");
    },
  });
}

// 获取可管理的用户列表
export function useManageableUsers(
  query?: typeof UsersContract.ListQuery.static
) {
  return useQuery({
    queryKey: ["user-management", "users", query],
    queryFn: async () =>
      await handleEden(
        rpc.api.v1.users.get({
          query
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
        rpc.api.v1.users({ id: userId }).put({
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
