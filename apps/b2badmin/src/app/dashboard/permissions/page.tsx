"use client";

import { Key } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { CreatePermissionModal } from "@/components/form/CreatePermissionModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  usePermissionCreate,
  usePermissionDelete,
  usePermissionsList,
} from "@/hooks/api/permission";
import { useAuthStore } from "@/stores/auth-store";

// 权限分组
const PERMISSION_GROUPS = {
  USER: "用户管理",
  PRODUCT: "商品管理",
  SKU: "SKU管理",
  ORDER: "订单管理",
  SITE: "站点管理",
  MEDIA: "媒体管理",
  ADVERTISEMENT: "广告管理",
  FACTORY: "工厂管理",
  EXPORTER: "出口商管理",
  SYSTEM: "系统管理",
};

// 权限操作分组
const PERMISSION_ACTIONS = {
  VIEW: "查看",
  CREATE: "创建",
  EDIT: "编辑",
  DELETE: "删除",
  MANAGE: "管理",
};

// 解析权限名称
function parsePermissionName(name: string): { group: string; action: string } {
  // 格式: PRODUCT_VIEW, PRODUCT_CREATE, USER_MANAGE 等
  const parts = name.split("_");
  if (parts.length >= 2) {
    const group = parts.slice(0, -1).join("_");
    const action = parts.at(-1) || "";
    return { group, action };
  }
  return { group: name, action: "" };
}

// 获取权限分组显示名称
function getGroupDisplayName(group: string): string {
  return PERMISSION_GROUPS[group as keyof typeof PERMISSION_GROUPS] || group;
}

// 获取权限操作显示名称
function getActionDisplayName(action: string): string {
  return (
    PERMISSION_ACTIONS[action as keyof typeof PERMISSION_ACTIONS] || action
  );
}

// 权限操作徽章
function PermissionActionBadge({ action }: { action: string }) {
  const colorMap: Record<string, string> = {
    VIEW: "bg-green-100 text-green-700",
    CREATE: "bg-blue-100 text-blue-700",
    EDIT: "bg-amber-100 text-amber-700",
    DELETE: "bg-red-100 text-red-700",
    MANAGE: "bg-purple-100 text-purple-700",
  };

  const className = colorMap[action] || "bg-gray-100 text-gray-700";

  return <Badge className={className}>{getActionDisplayName(action)}</Badge>;
}

export default function PermissionsPage() {
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = user?.isSuperAdmin;
  const { data: permissionsData, isLoading, refetch } = usePermissionsList();
  const createMutation = usePermissionCreate();
  const deleteMutation = usePermissionDelete();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 权限检查：只有超级管理员才能访问
  if (!isSuperAdmin) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <h2 className="mb-2 font-bold text-2xl text-slate-900">
                权限不足
              </h2>
              <p className="text-slate-500">只有超级管理员才能访问权限管理</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const filteredPermissions =
    permissionsData?.filter(
      (permission: any) =>
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // 按分组组织权限
  const groupedPermissions: Record<string, any[]> = {};
  filteredPermissions.forEach((permission: any) => {
    const { group } = parsePermissionName(permission.name);
    if (!groupedPermissions[group]) {
      groupedPermissions[group] = [];
    }
    groupedPermissions[group].push(permission);
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("权限删除成功");
      refetch();
    } catch (error) {
      toast.error("权限删除失败");
    }
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
              <p className="mt-2 text-slate-500">加载中...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator className="mr-2 h-4" orientation="vertical" />
            <nav className="font-medium text-sm">权限管理</nav>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          {/* 页面头部 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-3xl text-slate-900">权限管理</h1>
              <p className="mt-2 text-slate-600">
                管理系统权限，配置角色权限，控制用户访问权限。
              </p>
            </div>

            <Button
              className="bg-indigo-600 text-white hover:bg-indigo-700"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Key className="mr-2 h-4 w-4" />
              添加权限
            </Button>
          </div>

          {/* 搜索栏 */}
          <Card>
            <CardHeader>
              <CardTitle>搜索权限</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索权限名称或描述..."
                value={searchTerm}
              />
            </CardContent>
          </Card>

          {/* 权限列表 */}
          {Object.keys(groupedPermissions).length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="mx-auto mb-4 h-12 w-12 text-slate-300">
                  <Key />
                </div>
                <h3 className="mb-2 font-semibold text-slate-900 text-xl">
                  {searchTerm ? "未找到匹配的权限" : "暂无权限"}
                </h3>
                <p className="mx-auto mb-6 max-w-md text-slate-500">
                  {searchTerm
                    ? "请尝试其他搜索关键词"
                    : "创建第一个权限来开始构建权限体系"}
                </p>
                {!searchTerm && (
                  <Button
                    className="bg-indigo-600 text-white hover:bg-indigo-700"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <Key className="mr-2 h-4 w-4" />
                    创建权限
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(
                ([group, permissions]) => (
                  <Card key={group}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {getGroupDisplayName(group)}
                        <Badge className="ml-2" variant="secondary">
                          {permissions.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {permissions.map((permission: any) => {
                          const { group, action } = parsePermissionName(
                            permission.name
                          );
                          return (
                            <div
                              className="group flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                              key={permission.id}
                            >
                              <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                                  <Key className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium font-mono text-slate-900">
                                      {permission.name}
                                    </span>
                                    <PermissionActionBadge action={action} />
                                  </div>
                                  {permission.description && (
                                    <p className="text-slate-500 text-sm">
                                      {permission.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    className="opacity-0 transition-opacity group-hover:opacity-100"
                                    size="sm"
                                    variant="outline"
                                  >
                                    删除
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      确认删除
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      确定要删除权限 "{permission.name}"
                                      吗？此操作不可撤销。
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>取消</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDelete(permission.id)
                                      }
                                    >
                                      删除
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          )}
        </div>
      </SidebarInset>

      {/* 创建权限对话框 */}
      <CreatePermissionModal
        onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) {
            refetch();
          }
        }}
        onSuccess={() => {
          refetch();
        }}
        open={isCreateModalOpen}
      />
    </SidebarProvider>
  );
}
