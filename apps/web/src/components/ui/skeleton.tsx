import { cn } from "@/lib/utils";

interface SkeletonProps extends React.ComponentProps<"div"> {
  /**
   * rectangle: 矩形（如广告位）
   * circle: 圆形（如头像）
   * rounded: 带圆角的矩形（如按钮、卡片）
   */
  variant?: "rectangle" | "circle" | "rounded";
}

function Skeleton({ className, variant = "rounded", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gray-200 dark:bg-gray-800", // 建议用 gray 系列，兼容性最强
        variant === "circle" && "rounded-full",
        variant === "rounded" && "rounded-lg", // 稍微大一点的圆角更有现代感
        variant === "rectangle" && "rounded-none",
        className
      )}
      data-slot="skeleton"
      {...props}
    />
  );
}

/**
 * 业务快捷组件：图片骨架屏
 * 专门用于广告、封面图等场景
 */
const ImageSkeleton = ({ className }: { className?: string }) => (
  <Skeleton
    className={cn("h-full min-h-[200px] w-full", className)}
    variant="rectangle"
  />
);

/**
 * 业务快捷组件：卡片列表骨架屏
 */
const CardSkeleton = () => (
  <div className="flex w-full flex-col gap-3">
    <ImageSkeleton className="h-48 rounded-xl" />
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);

export { Skeleton, ImageSkeleton, CardSkeleton };
