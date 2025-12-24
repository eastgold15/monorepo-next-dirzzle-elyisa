import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

// --- 子组件 2：简单的产品图片组件 (用于相关商品) ---
export const SimpleProductImage = ({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative h-full w-full bg-gray-50">
      {!loaded && <Skeleton className="absolute inset-0 z-10 h-full w-full" />}
      <Image
        alt={alt}
        className={cn(
          "object-contain mix-blend-multiply transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0"
        )}
        fill
        onLoad={() => setLoaded(true)}
        sizes="(max-width: 768px) 100vw, 33vw"
        src={src}
      />
    </div>
  );
};
