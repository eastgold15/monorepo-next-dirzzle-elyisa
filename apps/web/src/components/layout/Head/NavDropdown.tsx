import { ChevronDown } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { useCategoryNavigation } from "@/hooks/useCategoryNavigation";
import type { NavDropdownProps } from "@/types/category";

/**
 * 导航下拉菜单组件
 * 支持鼠标悬停显示二级分类，支持无限层级嵌套
 */
const NavDropdownComponent: React.FC<NavDropdownProps> = ({
  category,
  onNavigate,
  className = "",
  isOpen: controlledIsOpen,
  onToggle,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  const { handleNavigate } = useCategoryNavigation();

  // 支持受控和非受控模式
  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = onToggle || setInternalIsOpen;

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150); // 延迟150ms隐藏，避免意外关闭
  };

  const handleCategoryClick = (slug: string, id: string) => {
    handleNavigate(slug, id);
    setIsOpen(false);
  };

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  // 如果没有子分类，返回普通链接
  if (!category.children || category.children.length === 0) {
    return (
      <button
        className={`font-medium text-[10px] text-black uppercase tracking-[0.15em] transition-colors hover:text-gray-500 lg:text-[11px] ${className}`}
        onClick={() => handleCategoryClick(category.slug, category.id)}
      >
        {category.name}
      </button>
    );
  }

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 主分类按钮 */}
      <button className="flex items-center gap-1 font-medium text-[10px] text-black uppercase tracking-[0.15em] transition-colors hover:text-gray-500 lg:text-[11px]">
        {category.name}
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 min-w-[200px] border border-gray-100 bg-white py-2 shadow-lg">
          {category.children.map((child) => (
            <div className="group" key={child.id}>
              <button
                className="w-full px-4 py-2 text-left text-gray-700 text-sm transition-colors hover:bg-gray-50 hover:text-black"
                onClick={() => handleCategoryClick(child.slug, child.id)}
              >
                {child.name}
              </button>

              {/* 如果有子分类，递归渲染 */}
              {child.children && child.children.length > 0 && (
                <div className="absolute top-0 left-full ml-1 hidden group-hover:block">
                  <div className="min-w-[180px] border border-gray-100 bg-white py-2 shadow-lg">
                    {child.children.map((grandChild) => (
                      <button
                        className="w-full px-4 py-2 text-left text-gray-700 text-sm transition-colors hover:bg-gray-50 hover:text-black"
                        key={grandChild.id}
                        onClick={() =>
                          handleCategoryClick(grandChild.slug, grandChild.id)
                        }
                      >
                        {grandChild.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const NavDropdown = memo(NavDropdownComponent);
