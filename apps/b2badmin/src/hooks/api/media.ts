import type { MediaDTO } from "@repo/contract";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";
import type { MyInferQuery } from "./utils";

// 媒体文件相关 hooks
// 使用
type MediaListQueryParams = MyInferQuery<typeof rpc.api.v1.media.list.get>;

export function useMediaList(query: MediaListQueryParams) {
  return useQuery({
    queryKey: ["media", "list", query],
    queryFn: async () => {
      const res = (await handleEden(
        rpc.api.v1.media.list.get({ query })
      )) as MediaDTO["Entity"][];
      return res;
    },
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

// 通过 ID 列表获取媒体信息
export function useMediaByIds(ids: string[] | undefined) {
  return useQuery({
    queryKey: ["media", "by-ids", ids],
    queryFn: async () => {
      if (!ids || ids.length === 0) return [];
      const res = (await handleEden(
        rpc.api.v1.media.list.get({ query: { ids } })
      )) as MediaDTO["Entity"][];
      return res;
    },
    enabled: !!ids && ids.length > 0,
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

type MediaUploadQueryParams = MyInferQuery<typeof rpc.api.v1.media.upload.post>;

export function useMediaUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: MediaUploadQueryParams) =>
      await handleEden(rpc.api.v1.media.upload.post(body)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });
}

export function useMediaUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) =>
      await handleEden(rpc.api.v1.media({ id }).put(data)),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      queryClient.invalidateQueries({ queryKey: ["media", id] });
    },
  });
}

export function useMediaDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) =>
      await handleEden(rpc.api.v1.media.batch.delete({ ids })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });
}
