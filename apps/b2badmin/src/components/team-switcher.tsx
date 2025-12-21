"use client";

import { Building2, Check, ChevronDown, Factory, Loader2 } from "lucide-react";
import { useMemo } from "react";
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
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const { user, currentSite, allSites, switchSite } = useAuthStore();

  // 1. 过滤出除当前站点外的其他可访问站点
  const otherSites = useMemo(
    () => allSites.filter((s) => s.id !== currentSite?.id),
    [allSites, currentSite?.id]
  );

  // 2. 统一图标获取逻辑
  // biome-ignore lint/correctness/noNestedComponentDefinitions: <explanation>
  const SiteIcon = ({
    type,
    className,
  }: {
    type?: string;
    className?: string;
  }) => {
    const Icon = type === "factory" ? Factory : Building2;
    return <Icon className={cn("size-4", className)} />;
  };

  // 3. 加载中状态
  if (!(currentSite && user)) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton disabled size="lg">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted">
              <Loader2 className="size-4 animate-spin" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">加载中...</span>
              <span className="truncate text-xs">正在初始化站点...</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
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
                <SiteIcon type={currentSite.siteType} />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{currentSite.name}</span>
                <span className="truncate text-xs">
                  {user.role.description || user.role.name} ·{" "}
                  {currentSite.domain}
                </span>
              </div>
              <ChevronDown className="ml-auto opacity-50" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            className="w-[--radix-dropdown-menu-trigger-width] min-w-80 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              当前所在站点
            </DropdownMenuLabel>

            {/* 当前站点 */}
            <DropdownMenuItem className="gap-3 p-3 focus:bg-transparent">
              <div className="flex size-8 items-center justify-center rounded-md border bg-primary text-primary-foreground">
                <SiteIcon className="size-4" type={currentSite.siteType} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{currentSite.name}</span>
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.5 font-bold text-[10px] text-primary">
                    ACTIVE
                  </span>
                </div>
                <p className="text-muted-foreground text-xs">
                  {currentSite.domain}
                </p>
              </div>
              <Check className="size-4 text-primary" />
            </DropdownMenuItem>

            {otherSites.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-muted-foreground text-xs">
                  可切换站点 ({otherSites.length})
                </DropdownMenuLabel>
                {otherSites.map((site) => (
                  <DropdownMenuItem
                    className="cursor-pointer gap-3 p-3 grayscale-[0.5] transition-all hover:grayscale-0"
                    key={site.id}
                    onClick={() => switchSite(site.id)}
                  >
                    <div className="flex size-8 items-center justify-center rounded-md border bg-background">
                      <SiteIcon className="size-4" type={site.siteType} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-muted-foreground">
                          {site.name}
                        </span>
                        {site.siteType === "factory" ? (
                          <span className="rounded bg-blue-100 px-1 py-0.5 text-[10px] text-blue-700">
                            工厂
                          </span>
                        ) : (
                          <span className="rounded bg-green-100 px-1 py-0.5 text-[10px] text-green-700">
                            出口商
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground/60 text-xs">
                        {site.domain}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </>
            )}

            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <div className="rounded-md bg-muted/50 p-2 text-[11px] text-muted-foreground">
                <p className="mb-1 font-medium">💡 权限提示：</p>
                <ul className="list-inside list-disc space-y-0.5 opacity-80">
                  <li>超级管理员可管理所有站点</li>
                  <li>站点切换后权限将自动同步刷新</li>
                </ul>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
