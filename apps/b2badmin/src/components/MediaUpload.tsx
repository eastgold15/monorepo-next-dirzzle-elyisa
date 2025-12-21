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

      <DialogContent className="max-w-3xl sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-bold text-xl">上传媒体资源</DialogTitle>
          <DialogDescription>
            选择或拖拽文件到预览区，可以修改文件名，然后点击上传按钮。
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Upload
            autoUpload={false}
            multiple // 手动上传模式
            onUpload={async (files) => {
              console.log("开始上传文件数量:", files.length);

              try {
                // 逐个上传文件
                for (let i = 0; i < files.length; i++) {
                  const f = files[i];
                  console.log(
                    `上传第 ${i + 1} 个文件:`,
                    f.name,
                    f.size,
                    f.type
                  );

                  try {
                    const result = await mutateAsync({
                      file: f,
                      category: "general",
                    });
                    console.log(`文件 ${f.name} 上传成功:`, result);
                  } catch (fileError) {
                    console.error(`文件 ${f.name} 上传失败:`, fileError);
                    throw fileError; // 抛出错误，终止后续上传
                  }
                }

                toast.success("上传成功！");
                setOpen(false); // 上传成功自动关窗
                onUploadComplete?.(); // 刷新列表数据
              } catch (error) {
                console.error("批量上传失败:", error);
                const errorMessage =
                  error instanceof Error ? error.message : "上传失败";
                toast.error(errorMessage);
                // 不要重新抛出错误，让 Upload 组件自己标记失败状态
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
