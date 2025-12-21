import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";

// 获取模板列表
export function useTemplates(search?: string) {
  return useQuery({
    queryKey: ["templates", search],
    queryFn: async () =>
      await handleEden(
        rpc.api.v1.producttemplates.get({
          query: { search },
        })
      ),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// 根据站点分类获取模板列表
export function useTemplatesBySiteCategory(siteCategoryId?: string) {
  return useQuery({
    queryKey: ["templates", "site-category", siteCategoryId],
    queryFn: async () => {
      if (!siteCategoryId) return [];
      const data = await handleEden(
        rpc.api.v1.producttemplates["by-site-category"]({
          siteCategoryId,
        }).get()
      );
      return data || [];
    },
    enabled: !!siteCategoryId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// 获取模板详情
export function useTemplate(id: string) {
  return useQuery({
    queryKey: ["template", id],
    queryFn: async () =>
      await handleEden(rpc.api.v1.producttemplates({ id }).get()),
    enabled: !!id,
  });
}

// 创建模板
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      categoryId: string;
      fields: Array<{
        name: string;
        code: string;
        type: "text" | "number" | "select" | "multiselect" | "richtext";
        isSkuSpec: boolean;
        required?: boolean;
        options?: string[];
        sortOrder?: number;
      }>;
    }) => await handleEden(rpc.api.v1.producttemplates.post(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
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
      data: {
        name: string;
        description?: string;
        categoryId: string;
        fields: Array<{
          id?: string;
          name: string;
          code: string;
          type: "text" | "number" | "select" | "multiselect" | "richtext";
          isSkuSpec: boolean;
          required?: boolean;
          options?: string[];
          sortOrder?: number;
        }>;
      };
    }) => await handleEden(rpc.api.v1.producttemplates({ id }).patch(data)),
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
    mutationFn: async (ids: string[]) =>
      await handleEden(
        rpc.api.v1.producttemplates.delete({
          ids,
        })
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}
