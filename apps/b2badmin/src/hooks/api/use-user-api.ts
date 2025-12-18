'use client'
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";
import { useAuthStore } from "@/stores/auth-store";
import { useSiteStore } from "@/stores/site-store";
import { useUserStore } from "@/stores/user-store";

// 主要的 useUser hook（支持站点参数）
export function useMe(siteId?: string) {
  const router = useRouter();
  const setCurrentSiteId = useSiteStore((s) => s.setCurrentSiteId);
  const currentSiteId = useSiteStore((s) => s.currentSiteId);
  const { setUser, setPermissions } = useAuthStore();
  const { setUser: setUserInfo, setAccessibleSites } = useUserStore();

  return useQuery({
    queryKey: ["user", "me"],
    queryFn: async () => {
      try {
        const data = await handleEden(rpc.api.user.me.get());

        // 更新用户信息 - 使用扁平化的数据结构
        setUser(data.user);
        setPermissions(data.permissions || []);
        setUserInfo(data);

        // 更新可访问站点列表（如果有）
        if (data.allSites) {
          setAccessibleSites(data.allSites);
        }

        // 同步站点ID到本地存储
        if (!currentSiteId && data.currentSite?.id) {
          setCurrentSiteId(data.currentSite.id);
          localStorage.setItem("SiteId", data.currentSite.id);
        }

        return data;
      } catch (error) {
        // 清除认证信息
        setUser(null);
        setPermissions([]);
        setUserInfo(null);
        router.push("/login");
        throw error;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: true, // 始终启用，因为我们需要用户信息
  });
}

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
        rpc.api.user.management.get({
          query: params || {},
        })
      ),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// 创建业务员账号
export function useCreateSalesperson() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (body: {
      email: string;
      name: string;
      password: string;
      factoryId: string;
    }) => await handleEden(rpc.api.user.management.salesperson.post(body)),
    onSuccess: () => {
      toast.success("业务员账号创建成功");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "创建业务员账号失败");
    },
  });
}

// 创建工厂管理员账号
export function useCreateFactoryAdmin() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (body: {
      email: string;
      name: string;
      password: string;
      factoryId: string;
    }) => await handleEden(rpc.api.user.management["factory-admin"].post(body)),
    onSuccess: () => {
      toast.success("工厂管理员账号创建成功");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "创建工厂管理员账号失败");
    },
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
        rpc.api.user.management({ id: userId }).status.patch({
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
