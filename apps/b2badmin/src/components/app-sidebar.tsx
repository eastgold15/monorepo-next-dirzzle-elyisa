"use client";

import {
  BarChart3,
  Building2,
  FileBox,
  Frame,
  Image,
  // biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
  Map,
  PieChart,
  ShoppingBag,
  SquareTerminal,
  Tags,
  Users,
} from "lucide-react";
import type * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { usePermissions } from "@/hooks/use-permissions";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { role } = usePermissions();

  // 根据角色动态生成导航菜单
  const getNavMainItems = () => {
    const items = [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: SquareTerminal,
        isActive: true,
      },
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
    ];

    // 根据权限添加菜单项
    if (role === "exporter_admin" || role === "factory_admin") {
      items.push({
        title: "Factories",
        url: "/dashboard/factories",
        icon: Building2,
      });
    }

    items.push({
      title: "Templates",
      url: "/dashboard/templates",
      icon: FileBox,
    });

    items.push({
      title: "Media Library",
      url: "/dashboard/media",
      icon: Image,
    });

    if (role === "exporter_admin") {
      items.push({
        title: "Users",
        url: "/dashboard/users",
        icon: Users,
      });
    }

    return items;
  };

  const getProjectItems = () => {
    const items = [];

    // Hero Cards - 所有角色都可以访问
    items.push({
      name: "Hero Cards",
      url: "/dashboard/hero-cards",
      icon: Frame,
    });

    // Analytics - 管理员可以访问
    if (role === "exporter_admin" || role === "factory_admin") {
      items.push({
        name: "Analytics",
        url: "/dashboard/analytics",
        icon: BarChart3,
      });
    }

    // Advertisements - 出口商管理员可以访问
    if (role === "exporter_admin") {
      items.push({
        name: "Advertisements",
        url: "/dashboard/ads",
        icon: PieChart,
      });
    }

    // Site Config - 出口商管理员可以访问
    if (role === "exporter_admin") {
      items.push({
        name: "Site Config",
        url: "/dashboard/site-config",
        icon: Map,
      });
    }

    return items;
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={[]} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={getNavMainItems()} />
        <NavProjects projects={getProjectItems()} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
