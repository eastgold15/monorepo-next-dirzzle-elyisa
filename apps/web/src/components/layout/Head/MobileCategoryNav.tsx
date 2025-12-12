"use client";
import { memo } from "react";

import { CategoryLink } from "@/components/layout/Head/CategoryLink";
import { useCategoryNavigation } from "@/hooks/useCategoryNavigation";

interface MobileCategoryNavProps {
  /**
   * 分类导航点击回调
   * @param slug - 分类的 slug
   * @param id - 分类的 id
   */
  onNavigate?: (slug: string, id: string) => void;
  /**
   * 点击后关闭菜单的回调
   */
  onClose?: () => void;
  /**
   * 自定义样式类名
   */
  className?: string;
}

/**
 * 移动端分类导航组件
 * 从后端获取树形分类数据并渲染为移动端菜单列表
 */
const MobileCategoryNavComponent: React.FC<MobileCategoryNavProps> = ({
  onNavigate,
  onClose,
  className = "",
}) => {
  const { handleNavigateWithCallback, categories } = useCategoryNavigation();

  // 处理分类点击事件
  const handleCategoryNavigate = (slug: string, categoryId: string) => {
    handleNavigateWithCallback(slug, categoryId, onNavigate, onClose);
  };

  return (
    <div className={className}>
      {categories.map((link) => (
        <div className="border-gray-100 border-b" key={link.id}>
          <CategoryLink
            category={link}
            className="block w-full py-3 text-left font-serif text-black text-lg"
            onNavigate={handleCategoryNavigate}
          />

          {/* 移动端子分类显示 */}
          {link.children && link.children.length > 0 && (
            <div className="mb-3 ml-4 space-y-2">
              {link.children.map((child) => (
                <CategoryLink
                  category={child}
                  className="block w-full py-2 text-left font-sans text-gray-600 text-md"
                  isSubcategory
                  key={child.id}
                  onNavigate={handleCategoryNavigate}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export const MobileCategoryNav = memo(MobileCategoryNavComponent);
