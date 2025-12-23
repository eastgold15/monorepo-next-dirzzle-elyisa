import type { AttributeTemplateContract } from "@repo/contract";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";

// 获取模板列表
export function useTemplates(
  query: typeof AttributeTemplateContract.ListQuery.static
) {
  return useQuery({
    queryKey: ["templates", query],
    queryFn: async () =>
      await handleEden(
        rpc.api.v1.attributetemplate.get({
          query,
        })
      ),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// 创建模板
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: typeof AttributeContractreate.static) =>
      await handleEden(rpc.api.v1.attributetemplate.post(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}

// 获取单个模板
export function useTemplate(id: string) {
  return useQuery({
    queryKey: ["template", id],
    queryFn: async () =>
      await handleEden(rpc.api.v1.attributetemplate({ id }).get()),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!id,
  });
}

// 更新模板
export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: typeof AttributeTemplateContract.Update.static;
    }) => await handleEden(rpc.api.v1.attributetemplate({ id }).patch(data)),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      queryClient.invalidateQueries({ queryKey: ["template", id] });
    },
  });
}

// 删除模板
export function useDeleteTemplates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) =>
      await handleEden(rpc.api.v1.attributetemplate({ id }).delete()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}
