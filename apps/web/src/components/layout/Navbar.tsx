"use client";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import Link from "next/link"; // 核心：所有跳转依赖Link组件
import { useRouter } from "next/navigation"; // 添加 useRouter hook
import type React from "react";
import { useEffect, useState } from "react";
import { CategoryNav, MobileCategoryNav } from "@/components/layout/Head";

// 统一样式管理
const styles = {
  navIcon: "text-black transition-colors hover:text-gray-500",
  icon: "h-4 w-4 md:h-5 md:w-5",
  uppercase: "uppercase tracking-wider",
  mobileLink: "block py-2 text-sm uppercase tracking-wider hover:text-gray-500",
  badge:
    "-top-1 -right-1 absolute flex h-3 w-3 items-center justify-center rounded-full bg-black text-[9px] text-white",
} as const;

// 导航逻辑 Hook
const useNavigation = () => {
  const navigateWithScroll = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigateAndCloseMobile = (closeMobile: () => void) => {
    closeMobile();
    navigateWithScroll();
  };

  return { navigateWithScroll, navigateAndCloseMobile };
};

// NavIcon 组件
interface NavIconProps {
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  onClick?: () => void;
  className?: string;
  showOnMobile?: boolean;
  badgeCount?: number;
}

const NavIcon: React.FC<NavIconProps> = ({
  href,
  icon: Icon,
  onClick,
  className = "",
  showOnMobile = true,
  badgeCount,
  ...props
}) => (
  <Link
    className={`${showOnMobile ? "" : "hidden md:block"} relative ${styles.navIcon} ${className}`}
    href={href}
    onClick={onClick}
    {...props}
  >
    <Icon className={styles.icon} strokeWidth={1.5} />
    {badgeCount !== undefined && (
      <span className={styles.badge}>{badgeCount}</span>
    )}
  </Link>
);

// MobileNavLink 组件
interface MobileNavLinkProps {
  href: string;
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({
  href,
  children,
  onClose,
  className = "",
}) => (
  <Link
    className={`${styles.mobileLink} ${className}`}
    href={href}
    onClick={() => {
      onClose();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }}
  >
    {children}
  </Link>
);

const Navbar: React.FC = () => {
  const router = useRouter(); // 添加 router 实例
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { navigateWithScroll } = useNavigation();

  // 确保组件已挂载，避免水合不匹配
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 导航项配置
  const navItems = [
    { href: "/wishlist", icon: Heart, showOnMobile: false },
    { href: "/account", icon: User, showOnMobile: false },
    { href: "/cart", icon: ShoppingBag, badgeCount: 0 },
  ] as const;

  // 移动端菜单项配置
  const mobileMenuItems = [
    { href: "/account", label: "Account" },
    { href: "/wishlist", label: "Wishlist" },
    { href: "/language/en", label: "Language: EN" },
  ] as const;

  return (
    <nav
      className={`fixed top-0 left-0 z-50 w-full bg-white transition-all duration-300 ${
        isMounted && isScrolled ? "pb-2 shadow-sm" : "pb-4"
      }`}
    >
      <div className="max-w-full px-4 md:px-8 lg:px-12">
        {/* Top Row: Lang, Logo, Icons */}
        <div className="flex h-16 items-center justify-between border-transparent border-b md:h-20">
          {/* Left - Language / Mobile Toggle */}
          <div className="flex w-1/4 items-center">
            <button
              className="mr-4 md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            {/* 语言切换：纯Link组件，SEO友好 */}
            <Link
              className="hidden items-center font-bold text-[10px] uppercase tracking-widest transition-colors hover:text-gray-500 md:flex"
              href="/language/en"
              onClick={navigateWithScroll}
            >
              EN <span className="ml-1 text-[8px]">▼</span>
            </Link>
          </div>

          {/* Center - Logo：核心SEO优化，Link直接指向首页 */}
          <div className="flex w-1/2 justify-center">
            <Link
              className="text-center font-serif text-3xl text-black tracking-widest md:text-5xl"
              href="/"
              onClick={navigateWithScroll}
            >
              GINA
            </Link>
          </div>

          {/* Right - Icons：使用重构后的NavIcon组件 */}
          <div className="flex w-1/4 items-center justify-end space-x-4 md:space-x-6">
            {/* 搜索按钮（无跳转，仅交互） */}
            <button className={styles.navIcon}>
              <Search className={styles.icon} strokeWidth={1.5} />
            </button>

            {/* 导航图标：使用配置数据映射 */}
            {navItems.map((item) => (
              <NavIcon
                href={item.href}
                icon={item.icon}
                key={item.href}
                onClick={navigateWithScroll}
                // showOnMobile={item.showOnMobile}
                // badgeCount={item.badgeCount}
              />
            ))}
          </div>
        </div>

        {/* Bottom Row - Desktop分类导航：使用 Next.js 路由跳转，SEO友好 */}
        <div className="hidden items-center justify-center py-3 md:flex">
          <CategoryNav
            className="px-4 py-1 text-sm uppercase tracking-wider hover:text-gray-500"
            onNavigate={(slug: string, id: string) => {
              // 使用 Next.js 路由进行跳转，保持SEO友好
              router.push(`/category/${slug}?id=${id}`);
              navigateWithScroll();
            }}
          />
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed top-16 left-0 z-40 flex h-[calc(100vh-64px)] w-full flex-col overflow-y-auto bg-white p-8 md:hidden">
          {/* 移动端分类导航：使用 Next.js 路由跳转，SEO友好 */}
          <MobileCategoryNav
            onClose={() => setIsMobileMenuOpen(false)}
            onNavigate={(slug: string, id) => {
              // 使用 Next.js 路由进行跳转，保持SEO友好
              router.push(`/category/${slug}?id=${id}`);
              setIsMobileMenuOpen(false);
              navigateWithScroll();
            }}
          />

          {/* 移动端其他链接：使用配置数据映射 */}
          <div className="space-y-4 pt-8 font-bold text-xs uppercase tracking-widest">
            {mobileMenuItems.map((item) => (
              <MobileNavLink
                href={item.href}
                key={item.href}
                onClose={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </MobileNavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
