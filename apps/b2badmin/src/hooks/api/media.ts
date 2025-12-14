import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";

// 媒体文件相关 hooks
export function useMediaList(query?: any) {
  return useQuery({
    queryKey: ["media", "list", query],
    queryFn: async () => {
      const result = handleEden(await rpc.api.media.get({ $query: query }));
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

export function useMediaDetail(id: string) {
  return useQuery({
    queryKey: ["media", id],
    queryFn: async () => {
      const result = handleEden(await rpc.api.media[id].get());
      return result;
    },
    enabled: !!id,
  });
}

export function useMediaUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const result = handleEden(await rpc.api.media.upload.post({ body: data }));
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });
}

export function useMediaUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const result = handleEden(await rpc.api.media[id].put({ data }));
      return result;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      queryClient.invalidateQueries({ queryKey: ["media", id] });
    },
  });
}

export function useMediaDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const result = handleEden(await rpc.api.media.delete({ ids }));
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });
}

// 获取存储信息
export function useMediaStorageInfo() {
  return useQuery({
    queryKey: ["media", "storage", "info"],
    queryFn: async () => {
      const result = handleEden(await rpc.api.media.storage.info.get());
      return result;
    },
    staleTime: 10 * 60 * 1000, // 10分钟
  });
}

// 直接上传文件 hook
export function useDirectUploadMutation() {
  return useMutation({
    mutationFn: async (args: { file: File; category?: string; userId?: string }) => {
      // 构造 FormData
      const formData = new FormData();
      formData.append('file', args.file);

      if (args.category) {
        formData.append('category', args.category);
      }
      if (args.userId) {
        formData.append('userId', args.userId);
      }

      const response = await rpc.api.media.upload.post({
        file: args.file,
        category: args.category,
        userId: args.userId,
      });

      return handleEden(response);
    },
  });
}

// 媒体文件类型定义（兼容旧的 hooks）
interface MediaFile {
  id: string;
  originalName: string;
  mimeType: string;
  category: string;
  storageKey: string;
  createdAt: string;
  mediaType: string;
  url?: string;
}

interface MediaListResponse {
  files: MediaFile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 获取媒体文件列表（兼容旧的 hook）
export function useMediaListV2(params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["media", "list", params],
    queryFn: async () => {
      const response = await rpc.api.media.list.get({
        $query: params || {},
        $header: {}
      })
      return handleEden(response);
    },
    staleTime: 1000 * 60 * 5, // 5分钟
  });
}