"use client";

import { Building2, Check, ChevronDown, Factory, Loader2 } from "lucide-react";
import { useState } from "react";

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
import {
  useAccessibleSites,
  useCurrentRole,
  useCurrentSite,
  useIsSuperAdmin,
  useUserStore,
} from "@/stores/user-store";
import { useRoleDisplayName } from "@/hooks/useRoleDisplayName";

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const getRoleDisplayName = useRoleDisplayName();

  // 站点相关hooks
  const currentSite = useCurrentSite();
  const accessibleSites = useAccessibleSites();
  const { switchSite } = useUserStore();
  const currentRole = useCurrentRole();
  const isSuperAdmin = useIsSuperAdmin();

  // 状态管理
  const [isSwitching, setIsSwitching] = useState<string | null>(null);

  // 处理站点切换
  const handleSwitchSite = async (siteId: string) => {
    if (!currentSite || siteId === currentSite.site.id) return;

    setIsSwitching(siteId);
    try {
      const success = await switchSite(siteId);
      if (success) {
        // 切换成功后可以添加一些反馈，比如显示成功提示
        console.log("站点切换成功");
      }
    } catch (error) {
      console.error("站点切换失败:", error);
      // 可以添加错误提示
    } finally {
      setIsSwitching(null);
    }
  };

  // 如果没有当前站点，显示加载状态
  if (!currentSite) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton disabled size="lg">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted">
              <Loader2 className="size-4 animate-spin" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">加载中...</span>
              <span className="truncate text-xs">正在获取站点信息</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // 获取站点显示名称
  const getSiteDisplayName = (site: any) => {
    // 根据新的数据结构，站点信息在 site.site 中
    if (site.site) {
      return site.site.name || "未知站点";
    }
    // 兼容旧的数据结构
    if (site.factory) {
      return site.factory.name;
    }
    if (site.exporter) {
      return site.exporter.name;
    }
    return site.name || "未知站点";
  };

  // 获取站点类型图标
  const getSiteIcon = (site: any) => {
    // 根据新的数据结构
    if (site.site?.siteType === "factory") {
      return Factory;
    }
    // 兼容旧的数据结构
    if (site.factory) {
      return Factory;
    }
    return Building2;
  };

  // 获取站点代码
  const getSiteCode = (site: any) => {
    // 根据新的数据结构，使用域名作为代码
    if (site.site?.domain) {
      return site.site.domain;
    }
    // 兼容旧的数据结构
    if (site.factory) {
      return site.factory.code;
    }
    if (site.exporter) {
      return site.exporter.code;
    }
    return site.domain || "";
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className={cn(
                "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
                "transition-all duration-200"
              )}
              size="lg"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {(() => {
                  const Icon = getSiteIcon(currentSite);
                  return <Icon className="size-4" />;
                })()}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {getSiteDisplayName(currentSite)}
                </span>
                <span className="truncate text-xs">
                  {getRoleDisplayName(currentRole || "salesperson")} ·{" "}
                  {getSiteCode(currentSite)}
                </span>
              </div>
              <ChevronDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[--radix-dropdown-menu-trigger-width] min-w-80 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="font-semibold text-muted-foreground text-xs">
              可访问站点
            </DropdownMenuLabel>

            {/* 当前站点（高亮显示） */}
            <DropdownMenuItem className="gap-2 bg-muted/50 p-3" disabled>
              <div className="flex size-6 items-center justify-center rounded-md border bg-primary text-primary-foreground">
                {(() => {
                  const Icon = getSiteIcon(currentSite);
                  return <Icon className="size-3.5" />;
                })()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {getSiteDisplayName(currentSite)}
                  </p>
                  <span className="rounded bg-primary px-1.5 py-0.5 text-primary-foreground text-xs">
                    当前
                  </span>
                </div>
                <p className="text-muted-foreground text-xs">
                  {currentSite.role.name} · {getSiteCode(currentSite)}
                </p>
              </div>
              <Check className="size-4 text-primary" />
            </DropdownMenuItem>

            {/* 其他可切换的站点 */}
            {accessibleSites.length > 1 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="font-semibold text-muted-foreground text-xs">
                  切换站点 ({accessibleSites.length - 1})
                </DropdownMenuLabel>
                {accessibleSites
                  .filter((site) => site.site.id !== currentSite.site.id)
                  .map((site) => {
                    const isCurrentlySwitching = isSwitching === site.site.id;
                    const Icon = getSiteIcon(site);

                    return (
                      <DropdownMenuItem
                        className="cursor-pointer gap-2 p-3 transition-colors hover:bg-muted/50"
                        disabled={isCurrentlySwitching}
                        key={site.site.id}
                        onClick={() => handleSwitchSite(site.site.id)}
                      >
                        <div className="flex size-6 items-center justify-center rounded-md border">
                          <Icon className="size-3.5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {getSiteDisplayName(site)}
                            </p>
                            {site.site.siteType === "factory" && (
                              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-blue-800 text-xs">
                                工厂
                              </span>
                            )}
                            {site.site.siteType === "exporter" && (
                              <span className="rounded bg-green-100 px-1.5 py-0.5 text-green-800 text-xs">
                                出口商
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground text-xs">
                            {site.role.name} · {getSiteCode(site)}
                          </p>
                        </div>
                        {isCurrentlySwitching && (
                          <Loader2 className="size-4 animate-spin text-muted-foreground" />
                        )}
                      </DropdownMenuItem>
                    );
                  })}
              </>
            )}

            <DropdownMenuSeparator />

            {/* 底部信息 */}
            <div className="p-2">
              <div className="space-y-1 text-muted-foreground text-xs">
                <p>• 超级管理员可切换所有站点</p>
                <p>• 普通用户只能切换有权限的站点</p>
                <p>• 切换站点后权限会相应变化</p>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
