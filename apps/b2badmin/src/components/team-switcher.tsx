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
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useSiteStore } from "@/stores/site-store";
import { useUserInfo } from "@/stores/user-store";

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const { getUserRoleDisplay } = usePermissions();

  // 获取用户和站点信息
  const { user } = useAuthStore();
  const userInfo = useUserInfo();
  const { setCurrentSiteId } = useSiteStore();

  // 当前站点和角色
  const currentSite = user?.site;
  const currentRole = user?.role?.name;
  const accessibleSites = userInfo?.allSites || [];

  // 状态管理
  const [isSwitching, setIsSwitching] = useState<string | null>(null);

  // 处理站点切换
  const handleSwitchSite = (siteId: string) => {
    if (!currentSite || siteId === currentSite?.id) return;

    setIsSwitching(siteId);
    try {
      // 直接设置站点ID，权限通过 header 的 x-site-id 自动处理
      setCurrentSiteId(siteId);

      // 刷新页面以应用新的站点上下文
      window.location.reload();
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
    // 对于可访问站点列表中的站点
    if (site.site) {
      return site.site.name || "未知站点";
    }
    // 对于当前站点
    if (site.name) {
      return site.name;
    }
    // 兼容旧的数据结构
    if (site.factory) {
      return site.factory.name;
    }
    if (site.exporter) {
      return site.exporter.name;
    }
    return "未知站点";
  };

  // 获取站点类型图标
  const getSiteIcon = (site: any) => {
    // 对于当前站点
    if (site.siteType === "factory") {
      return Factory;
    }
    // 对于可访问站点列表中的站点
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
    // 对于当前站点，可能需要从其他字段获取
    if (site.id) {
      return site.id;
    }
    // 对于可访问站点列表中的站点
    if (site.site?.id) {
      return site.site.id;
    }
    // 兼容旧的数据结构
    if (site.factory) {
      return site.factory.code;
    }
    if (site.exporter) {
      return site.exporter.code;
    }
    return "";
  };

  // 如果当前站点还未加载，显示加载状态
  if (!currentSite) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton disabled size="lg">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
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
                  {getUserRoleDisplay()} · {getSiteCode(currentSite)}
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
                  {currentRole || "salesperson"} · {getSiteCode(currentSite)}
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
                  .filter((site) => {
                    const siteId = site.site?.id || site.id;
                    return siteId !== currentSite?.id;
                  })
                  .map((site) => {
                    const siteId = site.site?.id || site.id;
                    const isCurrentlySwitching = isSwitching === siteId;
                    const Icon = getSiteIcon(site);

                    return (
                      <DropdownMenuItem
                        className="cursor-pointer gap-2 p-3 transition-colors hover:bg-muted/50"
                        disabled={isCurrentlySwitching}
                        key={siteId}
                        onClick={() => handleSwitchSite(siteId)}
                      >
                        <div className="flex size-6 items-center justify-center rounded-md border">
                          <Icon className="size-3.5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {getSiteDisplayName(site)}
                            </p>
                            {(site.site?.siteType === "factory" ||
                              site.siteType === "factory") && (
                              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-blue-800 text-xs">
                                工厂
                              </span>
                            )}
                            {(site.site?.siteType === "exporter" ||
                              site.siteType === "exporter") && (
                              <span className="rounded bg-green-100 px-1.5 py-0.5 text-green-800 text-xs">
                                出口商
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground text-xs">
                            {site.role?.name || currentRole} ·{" "}
                            {getSiteCode(site)}
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
