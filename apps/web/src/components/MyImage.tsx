import Image from "next/image";
import { useState } from "react";
import { useCurrentMediaQuery } from "@/hooks/api/meida-hook";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";

export const MyImage = ({
  imageId,
  alt,
  className,
}: {
  imageId: string | null | undefined;
  alt: string;
  className?: string;
}) => {
  const [isImgLoading, setIsImgLoading] = useState(true);
  const { data, isLoading } = useCurrentMediaQuery(String(imageId || ""));

  const finalSrc =
    data ||
    "https://images.unsplash.com/photo-1596482343834-039c394c8617?q=80&w=2070&auto=format&fit=crop"; // 兜底图

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* 只要接口在加载，或者图片文件还没下完，就显示骨架屏 */}
      {(isLoading || isImgLoading) && (
        <Skeleton className="absolute inset-0 z-10" />
      )}

      <Image
        alt={alt}
        className={cn(
          "object-cover transition-opacity duration-500",
          isImgLoading ? "opacity-0" : "opacity-100"
        )}
        fill
        onLoad={() => setIsImgLoading(false)} // 图片真正下载完后隐藏骨架屏
        src={finalSrc}
      />
    </div>
  );
};
