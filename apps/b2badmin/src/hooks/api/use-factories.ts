import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { rpc } from "@/lib/rpc";

// 获取工厂列表
export function useFactoriesQuery() {
  return useQuery({
    queryKey: ["factories"],
    queryFn: async () => {
      const response = await rpc.api.factory.list.get();
      const { data, error } = response;

      if (error || !data) {
        // @ts-expect-error
        throw new Error(error?.message || "获取工厂列表失败");
      }

      return data.factories;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// 创建工厂
export function useCreateFactory() {
  const queryClient = useQueryClient();
  const router = require("next/navigation").useRouter();

  return useMutation({
    mutationFn: async (body: any) => {
      const response = await rpc.api.factory.post(body);
      const { data, error } = response;

      if (error || !data) {
        // @ts-expect-error
        throw new Error(error?.message || "创建工厂失败");
      }

      return data;
    },
    onSuccess: () => {
      toast.success("工厂创建成功");
      queryClient.invalidateQueries({ queryKey: ["factories"] });
      queryClient.invalidateQueries({ queryKey: ["user", "me"] }); // 刷新用户信息以获取新站点
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "创建工厂失败");
    },
  });
}

// 更新工厂
export function useUpdateFactory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ factoryId, ...body }: { factoryId: string } & any) => {
      const response = await rpc.api.factory.factoryId({ factoryId }).patch(body);
      const { data, error } = response;

      if (error || !data) {
        // @ts-expect-error
        throw new Error(error?.message || "更新工厂失败");
      }

      return data;
    },
    onSuccess: () => {
      toast.success("工厂信息更新成功");
      queryClient.invalidateQueries({ queryKey: ["factories"] });
    },
    onError: (error) => {
      toast.error(error.message || "更新工厂失败");
    },
  });
}