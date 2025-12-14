"use client";

import {
  BarChart3,
  Building2,
  FileBox,
  Frame,
  Image,
  // biome-ignore lint/suspicious/noShadowRestrictedNames: Map is a valid name in this context
  Map,
  PieChart,
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
import { usePermissions } from "@/hooks/api/user";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { role } = usePermissions();

  // Dashboard - 始终显示在最前面
  const getDashboardItems = () => [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
    },
  ];

  // 业务管理相关菜单
  const getBusinessItems = () => {
    const items = [
      {
        title: "Products",
        url: "/dashboard/products",
        icon: ShoppingBag,
      },
      {
        title: "Categories",
        url: "/dashboard/categories",
        icon: Tags,
      },
      {
        title: "Media Library",
        url: "/dashboard/media",
        icon: Image,
      },
      {
        title: "Templates",
        url: "/dashboard/templates",
        icon: FileBox,
      },
    ];

    // Advertisements - 出口商管理员可以访问
    if (role === "exporter_admin") {
      items.push({
        title: "Advertisements",
        url: "/dashboard/ads",
        icon: PieChart,
      });
    }

    // Hero Cards - 所有角色都可以访问
    items.push({
      title: "Hero Cards",
      url: "/dashboard/hero-cards",
      icon: Frame,
    });

    return items;
  };

  // 系统管理相关菜单
  const getSystemItems = () => {
    const items = [];

    // Site Config - 出口商管理员可以访问
    if (role === "exporter_admin") {
      items.push({
        title: "Site Config",
        url: "/dashboard/site-config",
        icon: Map,
      });
    }

    return items;
  };

  // 审计管理相关菜单
  const getAuditItems = () => {
    const items = [];

    // Factories - 出口商管理员和工厂管理员可以访问
    if (role === "exporter_admin" || role === "factory_admin") {
      items.push({
        title: "Factories",
        url: "/dashboard/factories",
        icon: Building2,
      });
    }

    // Users - 出口商管理员可以访问
    if (role === "exporter_admin") {
      items.push({
        title: "Users",
        url: "/dashboard/users",
        icon: Users,
      });
    }

    // Analytics - 管理员可以访问
    if (role === "exporter_admin" || role === "factory_admin") {
      items.push({
        title: "Analytics",
        url: "/dashboard/analytics",
        icon: BarChart3,
      });
    }

    return items;
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavGroup items={getDashboardItems()} title="Overview" />
        <NavGroup items={getBusinessItems()} title="业务管理" />
        <NavGroup items={getSystemItems()} title="系统管理" />
        <NavGroup items={getAuditItems()} title="审计管理" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
