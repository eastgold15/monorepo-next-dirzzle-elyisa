"use client";
import { useRef, useState } from "react";
import type { SiteCategoryTreeRes } from "@/hooks/api/site-category-hook";
import { useNavAction } from "./hook/useNavAction";
import { DropdownIndicator, NAV_STYLES, NavLink } from "./NavParts";

// 单个菜单项组件（递归核心）
const MenuItem = ({ category }: { category: SiteCategoryTreeRes }) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { getCategoryHref, handleNavigate } = useNavAction();

  const hasChildren = category.children && category.children.length > 0;
  const href = getCategoryHref(category.id);

  // 鼠标交互逻辑优化
  const onMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const onMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  if (!hasChildren) {
    return (
      <NavLink
        className={NAV_STYLES.desktopLink}
        href={href}
        onClick={() => handleNavigate(href)}
      >
        {category.name}
      </NavLink>
    );
  }

  return (
    <div
      className="relative flex h-full items-center"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* 父级菜单标题 */}
      <NavLink
        className={NAV_STYLES.desktopLink}
        href={href}
        onClick={() => handleNavigate(href)}
      >
        {category.name}
        <DropdownIndicator isOpen={isOpen} />
      </NavLink>

      {/* 递归下拉面板 */}
      {isOpen && (
        <div className="fade-in zoom-in-95 absolute top-full left-0 z-50 min-w-[200px] animate-in border border-gray-100 bg-white py-2 shadow-lg duration-100">
          {(category?.children || []).map((child) => (
            <DropdownItem category={child} key={child.id} />
          ))}
        </div>
      )}
    </div>
  );
};

// 下拉菜单项（支持多级嵌套，向右展开）
const DropdownItem = ({ category }: { category: SiteCategoryTreeRes }) => {
  const { getCategoryHref, handleNavigate } = useNavAction();
  const href = getCategoryHref(category.id);
  const hasChildren = category.children && category.children.length > 0;

  // 这里可以复用上面的 hover 逻辑来实现多级菜单，
  // 为保持简单，演示代码中仅处理了二级，如需三级只需将上面的 MenuItem 逻辑复刻到这里即可

  return (
    <NavLink
      className={NAV_STYLES.dropdownItem}
      href={href}
      onClick={() => handleNavigate(href)}
    >
      {category.name}
    </NavLink>
  );
};

export const DesktopMenu = ({
  categories,
}: {
  categories: SiteCategoryTreeRes[];
}) => (
  <div className="hidden items-center justify-center space-x-8 md:flex lg:space-x-12">
    {categories.map((cat) => (
      <MenuItem category={cat} key={cat.id} />
    ))}
  </div>
);
