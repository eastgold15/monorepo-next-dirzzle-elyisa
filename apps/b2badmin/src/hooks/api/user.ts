"use client";
import type { Treaty } from "@elysiajs/eden";
import type { UsersContract } from "@repo/contract";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";
// 主要的 useUser hook（支持站点参数）
export function useMe(options?: { siteId?: string; enabled?: boolean }) {
  return useQuery({
    queryKey: ["user", "me", options?.siteId],
    queryFn: async () => {
      return await handleEden(rpc.api.v1.users.me.get()); // 只返回数据
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
    enabled: options?.enabled ?? true,
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
          query,
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

// 更新当前用户个人资料
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name?: string;
      phone?: string;
      address?: string;
      city?: string;
    }) =>
      await handleEden(
        rpc.api.v1.users.me.profile.put({
          name: data.name,
          phone: data.phone,
          address: data.address,
          city: data.city,
        })
      ),
    onSuccess: () => {
      toast.success("个人资料更新成功");
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
      queryClient.invalidateQueries({ queryKey: ["user", "settings"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "更新个人资料失败");
    },
  });
}

// 更新当前用户的站点和公司信息
export function useUpdateSiteInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      siteName?: string;
      domain?: string;
      companyName?: string;
      companyCode?: string;
      companyAddress?: string;
      website?: string;
      contactPhone?: string;
    }) => await handleEden(rpc.api.v1.users.me.site.put(data)),
    onSuccess: () => {
      toast.success("站点和公司信息更新成功");
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
      queryClient.invalidateQueries({ queryKey: ["user", "settings"] });
    },
    onError: (error) => {
      toast.error(error.message || "更新站点信息失败");
    },
  });
}

// 获取账号设置信息
export function useAccountSettings() {
  return useQuery({
    queryKey: ["user", "settings"],
    queryFn: async () => await handleEden(rpc.api.v1.users.me.settings.get()),
    staleTime: 1000 * 60 * 5,
  });
}
