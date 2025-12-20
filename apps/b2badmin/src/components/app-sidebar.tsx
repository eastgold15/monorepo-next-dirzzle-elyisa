"use client";

import {
  BarChart3,
  Building2,
  FileBox,
  Frame,
  Image,
  Layers,
  PieChart,
  Settings,
  ShieldCheck,
  ShoppingBag,
  SquareTerminal,
  Tags,
  Users,
} from "lucide-react";
import type * as React from "react";
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
import { PERMISSIONS } from "@/config/permissions";
import { usePermissions } from "@/hooks/usePermissions";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Dashboard - 始终显示在最前面
  const getDashboardItems = () => [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
    },
  ];

  // 业务管理相关菜单 - 根据权限动态生成
  const getBusinessItems = () => {
    const items = [];

    // 基础菜单项
    items.push({
      title: "Products",
      url: "/dashboard/products",
      icon: ShoppingBag,
      permission: PERMISSIONS.PRODUCT.READ,
    });

    items.push({
      title: "Site Categories",
      url: "/dashboard/site-categories",
      icon: Tags,
      permission: PERMISSIONS.SITE_CATEGORY.READ,
    });

    // Media Library
    items.push({
      title: "Media Library",
      url: "/dashboard/media",
      icon: Image,
      permission: PERMISSIONS.MEDIA.READ,
    });

    // Templates - 管理员权限
    items.push({
      title: "Templates",
      url: "/dashboard/templates",
      icon: FileBox,
      roles: ["super_admin", "exporter_admin", "factory_admin"],
    });

    // Advertisements - 出口商权限
    items.push({
      title: "Advertisements",
      url: "/dashboard/ads",
      icon: PieChart,
      roles: ["super_admin", "exporter_admin"],
    });

    // Hero Cards - 管理员权限
    items.push({
      title: "Hero Cards",
      url: "/dashboard/hero-cards",
      icon: Frame,
      roles: ["super_admin", "exporter_admin", "factory_admin"],
    });

    return items;
  };

  // 站点管理相关菜单
  const getSiteItems = () => {
    const items = [];

    items.push({
      title: "Site Config",
      url: "/dashboard/site-config",
      icon: Settings,
      roles: ["super_admin", "exporter_admin"],
    });

    items.push({
      title: "Master Categories",
      url: "/dashboard/master-categories",
      icon: Layers,
      roles: ["super_admin", "exporter_admin"],
    });

    return items;
  };

  // 组织管理相关菜单
  const getOrganizationItems = () => {
    const items = [];

    items.push({
      title: "Factories",
      url: "/dashboard/factories",
      icon: Building2,
      roles: ["super_admin", "exporter_admin"],
    });

    items.push({
      title: "Users",
      url: "/dashboard/users",
      icon: Users,
      roles: ["super_admin", "exporter_admin"],
    });

    return items;
  };

  // 分析和报告相关菜单
  const getAnalyticsItems = () => {
    const items = [];

    items.push({
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChart3,
      roles: ["super_admin", "exporter_admin", "factory_admin"],
    });

    items.push({
      title: "Product Statistics",
      url: "/dashboard/product-statistics",
      icon: ShieldCheck,
      roles: ["super_admin", "exporter_admin", "factory_admin"],
    });

    return items;
  };

  // 创建权限控制的 NavGroup 组件
  const PermissionNavGroup = ({
    title,
    items,
  }: {
    title: string;
    items: Array<{
      title: string;
      url: string;
      icon: any;
      isActive?: boolean;
      permission?: string;
      roles?: string[];
    }>;
  }) => {
    const { can, hasRole } = usePermissions();

    // 过滤出用户有权限的菜单项
    const filteredItems = items.filter((item) => {
      if (item.permission && !can(item.permission)) {
        return false;
      }
      if (item.roles && !hasRole(item.roles)) {
        return false;
      }
      return true;
    });

    // 如果没有权限访问的菜单项，不显示整个分组
    if (filteredItems.length === 0) {
      return null;
    }

    return <NavGroup items={filteredItems} title={title} />;
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavGroup items={getDashboardItems()} title="概览" />
        <PermissionNavGroup items={getBusinessItems()} title="业务管理" />
        <PermissionNavGroup items={getSiteItems()} title="站点管理" />
        <PermissionNavGroup items={getOrganizationItems()} title="组织管理" />
        <PermissionNavGroup items={getAnalyticsItems()} title="数据分析" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
