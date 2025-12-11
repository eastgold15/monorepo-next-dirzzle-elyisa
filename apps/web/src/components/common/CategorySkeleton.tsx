interface CategorySkeletonProps {
  /**
   * 骨架屏类型
   * - desktop: 桌面端横向骨架屏
   * - mobile: 移动端纵向骨架屏
   */
  type?: "desktop" | "mobile";
  /**
   * 显示的骨架屏数量
   */
  count?: number;
  /**
   * 自定义样式类名
   */
  className?: string;
  /**
   * 是否显示在容器中
   */
  container?: boolean;
}

/**
 * 统一的分类骨架屏组件
 * 支持桌面端和移动端不同样式的加载状态显示
 */
const CategorySkeletonComponent: React.FC<CategorySkeletonProps> = ({
  type = "desktop",
  count = 6,
  className = "",
  container = false,
}) => {
  // 根据类型配置骨架屏样式
  const skeletonConfig =
    type === "desktop"
      ? "h-4 w-16 animate-pulse rounded bg-gray-200"
      : "h-6 w-32 animate-pulse rounded border-gray-100 border-b bg-gray-200 pb-3";

  // 容器样式配置
  const containerClasses =
    type === "desktop"
      ? "flex items-center justify-center space-x-8 lg:space-x-12"
      : "space-y-2";

  // 骨架屏内容
  const skeletonContent = (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div
          className={skeletonConfig}
          key={`${type}-skeleton-${
            // biome-ignore lint/suspicious/noArrayIndexKey: <litter>
            index
          }`}
        />
      ))}
    </>
  );

  // 如果需要容器包装
  if (container) {
    return (
      <div className={`${containerClasses} ${className}`}>
        {skeletonContent}
      </div>
    );
  }

  // 直接返回骨架屏内容
  return <div className={className}>{skeletonContent}</div>;
};

export const CategorySkeleton = CategorySkeletonComponent;
