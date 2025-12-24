"use client";
import Image from "next/image";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentMediaQuery } from "@/hooks/api/meida-hook";
import { cn } from "@/lib/utils";

interface IDImageProps {
  imageId: string | null | undefined;
  alt: string;
  className?: string;
  priority?: boolean; // 新增：允许控制是否优先加载（用于首屏）
}

const IDImage: React.FC<IDImageProps> = ({
  imageId,
  alt,
  className,
  priority = false,
}) => {
  const [isImgLoading, setIsImgLoading] = useState(true);

  // 确保传入字符串，避免 hook 报错
  const { data: imageUrl, isLoading: isQueryLoading } = useCurrentMediaQuery(
    String(imageId || "")
  );

  const defaultImage =
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2012&auto=format&fit=crop";
  const finalSrc = imageUrl || defaultImage;

  // 判断是否需要显示骨架屏
  // 逻辑：正在查API 或 API查完了但图片文件还没下载完
  const showSkeleton = isQueryLoading || isImgLoading;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {showSkeleton && (
        <Skeleton className="absolute inset-0 z-10 h-full w-full bg-gray-200" />
      )}

      <Image
        alt={alt}
        className={cn(
          "object-cover transition-opacity duration-700",
          // 图片加载好之前透明，避免看到"逐行扫描"的加载过程
          isImgLoading ? "opacity-0" : "opacity-100"
        )}
        fill
        onLoad={() => setIsImgLoading(false)}
        priority={priority}
        sizes="(max-width: 768px) 100vw, 80vw"
        src={finalSrc}
      />
    </div>
  );
};

export default IDImage;
