import type { CategoryTModel } from "@repo/contract/typebox";

/**
 * 分类节点类型，包含树形结构的子分类
 */
export type CategoryNode = CategoryTModel["TreeEntity"];

/**
 * 分类链接属性
 */
export interface CategoryLinkProps {
  category: CategoryNode;
  onNavigate?: (slug: string, id: string) => void;
  className?: string;
  isSubcategory?: boolean;
}

/**
 * 下拉菜单组件属性
 */
export interface NavDropdownProps {
  category: CategoryNode;
  onNavigate?: (slug: string, id: string) => void;
  className?: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

/**
 * 硬编码的默认导航链接，作为分类数据的兜底
 */
export const DEFAULT_NAV_LINKS = [
  "NEW",
  "PUMPS",
  "SANDALS",
  "BOOTS",
  "PLATFORMS",
  "FLATS",
  "BRIDAL",
  "BAGS",
  "GINA WORLD",
] as const;

export type DefaultNavLink = (typeof DEFAULT_NAV_LINKS)[number];
