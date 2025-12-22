import { Plus } from "lucide-react";
import type { MediaContractDto } from "@repo/contract";
import { MediaUpload } from "@/components/MediaUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMediaList } from "@/hooks/api";

interface MediaSelectProps {
  value?: string[]; // 媒体ID列表
  onChange?: (mediaIds: string[]) => void; // 回调函数
  maxCount?: number; // 最大选择数量
  className?: string;
  placeholder?: string;
  multiple?: boolean;
}

export function MediaSelect({
  value = [],
  onChange,
  maxCount = 5,
  className,
  placeholder = "选择图片",
  multiple = true,
}: MediaSelectProps) {
  const { data: mediaList = [] } = useMediaList({
    category: "",
    search: "",
  });

  // 添加媒体
  const handleAddMedia = () => {
    // 这里应该打开媒体选择器或上传对话框
    // 暂时使用 console.log 作为占位
    console.log("添加媒体");
  };

  // 移除媒体
  const handleRemoveMedia = (mediaId: string) => {
    const newMediaIds = value.filter((id) => id !== mediaId);
    onChange?.(newMediaIds);
  };

  // 获取媒体URL
  const getMediaUrl = (mediaId: string) => {
    const media = mediaList.find((m: MediaContractDto["Entity"]) => m.id === mediaId);
    return media?.url || "";
  };

  // 获取媒体名称
  const getMediaName = (mediaId: string) => {
    const media = mediaList.find((m: MediaContractDto["Entity"]) => m.id === mediaId);
    return media?.filename || media?.originalName || "";
  };

  return (
    <div className={className}>
      <div className="space-y-2">
        {/* 显示已选择的媒体 */}
        {value.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {value.map((mediaId) => (
              <Card className="relative" key={mediaId}>
                <CardContent className="p-2">
                  <div className="group relative aspect-square overflow-hidden rounded-md">
                    <img
                      alt={getMediaName(mediaId)}
                      className="h-full w-full object-cover"
                      src={getMediaUrl(mediaId)}
                    />
                    <Button
                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 p-0 opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                      onClick={() => handleRemoveMedia(mediaId)}
                      size="sm"
                      variant="destructive"
                    >
                      ×
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 添加媒体按钮 */}
        {(!multiple && value.length === 0) || (multiple && value.length < maxCount) ? (
          <MediaUpload
            onUploadComplete={() => {
              // 上传完成后刷新媒体列表
              // 这里可以触发重新获取媒体列表
              console.log("媒体上传完成");
            }}
          >
            <Button className="w-full" type="button" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              {placeholder}
            </Button>
          </MediaUpload>
        ) : null}
      </div>
    </div>
  );
}
