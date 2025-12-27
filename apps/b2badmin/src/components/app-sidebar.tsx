"use client";

import {
  Building2,
  FileBox,
  Frame,
  Image as ImageIcon,
  Key,
  Layers,
  type LucideIcon,
  Package,
  PieChart,
  Settings,
  Shield,
  ShoppingBag,
  SquareTerminal,
  Tags,
  UserCog,
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
import { PERMISSIONS, type PermissionType } from "@/types/permission";

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
        title: "站点分类",
        url: "/dashboard/site-categories",
        icon: Tags,
        permission: PERMISSIONS.SITE_CATEGORIES_VIEW,
      },

      {
        title: "商品模版管理",
        url: "/dashboard/templates",
        icon: FileBox,
        permission: PERMISSIONS.PRODUCT_TEMPLATE_TABLE_VIEW,
      },

      {
        title: "媒体管理",
        url: "/dashboard/media",
        icon: ImageIcon,
        permission: PERMISSIONS.MEDIA_VIEW,
      },
      {
        title: "商品管理",
        url: "/dashboard/products",
        icon: ShoppingBag,
        permission: PERMISSIONS.PRODUCTS_TABLE_VIEW,
      },
      {
        title: "SKU管理",
        url: "/dashboard/sku",
        icon: Package,
        permission: PERMISSIONS.SKUS_TABLE_VIEW,
      },
    ],
  },
  {
    title: "站点管理",
    items: [
      {
        title: "广告管理",
        url: "/dashboard/ads",
        icon: PieChart,
        permission: PERMISSIONS.ADVERTISEMENTS_VIEW,
      },
      {
        title: "爆款商品卡片",
        url: "/dashboard/hero-cards",
        icon: Frame,
        permission: PERMISSIONS.HERO_CARDS_VIEW,
      },
      {
        title: "站点配置",
        url: "/dashboard/site-config",
        icon: Settings,
        permission: PERMISSIONS.SITE_CONFIG_VIEW,
      },
    ],
  },
  {
    title: "组织管理",
    items: [
      {
        title: "工厂管理",
        url: "/dashboard/factories",
        icon: Building2,
        permission: PERMISSIONS.FACTORIES_VIEW,
      },
      {
        title: "用户管理",
        url: "/dashboard/users",
        icon: Users,
        permission: PERMISSIONS.USERS_VIEW,
      },
      {
        title: "全局分类",
        url: "/dashboard/master-categories",
        icon: Layers,
        permission: PERMISSIONS.MASTER_CATEGORIES_VIEW,
      },
    ],
  },
  // {
  //   title: "数据分析",
  //   items: [
  //     {
  //       title: "Analytics",
  //       url: "/dashboard/analytics",
  //       icon: BarChart3,
  //       permission: PERMISSIONS.DAILY_INQUIRY_COUNTER_VIEW,
  //     },
  //     {
  //       title: "Product Statistics",
  //       url: "/dashboard/product-statistics",
  //       icon: ShieldCheck,
  //       permission: "PRODUCTS_TABLE_VIEW",
  //     },
  //   ],
  // },
  {
    title: "权限管理",
    items: [
      {
        title: "角色管理",
        url: "/dashboard/roles",
        icon: Shield,
        permission: PERMISSIONS.ROLES_VIEW,
      },
      {
        title: "权限管理",
        url: "/dashboard/permissions",
        icon: Key,
        permission: PERMISSIONS.PERMISSIONS_VIEW,
      },
      {
        title: "用户角色",
        url: "/dashboard/user-roles",
        icon: UserCog,
        permission: PERMISSIONS.ROLES_VIEW,
      },
    ],
  },
];

// --- 2. 主组件 ---
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // 正确的方式：分别订阅每个值
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const permissions = useAuthStore((state) => state.permissions);
  const isSuperAdmin = useAuthStore((state) => state.isSuperAdmin);

  // 核心逻辑：根据权限过滤菜单
  // 使用 useMemo 只有在权限改变时才重新计算，性能拉满
  const filteredNav = React.useMemo(() => {
    // 🛡️ 保护伞：如果权限数据还没回来，直接返回空或基础菜单
    // 假设你的 permissions 初始值是 null 或你有一个专门的 isLoading 标志
    if (!(permissions || isSuperAdmin)) {
      return [];
    }

    return SIDEBAR_CONFIG.map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (isSuperAdmin) return true; // 超管无视一切
        if (!item.permission) return true;

        return hasPermission(item.permission);
      }),
    })).filter((section) => section.items.length > 0);

    // 确保 isLoading 或 permissions 在依赖项里
  }, [permissions, isSuperAdmin, hasPermission]);
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
