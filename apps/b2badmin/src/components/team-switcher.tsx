"use client";

import { Building2, ChevronDown, Factory } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useOrganization, usePermissions } from "@/hooks/api/user";

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const { role, getRoleDisplayName } = usePermissions();
  const organization = useOrganization();

  const exporter = organization.getExporter();
  const factories = organization.getAccessibleFactories();

  if (!exporter) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              size="lg"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Building2 className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{exporter.name}</span>
                <span className="truncate text-xs">
                  {getRoleDisplayName(role || "salesperson")}
                </span>
              </div>
              <ChevronDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="font-semibold text-muted-foreground text-xs">
              组织架构
            </DropdownMenuLabel>

            {/* 出口商信息 */}
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border">
                <Building2 className="size-3.5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{exporter.name}</p>
                <p className="text-muted-foreground text-xs">
                  代码: {exporter.code}
                </p>
              </div>
            </DropdownMenuItem>

            {/* 工厂列表 */}
            {factories.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="font-semibold text-muted-foreground text-xs">
                  工厂 ({factories.length})
                </DropdownMenuLabel>
                {factories.map((factory) => (
                  <DropdownMenuItem className="gap-2 p-2" key={factory.id}>
                    <div className="flex size-6 items-center justify-center rounded-md border">
                      <Factory className="size-3.5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{factory.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {factory.code} · {factory.isActive ? "活跃" : "未激活"}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2 text-muted-foreground text-xs">
              管理范围: {organization.getManageScope()}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
