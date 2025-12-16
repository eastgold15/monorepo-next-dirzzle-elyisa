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

import {
  useCurrentRole,
  useCurrentSite,
  useIsExporterAdmin,
  useIsExporterSite,
  useIsFactoryAdmin,
  useIsFactorySite,
  useIsSalesperson,
  useIsSuperAdmin,
} from "@/stores/site-store";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // 站点和角色相关的hooks
  const currentSite = useCurrentSite();
  const currentRole = useCurrentRole();
  const isSuperAdmin = useIsSuperAdmin();
  const isExporterAdmin = useIsExporterAdmin();
  const isFactoryAdmin = useIsFactoryAdmin();
  const isSalesperson = useIsSalesperson();
  const isExporterSite = useIsExporterSite();
  const isFactorySite = useIsFactorySite();

  // Dashboard - 始终显示在最前面
  const getDashboardItems = () => [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
    },
  ];

  // 业务管理相关菜单 - 根据站点类型和角色动态显示
  const getBusinessItems = () => {
    const items = [];

    // 基础菜单项 - 所有角色都可以访问
    items.push(
      {
        title: "Products",
        url: "/dashboard/products",
        icon: ShoppingBag,
      },
      {
        title: "Categories",
        url: "/dashboard/categories",
        icon: Tags,
      }
    );

    // Media Library - 所有角色都可以访问
    items.push({
      title: "Media Library",
      url: "/dashboard/media",
      icon: Image,
    });

    // Templates - 管理员可以访问
    if (isSuperAdmin || isExporterAdmin || isFactoryAdmin) {
      items.push({
        title: "Templates",
        url: "/dashboard/templates",
        icon: FileBox,
      });
    }

    // Advertisements - 出口商站点或超级管理员可以访问
    if (isExporterSite || isSuperAdmin) {
      items.push({
        title: "Advertisements",
        url: "/dashboard/ads",
        icon: PieChart,
      });
    }

    // Hero Cards - 管理员可以访问
    if (isSuperAdmin || isExporterAdmin || isFactoryAdmin) {
      items.push({
        title: "Hero Cards",
        url: "/dashboard/hero-cards",
        icon: Frame,
      });
    }

    return items;
  };

  // 站点管理相关菜单 - 根据站点类型显示
  const getSiteItems = () => {
    const items = [];

    // Site Management - 超级管理员和出口商管理员可以访问
    if (isSuperAdmin || (isExporterSite && isExporterAdmin)) {
      items.push({
        title: "Site Config",
        url: "/dashboard/site-config",
        icon: Settings,
      });
    }

    // Site Categories - 管理员可以访问
    if (isSuperAdmin || isExporterAdmin || isFactoryAdmin) {
      items.push({
        title: "Site Categories",
        url: "/dashboard/site-categories",
        icon: Layers,
      });
    }

    return items;
  };

  // 组织管理相关菜单
  const getOrganizationItems = () => {
    const items = [];

    // Factories - 超级管理员、出口商管理员、出口商站点可以访问
    if (isSuperAdmin || isExporterAdmin || isExporterSite) {
      items.push({
        title: "Factories",
        url: "/dashboard/factories",
        icon: Building2,
      });
    }

    // Users - 超级管理员和出口商管理员可以访问
    if (isSuperAdmin || isExporterAdmin) {
      items.push({
        title: "Users",
        url: "/dashboard/users",
        icon: Users,
      });
    }

    return items;
  };

  // 分析和报告相关菜单
  const getAnalyticsItems = () => {
    const items = [];

    // Analytics - 管理员可以访问
    if (isSuperAdmin || isExporterAdmin || isFactoryAdmin) {
      items.push({
        title: "Analytics",
        url: "/dashboard/analytics",
        icon: BarChart3,
      });
    }

    // Product Statistics - 超级管理员和管理员可以访问
    if (isSuperAdmin || isExporterAdmin || isFactoryAdmin) {
      items.push({
        title: "Product Statistics",
        url: "/dashboard/product-statistics",
        icon: ShieldCheck,
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
        <NavGroup items={getDashboardItems()} title="概览" />
        <NavGroup items={getBusinessItems()} title="业务管理" />
        <NavGroup items={getSiteItems()} title="站点管理" />
        <NavGroup items={getOrganizationItems()} title="组织管理" />
        <NavGroup items={getAnalyticsItems()} title="数据分析" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
