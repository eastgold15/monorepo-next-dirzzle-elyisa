import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { rpc } from "@/lib/rpc";

// 主要的 useUser hook（支持站点参数）
export function useMe(siteId?: string) {
  const router = useRouter();

  return useQuery({
    queryKey: ["user", "me"],
    queryFn: async () => {
      const response = await rpc.api.user.me.get();
      const { data, error } = response;

      if (error || !data) {
        router.push("/login");
        return null;
      }

      localStorage.setItem("SiteId", data.currentSite.id);
      return data;
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
    queryFn: async () => {
      const response = await rpc.api.user.management.get({
        query: params || {},
      });
      const { data, error } = response;

      if (error || !data) {
        // @ts-expect-error
        throw new Error(error?.message || "获取用户列表失败");
      }

      return data;
    },
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
    }) => {
      const response = await rpc.api.user.management.salesperson.post(body);
      const { data, error } = response;

      if (error || !data) {
        // @ts-expect-error
        throw new Error(error?.message || "创建业务员账号失败");
      }

      return data;
    },
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
    }) => {
      const response =
        await rpc.api.user.management["factory-admin"].post(body);
      const { data, error } = response;

      if (error || !data) {
        // @ts-expect-error
        throw new Error(error?.message || "创建工厂管理员账号失败");
      }

      return data;
    },
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
    }) => {
      const response = await rpc.api.user
        .management({ id: userId })
        .status.patch({
          isActive,
        });

      const { data, error } = response;

      if (error || !data) {
        // @ts-expect-error
        throw new Error(error?.message || "更新用户状态失败");
      }

      return data;
    },
    onSuccess: () => {
      toast.success("用户状态更新成功");
      queryClient.invalidateQueries({ queryKey: ["user-management"] });
    },
    onError: (error) => {
      toast.error(error.message || "更新用户状态失败");
    },
  });
}
