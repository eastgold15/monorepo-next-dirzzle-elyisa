"use client";

import { File, Film, Image, Music, X } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { Progress } from "./progress";

interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

interface UploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // bytes
  maxFiles?: number;
  onUpload?: (files: File[]) => Promise<void>;
  onSuccess?: (files: UploadFile[]) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

export function Upload({
  accept = "image/*,video/*,.pdf,.doc,.docx",
  multiple = true,
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 10,
  onUpload,
  onSuccess,
  onError,
  className,
  disabled = false,
}: UploadProps) {
  const [files, setFiles] = React.useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="size-4" />;
    if (type.startsWith("video/")) return <Film className="size-4" />;
    if (type.startsWith("audio/")) return <Music className="size-4" />;
    return <File className="size-4" />;
  };

  const createPreview = (file: File): Promise<string> =>
    new Promise((resolve) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve("");
      }
    });

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `文件大小超过限制 (${formatFileSize(maxSize)})`;
    }
    return null;
  };

  const addFiles = async (newFiles: FileList | File[]) => {
    const fileList = Array.from(newFiles);

    if (files.length + fileList.length > maxFiles) {
      onError?.(`最多只能上传 ${maxFiles} 个文件`);
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

    setFiles((prev) => [...prev, ...uploadFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const uploadFiles = async () => {
    const pendingFiles = files.filter((f) => f.status === "pending");
    if (pendingFiles.length === 0) return;

    for (const uploadFile of pendingFiles) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, status: "uploading" as const } : f
        )
      );

      try {
        // 模拟上传进度
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          setFiles((prev) =>
            prev.map((f) => (f.id === uploadFile.id ? { ...f, progress } : f))
          );
        }

        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id ? { ...f, status: "success" as const } : f
          )
        );
      } catch (error) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: "error" as const, error: "上传失败" }
              : f
          )
        );
        onError?.(`上传 ${uploadFile.name} 失败`);
      }
    }

    const successfulFiles = files.filter((f) => f.status === "success");
    if (successfulFiles.length > 0) {
      onSuccess?.(successfulFiles);
    }

    // 清理已上传的文件
    setTimeout(() => {
      setFiles((prev) => prev.filter((f) => f.status !== "success"));
    }, 2000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    addFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
  };

  const hasPendingFiles = files.some((f) => f.status === "pending");

  return (
    <div className={cn("space-y-4", className)}>
      <Card
        className={cn(
          "border-2 border-dashed transition-colors",
          isDragOver && "border-primary bg-primary/5",
          disabled && "cursor-not-allowed opacity-50"
        )}
        onDragLeave={() => setIsDragOver(false)}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <Upload className="mb-4 size-10 text-muted-foreground" />
          <div className="mb-2 space-y-1">
            <p className="font-medium text-sm">拖拽文件到此处上传</p>
            <p className="text-muted-foreground text-xs">
              或者点击下方按钮选择文件
            </p>
          </div>
          <p className="mb-4 text-muted-foreground text-xs">
            支持格式: {accept} | 最大大小: {formatFileSize(maxSize)} | 最多{" "}
            {maxFiles} 个文件
          </p>
          <Button
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
          >
            选择文件
          </Button>
          <input
            accept={accept}
            className="hidden"
            disabled={disabled}
            multiple={multiple}
            onChange={handleFileSelect}
            ref={fileInputRef}
            type="file"
          />
        </CardContent>
      </Card>

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">待上传文件 ({files.length})</h4>
            {hasPendingFiles && (
              <Button disabled={disabled} onClick={uploadFiles} size="sm">
                开始上传
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {files.map((uploadFile) => (
              <Card className="p-3" key={uploadFile.id}>
                <div className="flex items-center gap-3">
                  {uploadFile.preview ? (
                    <img
                      alt={uploadFile.name}
                      className="size-10 rounded object-cover"
                      src={uploadFile.preview}
                    />
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                      {getFileIcon(uploadFile.type)}
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
    </div>
  );
}
