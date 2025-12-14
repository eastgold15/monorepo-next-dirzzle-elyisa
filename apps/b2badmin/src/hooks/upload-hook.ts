"use client";

import { useMutation } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";
import type { CommonRes } from "@/server/utils/Res";

type ExtractDataType<T> = T extends CommonRes<infer D> ? D : never;

interface UploadArgs {
  file: File;
  category: string;
  // ... 其他必要的字符串参数
}
/**
 * 直接上传文件到后端（后端会上传到 OSS）
 */

// 假设您的后端需要一个包含 File 和 category 的 FormData

// 1. 定义输入的类型，确保它是结构化的，包含 File 对象
// 这是您的 mutationFn 接收的参数类型
interface UploadArgs {
  file: File;
  category?: string;
  userId?: string;
}

/**
 * 直接上传文件到后端（后端会上传到 OSS/MinIO）
 */
/**
 * 直接上传文件到后端（后端会上传到 OSS/MinIO）
 * - 保持外部调用简洁，内部构造 FormData
 */
export function useDirectUploadMutation() {
  return useMutation({
    // 接收结构化的参数对象
    mutationFn: async (args: UploadArgs) => {
      // 关键：在发送请求前，构造 multipart/form-data
      const formData = new FormData();

      // 1. 必传的文件字段
      // 字段名 'file' 必须与后端 t.Object({ file: t.File() }) 中的键名完全匹配
      formData.append('file', args.file);

      // 2. 可选的字符串字段
      if (args.category) {
        formData.append('category', args.category);
      }
      if (args.userId) {
        formData.append('userId', args.userId);
      }

      // rpc.api.media.upload.post 的类型可能需要调整，以匹配 edenArgs 的结构
      // 但在运行时，这正是它所需要的。
      const response = await rpc.api.media.upload.post({
        file: args.file,
        category: args.category,
        userId: args.userId,
      });

      return handleEden(response);
    },
  });
}