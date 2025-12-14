import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";

// 获取模板列表
export function useTemplates(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["templates", page, limit],
    queryFn: async () => {
      const res = await rpc.api.product.template.get({
        $query: { page, limit },
      });
      if (res.error) {
        throw new Error(res.error.message);
      }
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// 获取模板详情
export function useTemplate(id: string) {
  return useQuery({
    queryKey: ["template", id],
    queryFn: async () => {
      const res = await rpc.api.product.template[":id"].get();
      if (res.error) {
        throw new Error(res.error.message);
      }
      return res.data;
    },
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
    }) => {
      const res = await rpc.api.product.template.post({
        data,
      });
      if (res.error) {
        throw new Error(res.error.message);
      }
      return res.data;
    },
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
    }) => {
      const res = await rpc.api.product.template[":id"].put({
        data,
      });
      if (res.error) {
        throw new Error(res.error.message);
      }
      return res.data;
    },
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
    mutationFn: async (ids: string[]) => {
      const res = await rpc.api.product.template.delete({
        ids
      });
      if (res.error) {
        throw new Error(res.error.message);
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}
