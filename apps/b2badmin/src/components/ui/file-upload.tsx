"use client";

import Image from "next/image";
import { X, Upload as UploadIcon } from "lucide-react";
import * as React from "react";
import { usePresignedUrlQuery, useUploadMutation } from "@/hooks/upload-hook";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { Progress } from "./progress";
import type { UploadFile, UploadConfig } from "@repo/contract/media/upload.t.model";

interface FileUploadProps {
  config: UploadConfig;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess?: (files: Array<{ url: string; data: any }>) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function FileUpload({
  config,
  open,
  onOpenChange,
  onUploadSuccess,
  onError,
  className,
}: FileUploadProps) {
  const [files, setFiles] = React.useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const recordMutation = useUploadMutation();

  // 当选择文件时，获取预签名URL
  const { data: presignData, error: presignError, isLoading: presignLoading } =
    usePresignedUrlQuery(
      files.length > 0 && files[0].status === "pending"
        ? {
            fileName: files[0].name,
            mimeType: files[0].type,
            category: config.category,
          }
        : { fileName: "", mimeType: "", category: config.category }
    );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  const createPreview = (file: File): Promise<string> =>
    new Promise((resolve) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      } else if (file.type.startsWith("video/")) {
        // 对于视频，可以创建一个缩略图预览
        resolve("");
      } else {
        resolve("");
      }
    });

  const validateFile = (file: File): string | null => {
    // 检查文件类型
    if (config.accept && !new RegExp(config.accept.replace('*', '.*')).test(file.type)) {
      return `不支持的文件类型: ${file.type}`;
    }

    // 检查文件大小
    if (config.maxSize && file.size > config.maxSize) {
      const maxSizeMB = config.maxSize / (1024 * 1024);
      return `文件大小超过限制 (最大 ${maxSizeMB}MB)`;
    }

    // 检查文件数量
    if (!config.multiple && files.length > 0) {
      return "只能上传一个文件";
    }

    return null;
  };

  const addFiles = async (newFiles: FileList | File[]) => {
    const fileList = Array.from(newFiles);

    if (fileList.length > config.maxFiles) {
      onError?.(`最多只能上传 ${config.maxFiles} 个文件`);
      return;
    }

    const uploadFiles: UploadFile[] = [];

    for (const file of fileList) {
      const error = validateFile(file);
      if (error) {
        onError?.(`${file.name}: ${error}`);
        continue;
      }

      const preview = await createPreview(file);
      uploadFiles.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview,
        progress: 0,
        status: "pending",
      });
    }

    setFiles((prev) => {
      if (config.multiple) {
        return [...prev, ...uploadFiles];
      } else {
        return uploadFiles;
      }
    });
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const uploadFiles = async () => {
    const pendingFiles = files.filter((f) => f.status === "pending");
    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    // 更新所有待上传文件的状态为上传中
    setFiles((prev) =>
      prev.map((f) =>
        f.status === "pending" ? { ...f, status: "uploading" as const } : f
      )
    );

    const uploadedFiles: Array<{ url: string; data: any }> = [];

    for (const pendingFile of pendingFiles) {
      try {
        // 如果有多个文件，需要分别为每个文件获取预签名URL
        // 这里简化处理，假设批量上传时使用第一个文件的预签名URL
        const uploadUrl = presignData?.data.url;
        const storageKey = presignData?.data.storageKey;

        if (!uploadUrl || !storageKey) {
          throw new Error("获取预签名URL失败");
        }

        // 上传文件到 S3
        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          body: pendingFile.file,
        });

        if (!uploadRes.ok) {
          throw new Error("文件上传失败");
        }

        // 记录到数据库
        const recordData = await recordMutation.mutateAsync({
          media: {
            storageKey,
            userId: null, // 头像上传不需要用户ID
            originalName: pendingFile.name,
            mimeType: pendingFile.type,
            category: config.category,
          },
          meta: {
            mediaType: config.mediaType,
          },
        });

        uploadedFiles.push({
          url: recordData?.data?.url || uploadUrl.split("?")[0],
          data: recordData?.data,
        });

        // 更新文件状态为成功
        setFiles((prev) =>
          prev.map((f) =>
            f.id === pendingFile.id
              ? { ...f, status: "success" as const, progress: 100 }
              : f
          )
        );
      } catch (error) {
        console.error("Upload error:", error);
        const errorMsg = error instanceof Error ? error.message : "上传失败";

        // 更新文件状态为失败
        setFiles((prev) =>
          prev.map((f) =>
            f.id === pendingFile.id
              ? { ...f, status: "error" as const, error: errorMsg }
              : f
          )
        );

        onError?.(errorMsg);
      }
    }

    // 通知父组件
    if (uploadedFiles.length > 0) {
      onUploadSuccess?.(uploadedFiles);
    }

    // 延迟关闭对话框
    setTimeout(() => {
      onOpenChange(false);
      setFiles([]);
    }, 1000);

    setIsUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
  };

  const hasPendingFiles = files.some((f) => f.status === "pending");
  const canUpload = files.length > 0 && !presignError && !presignLoading;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />

      {/* 对话框内容 */}
      <Card className={cn("relative z-10 mx-4 w-full max-w-lg", className)}>
        <CardContent className="p-6">
          {/* 标题和关闭按钮 */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-lg">上传文件</h3>
            <Button
              onClick={() => onOpenChange(false)}
              size="icon"
              variant="ghost"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* 拖拽上传区域 */}
          <div
            className={cn(
              "rounded-lg border-2 border-dashed p-8 text-center transition-colors",
              isDragOver && "border-primary bg-primary/5"
            )}
            onDragLeave={() => setIsDragOver(false)}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <UploadIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">
                  拖拽文件到此处
                  {config.multiple && "（支持多文件）"}
                </p>
                <p className="text-muted-foreground text-sm">
                  或点击下方按钮选择
                </p>
              </div>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                选择文件
              </Button>
              <input
                accept={config.accept}
                className="hidden"
                multiple={config.multiple}
                onChange={handleFileSelect}
                ref={fileInputRef}
                type="file"
              />
              <p className="text-muted-foreground text-xs">
                支持格式: {config.accept || "所有格式"}
                {config.maxSize && ` | 最大: ${formatFileSize(config.maxSize)}`}
                {config.maxFiles && ` | 最多: ${config.maxFiles} 个文件`}
              </p>
            </div>
          </div>

          {/* 文件列表 */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">
                  待上传文件 ({files.length})
                </h4>
                {hasPendingFiles && (
                  <Button
                    disabled={isUploading || presignLoading || !canUpload}
                    onClick={uploadFiles}
                    size="sm"
                  >
                    {isUploading
                      ? "上传中..."
                      : presignLoading
                      ? "准备中..."
                      : !canUpload && presignError
                      ? "获取预签名失败"
                      : "开始上传"}
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {files.map((uploadFile) => (
                  <Card className="p-3" key={uploadFile.id}>
                    <div className="flex items-center gap-3">
                      {uploadFile.preview ? (
                        <Image
                          alt={uploadFile.name}
                          className="size-10 rounded object-cover"
                          src={uploadFile.preview}
                          width={40}
                          height={40}
                        />
                      ) : (
                        <div className="size-10 rounded bg-muted flex items-center justify-center">
                          <UploadIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="truncate font-medium text-sm">
                            {uploadFile.name}
                          </p>
                          <Button
                            className="h-6 w-6"
                            disabled={uploadFile.status === "uploading"}
                            onClick={() => removeFile(uploadFile.id)}
                            size="icon"
                            variant="ghost"
                          >
                            <X className="size-3" />
                          </Button>
                        </div>

                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-muted-foreground text-xs">
                            {formatFileSize(uploadFile.size)}
                          </span>
                          <span
                            className={cn(
                              "text-xs",
                              uploadFile.status === "success" && "text-green-600",
                              uploadFile.status === "error" && "text-red-600",
                              uploadFile.status === "uploading" && "text-blue-600"
                            )}
                          >
                            {uploadFile.status === "pending" && "等待上传"}
                            {uploadFile.status === "uploading" && "上传中..."}
                            {uploadFile.status === "success" && "上传成功"}
                            {uploadFile.status === "error" && uploadFile.error}
                          </span>
                        </div>

                        {uploadFile.status === "uploading" && (
                          <Progress
                            className="mt-2 h-1"
                            value={uploadFile.progress}
                          />
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}