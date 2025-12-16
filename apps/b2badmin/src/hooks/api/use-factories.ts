import { useQuery } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";

// 获取工厂列表
export function useFactoriesQuery() {
  return useQuery({
    queryKey: ["factories"],
    queryFn: async () => {
      const response = await rpc.api.factory.all.get();
      const { data, error } = response;

      if (error || !data) {
        throw new Error(error?.message || "获取工厂列表失败");
      }

      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// 获取当前用户可管理的工厂（出口商使用）
export function useManageableFactories() {
  return useQuery({
    queryKey: ["factories", "manageable"],
    queryFn: async () => {
      const response = await rpc.api.factory.manageable.get();
      const { data, error } = response;

      if (error || !data) {
        throw new Error(error?.message || "获取可管理工厂列表失败");
      }

      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}