"use client";
// hooks/usePresignedUrl.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import SparkMD5 from "spark-md5";
import { queryKeys } from "@/lib/query/query-keys";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";
import type { CommonRes } from "@/server/utils/Res";

type ExtractDataType<T> = T extends CommonRes<infer D> ? D : never;

interface PresignedUrlParams {
  mimeType: string;
  fileName: string;
  category?: string;
}

/**
 * 获取单个文件的预签名上传 URL
 */
export function usePresignedUrlQuery(params: PresignedUrlParams) {
  const { mimeType, fileName, category } = params;

  // 计算字符串的 MD5
  const filenameHash = SparkMD5.hash(fileName);
  return useQuery({
    queryKey: queryKeys.uploads.presignedUrlByHash(filenameHash),
    queryFn: async () => {
      // 调用你的 EdenRPC 接口（假设你有 /api/upload/presign.get）
      const result = handleEden(
        await rpc.api.media.upload["pre-sign"].get({
          $query: {
            fileNameHash: filenameHash,
            mimeType,
            category,
          },
        })
      );
      // 假设返回 { url: string; key: string }
      return result;
    },
    enabled: !!filenameHash && !!mimeType, // 防止空参数请求
    staleTime: 30_000, // 预签名 URL 通常 5-30 分钟有效，这里缓存 30 秒足够
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

// 文件件信息传入数据库
export function useUploadMutation() {
  return useMutation({
    mutationFn: async (args: Parameters<typeof rpc.api.media.upload.post>[0]) =>
      handleEden(await rpc.api.media.upload.post(args)),
  });
}

// type ComProductList = Awaited<ReturnType<typeof useProductListQuery>>["data"];
// export type BackendProductList = ExtractDataType<ComProductList>;
