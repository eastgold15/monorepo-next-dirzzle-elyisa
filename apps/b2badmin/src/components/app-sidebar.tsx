"use client";

import {
  BarChart3,
  Building2,
  FileBox,
  Frame,
  Image as ImageIcon,
  Layers,
  type LucideIcon,
  PieChart,
  Settings,
  ShieldCheck,
  ShoppingBag,
  SquareTerminal,
  Tags,
  Users,
} from "lucide-react";
import * as React from "react";

import { NavGroup } from "@/components/nav-group";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/auth-store";
import type { PermissionType } from "@/types/permission";

// --- 1. 菜单配置文件 (数据驱动) ---
// 以后加菜单只需要改这里，一眼就能看懂
interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  permission?: PermissionType; // 使用我们之前生成的类型
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const SIDEBAR_CONFIG: NavSection[] = [
  {
    title: "概览",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: SquareTerminal,
        isActive: true,
      },
    ],
  },
  {
    title: "业务管理",
    items: [
      {
        title: "Products",
        url: "/dashboard/products",
        icon: ShoppingBag,
        permission: "PRODUCTS_TABLE_VIEW",
      },
      {
        title: "Site Categories",
        url: "/dashboard/site-categories",
        icon: Tags,
        permission: "SITE_CATEGORIES_VIEW",
      },
      {
        title: "Media Library",
        url: "/dashboard/media",
        icon: ImageIcon,
        permission: "MEDIA_VIEW",
      },
      {
        title: "Templates",
        url: "/dashboard/templates",
        icon: FileBox,
        permission: "PRODUCT_TEMPLATE_TABLE_VIEW",
      },
      {
        title: "Advertisements",
        url: "/dashboard/ads",
        icon: PieChart,
        permission: "ADVERTISEMENTS_VIEW",
      },
      {
        title: "Hero Cards",
        url: "/dashboard/hero-cards",
        icon: Frame,
        permission: "HERO_CARDS_VIEW",
      },
    ],
  },
  {
    title: "站点管理",
    items: [
      {
        title: "Site Config",
        url: "/dashboard/site-config",
        icon: Settings,
        permission: "SITE_CONFIG_VIEW",
      },
      {
        title: "Master Categories",
        url: "/dashboard/master-categories",
        icon: Layers,
        permission: "MASTER_CATEGORIES_VIEW",
      },
    ],
  },
  {
    title: "组织管理",
    items: [
      {
        title: "Factories",
        url: "/dashboard/factories",
        icon: Building2,
        permission: "FACTORIES_VIEW",
      },
      {
        title: "Users",
        url: "/dashboard/users",
        icon: Users,
        permission: "USERS_VIEW",
      },
    ],
  },
  {
    title: "数据分析",
    items: [
      {
        title: "Analytics",
        url: "/dashboard/analytics",
        icon: BarChart3,
        permission: "DAILY_INQUIRY_COUNTER_VIEW",
      },
      {
        title: "Product Statistics",
        url: "/dashboard/product-statistics",
        icon: ShieldCheck,
        permission: "PRODUCTS_TABLE_VIEW",
      },
    ],
  },
];

// --- 2. 主组件 ---
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const hasPermission = useAuthStore((state) => state.hasPermission);

  // 核心逻辑：根据权限过滤菜单
  // 使用 useMemo 只有在权限改变时才重新计算，性能拉满
  const filteredNav = React.useMemo(() => {
    return SIDEBAR_CONFIG.map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        // 如果没有设置 permission 要求，则所有人可见
        if (!item.permission) return true;
        // 否则检查权限
        return hasPermission(item.permission);
      }),
    })).filter((section) => section.items.length > 0); // 如果分组下没菜单了，直接隐藏整个分组
  }, [hasPermission]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>

      <SidebarContent>
        {filteredNav.map((section) => (
          <NavGroup
            items={section.items}
            key={section.title}
            title={section.title}
          />
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
