// components/MediaUpload.tsx
"use client";

import { Loader2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload } from "@/components/ui/upload";
import { useMediaUpload } from "@/hooks/api";

export function MediaUpload({
  children,
  onUploadComplete,
}: {
  children: React.ReactNode;
  onUploadComplete?: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const { mutateAsync, isPending } = useMediaUpload();

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      {/* asChild 必须加上，它会将 Dialog 的打开逻辑绑定到你的 Button 上 */}
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-2xl sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-bold text-xl">上传媒体资源</DialogTitle>
          <DialogDescription>
            您可以拖拽文件到此处，或点击下方区域选择文件。
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Upload
            multiple
            onUpload={async (files) => {
              try {
                const promises = files.map((f) =>
                  mutateAsync({ file: f, category: "general" })
                );
                await Promise.all(promises);

                toast.success("上传成功！");
                setOpen(false); // 上传成功自动关窗
                onUploadComplete?.(); // 刷新列表数据
              } catch (error) {
                toast.error("部分文件上传失败，请重试");
              }
            }}
          />
        </div>

        {isPending && (
          <div className="flex items-center justify-center gap-2 pb-4 font-medium text-indigo-600 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            正在同步到服务器...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
