"use client";

import type { SalespersonsContract } from "@repo/contract";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";

// 获取业务员列表
export function useSalespersons(
  query: typeof SalespersonsContract.ListQuery.static
) {
  return useQuery({
    queryKey: ["salespersons", query],
    queryFn: async () =>
      await handleEden(
        rpc.api.v1.salespersons.get({
          query,
        })
      ),
    staleTime: 1000 * 60 * 2, // 2分钟缓存
  });
}

// 获取业务员详情
export function useSalesperson(id: string) {
  return useQuery({
    queryKey: ["salespersons", id],
    queryFn: async () =>
      await handleEden(rpc.api.v1.salespersons({ id }).get()),
    enabled: !!id,
  });
}

// 创建业务员
export function useCreateSalesperson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: typeof SalespersonsContract.Create.static) =>
      await handleEden(rpc.api.v1.salespersons.post(data)),
    onSuccess: () => {
      toast.success("业务员创建成功");
      queryClient.invalidateQueries({ queryKey: ["salespersons"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "创建业务员失败");
    },
  });
}

// 更新业务员
export function useUpdateSalesperson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: typeof SalespersonsContract.Update.static;
    }) => await handleEden(rpc.api.v1.salespersons({ id }).put(data)),
    onSuccess: () => {
      toast.success("业务员更新成功");
      queryClient.invalidateQueries({ queryKey: ["salespersons"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "更新业务员失败");
    },
  });
}

// 删除业务员
export function useDeleteSalesperson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) =>
      await handleEden(rpc.api.v1.salespersons({ id }).delete()),
    onSuccess: () => {
      toast.success("业务员删除成功");
      queryClient.invalidateQueries({ queryKey: ["salespersons"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "删除业务员失败");
    },
  });
}

// 更新业务员的主分类
export function useUpdateSalespersonMasterCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      masterCategoryIds,
    }: {
      id: string;
      masterCategoryIds: string[];
    }) =>
      await handleEden(
        rpc.api.v1.salespersons({ id })["master-categories"].put({
          masterCategoryIds,
        })
      ),
    onSuccess: () => {
      toast.success("主分类分配成功");
      queryClient.invalidateQueries({ queryKey: ["salespersons"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "分配主分类失败");
    },
  });
}
