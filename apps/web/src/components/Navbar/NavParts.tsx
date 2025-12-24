import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils"; // 假设你有 cn 工具，没有可用 clsx 或模板字符串

// 统一的样式常量
export const NAV_STYLES = {
  desktopLink:
    "flex items-center gap-1 font-medium text-[10px] lg:text-[11px] uppercase tracking-[0.15em] transition-colors hover:text-gray-500",
  mobileLink: "block w-full py-3 text-left font-serif text-lg text-black",
  mobileSubLink:
    "block w-full py-2 text-left font-sans text-md text-gray-600 pl-4",
  dropdownItem:
    "block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors",
};

interface BaseLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isActive?: boolean; // 用于未来扩展高亮状态
}

/**
 * 基础导航链接 - 封装了 Next/Link 和 点击处理
 */
export const NavLink = ({
  href,
  children,
  className,
  onClick,
}: BaseLinkProps) => (
  <Link className={className} href={href} onClick={onClick}>
    {children}
  </Link>
);

/**
 * 下拉箭头指示器
 */
export const DropdownIndicator = ({ isOpen }: { isOpen: boolean }) => (
  <ChevronDown
    className={cn(
      "h-3 w-3 transition-transform duration-200",
      isOpen && "rotate-180"
    )}
  />
);
