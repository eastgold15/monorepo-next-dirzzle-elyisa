"use client";

import type { UploadTModel } from "@repo/contract/typebox";
import { SimpleMultiFileUpload } from "./file-upload";

interface AvatarUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess: (url: string, data: any) => void;
  onError?: (error: string) => void;
}

// 头像上传配置
const avatarUploadConfig: UploadTModel["UploadConfig"] = {
  category: "avatar", // 头像分类
  mediaType: "image", // 媒体类型为图片
  multiple: false, // 不允许多文件
  maxSize: 5 * 1024 * 1024, // 5MB
  maxFiles: 1,
  accept: "image/jpeg,image/png,image/gif,image/webp", // 支持的图片格式
};

export function AvatarUploadNew({
  open,
  onOpenChange,
  onUploadSuccess,
  onError,
}: AvatarUploadProps) {
  const handleUploadSuccess = (files: Array<{ url: string; data: any }>) => {
    console.log(
      "AvatarUploadNew - handleUploadSuccess called with files:",
      files
    );
    // 头像上传只会返回一个文件
    if (files.length > 0) {
      console.log(
        "AvatarUploadNew - calling onUploadSuccess with URL:",
        files[0].url
      );
      onUploadSuccess(files[0].url, files[0].data);
    }
  };

  return (
    <SimpleMultiFileUpload
      config={avatarUploadConfig}
      onError={onError}
      onOpenChange={onOpenChange}
      onUploadSuccess={handleUploadSuccess}
      open={open}
    />
  );
}
