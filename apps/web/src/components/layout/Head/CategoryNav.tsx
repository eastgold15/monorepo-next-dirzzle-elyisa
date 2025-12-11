import { memo } from "react";
import { useCategoryNavigation } from "@/hooks/useCategoryNavigation";
import { CategoryLink } from "./CategoryLink";
import { NavDropdown } from "./NavDropdown";

interface CategoryNavProps {
  onNavigate?: (slug: string, id: number) => void;
  /**
   * 自定义样式类名
   */
  className?: string;
  /**
   * 是否显示加载骨架屏
   */
  showSkeleton?: boolean;
}

/**
 * 分类导航组件
 * 从后端获取树形分类数据并渲染为导航栏（SEO友好版）
 * 基于Link组件实现跳转，保留原样式和层级逻辑
 */
const CategoryNavComponent: React.FC<CategoryNavProps> = ({
  onNavigate,
  className = "",
  showSkeleton = true,
}) => {
  const { handleNavigateWithCallback, categories } = useCategoryNavigation();

  return (
    <div
      className={`flex items-center justify-center space-x-8 lg:space-x-12 ${className}`}
    >
      {categories.map((link) =>
        link.children && link.children.length > 0 ? (
          // 下拉分类：传递Link跳转逻辑 + 滚动方法
          <NavDropdown
            category={link}
            key={link.id}
            onNavigate={handleNavigateWithCallback}
          />
        ) : (
          // 普通分类链接：直接用Link组件
          <CategoryLink category={link} key={link.id} onNavigate={onNavigate} />
        )
      )}
    </div>
  );
};

export const CategoryNav = memo(CategoryNavComponent);
