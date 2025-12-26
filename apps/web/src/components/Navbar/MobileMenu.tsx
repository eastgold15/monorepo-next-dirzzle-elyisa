"use client";
import type { SiteCategoryTreeRes } from "@/hooks/api/site-category-hook";
import { useNavAction } from "./hook/useNavAction";
import { NAV_STYLES, NavLink } from "./NavParts";

interface MobileMenuProps {
  categories: SiteCategoryTreeRes[];
  onClose: () => void;
}

// 递归渲染移动端列表
const MobileCategoryItem = ({
  category,
  onClose,
  depth = 0,
}: {
  category: SiteCategoryTreeRes;
  onClose: () => void;
  depth?: number;
}) => {
  const { getCategoryHref, handleNavigate } = useNavAction();
  const href = getCategoryHref(category.id);
  const hasChildren = category.children && category.children.length > 0;

  // 根据深度选择样式
  const linkClass =
    depth === 0 ? NAV_STYLES.mobileLink : NAV_STYLES.mobileSubLink;

  return (
    <div className={depth === 0 ? "border-gray-100 border-b" : ""}>
      <NavLink
        className={linkClass}
        href={href}
        onClick={() => handleNavigate(href, onClose)}
      >
        {category.name}
      </NavLink>

      {/* 递归渲染子级 */}
      {hasChildren && (
        <div className="mb-2">
          {(category.children || []).map((child) => (
            <MobileCategoryItem
              category={child}
              depth={depth + 1}
              key={child.id}
              onClose={onClose}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const MobileMenu = ({ categories, onClose }: MobileMenuProps) => (
  <div className="flex flex-col">
    {categories.map((cat) => (
      <MobileCategoryItem category={cat} key={cat.id} onClose={onClose} />
    ))}
  </div>
);
