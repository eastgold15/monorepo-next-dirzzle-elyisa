"use client";

import { FileUpload } from "./file-upload";
import type { UploadConfig } from "@repo/contract/media/upload.t.model";

interface AvatarUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess: (url: string, data: any) => void;
  onError?: (error: string) => void;
}

// 头像上传配置
const avatarUploadConfig: UploadConfig = {
  category: "avatar", // 头像分类
  mediaType: "image", // 媒体类型为图片
  multiple: false, // 不允许多文件
  maxSize: 5 * 1024 * 1024, // 5MB
  maxFiles: 1,
  accept: "image/*", // 只接受图片文件
};

export function AvatarUploadNew({
  open,
  onOpenChange,
  onUploadSuccess,
  onError,
}: AvatarUploadProps) {
  const handleUploadSuccess = (files: Array<{ url: string; data: any }>) => {
    // 头像上传只会返回一个文件
    if (files.length > 0) {
      onUploadSuccess(files[0].url, files[0].data);
    }
  };

  return (
    <FileUpload
      config={avatarUploadConfig}
      open={open}
      onOpenChange={onOpenChange}
      onUploadSuccess={handleUploadSuccess}
      onError={onError}
    />
  );
}