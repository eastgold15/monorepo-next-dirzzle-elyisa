"use client";

import { UploadIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload } from "@/components/ui/upload";
import { useMediaUpload } from "@/hooks/api";

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

interface MediaUploadProps {
  children?: React.ReactNode;
  onUploadComplete?: (files: UploadFile[]) => void;
  onError?: (error: string) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
}

export function MediaUpload({
  children,
  onUploadComplete,
  onError,
  accept = "image/*,video/*,.pdf,.doc,.docx",
  multiple = true,
  maxSize = 10 * 1024 * 1024,
  maxFiles = 10,
}: MediaUploadProps) {
  const [open, setOpen] = React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadFile[]>([]);
  const uploadMutation = useMediaUpload();

  const handleUploadSuccess = (files: UploadFile[]) => {
    setUploadedFiles(files);
    onUploadComplete?.(files);

    // 延迟关闭对话框，让用户看到上传成功状态
    setTimeout(() => {
      setOpen(false);
      setUploadedFiles([]);
    }, 1500);
  };

  const handleError = (error: string) => {
    onError?.(error);
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <UploadIcon className="mr-2 h-4 w-4" />
            上传资源
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>上传媒体资源</DialogTitle>
          <DialogDescription>
            上传图片、视频或其他媒体文件到资源库。支持批量上传。
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto">
          <Upload
            accept={accept}
            maxFiles={maxFiles}
            maxSize={maxSize}
            multiple={multiple}
            onError={handleError}
            onSuccess={handleUploadSuccess}
            onUpload={async (files) => {
              // 实际的上传逻辑
              try {
                const uploadPromises = files.map(async (uploadFile) => {
                  // 使用 mutation 上传文件
                  const result = await uploadMutation.mutateAsync({
                    file: uploadFile.file,
                    category: "general",
                  });

                  return {
                    ...uploadFile,
                    status: "success" as const,
                    url: result.url,
                  };
                });

                const results = await Promise.all(uploadPromises);
                onUploadComplete?.(results);
              } catch (error) {
                onError?.(error instanceof Error ? error.message : "上传失败");
              }
            }}
          />
        </div>

        {uploadedFiles.length > 0 && (
          <DialogFooter>
            <p className="text-green-600 text-sm">
              成功上传 {uploadedFiles.length} 个文件
            </p>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
