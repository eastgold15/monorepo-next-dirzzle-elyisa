"use client";

import { useState } from "react";
import { AvatarUploadNew } from "@/components/ui/avatar-upload-new";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import type { UploadConfig } from "@repo/contract/media/upload.t.model";

export default function TestUploadPage() {
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const handleAvatarSuccess = (url: string, data: any) => {
    setAvatarUrl(url);
    console.log("Avatar uploaded:", url, data);
  };

  const handleAvatarError = (error: string) => {
    console.error("Avatar upload error:", error);
  };

  const handleFileSuccess = (files: Array<{ url: string; data: any }>) => {
    console.log("Files uploaded:", files);
  };

  const handleFileError = (error: string) => {
    console.error("File upload error:", error);
  };

  // 多文件上传配置示例
  const multiFileConfig: UploadConfig = {
    category: "documents",
    mediaType: "document",
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    accept: ".pdf,.doc,.docx,.txt",
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-2xl font-bold">测试上传组件</h1>

      {/* 头像上传测试 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">头像上传测试</h2>
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-sm">无头像</span>
            </div>
          )}
          <Button onClick={() => setShowAvatarUpload(true)}>
            {avatarUrl ? "更换头像" : "上传头像"}
          </Button>
        </div>
      </div>

      {/* 多文件上传测试 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">多文件上传测试</h2>
        <Button onClick={() => setShowFileUpload(true)}>
          上传文档（最多5个，每个最大10MB）
        </Button>
      </div>

      {/* 头像上传对话框 */}
      <AvatarUploadNew
        open={showAvatarUpload}
        onOpenChange={setShowAvatarUpload}
        onUploadSuccess={handleAvatarSuccess}
        onError={handleAvatarError}
      />

      {/* 多文件上传对话框 */}
      <FileUpload
        config={multiFileConfig}
        open={showFileUpload}
        onOpenChange={setShowFileUpload}
        onUploadSuccess={handleFileSuccess}
        onError={handleFileError}
      />
    </div>
  );
}