import { memo } from "react";
import type { CategoryLinkProps } from "@/types/category";

/**
 * 分类链接组件
 * 统一处理分类链接的生成和样式
 */
const CategoryLinkComponent: React.FC<CategoryLinkProps> = ({
  category,
  onNavigate,
  className = "",
  isSubcategory = false,
}) => {
  const handleClick = () => {
    if (onNavigate) {
      onNavigate(category.slug, category.id);
    }
  };

  const baseClasses = "transition-colors hover:text-gray-500";
  const sizeClasses = isSubcategory
    ? "text-sm font-normal text-gray-700 py-2 px-4 text-left w-full hover:bg-gray-50 hover:text-black"
    : "font-medium text-[10px] text-black uppercase tracking-[0.15em] lg:text-[11px]";

  return (
    <button
      aria-label={`Navigate to ${category.name} category`}
      className={`${baseClasses} ${sizeClasses} ${className}`}
      onClick={handleClick}
    >
      {category.name}
    </button>
  );
};

export const CategoryLink = memo(CategoryLinkComponent);
