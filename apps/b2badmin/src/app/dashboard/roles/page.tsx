"use client";

import { Shield } from "lucide-react";
import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { CreateRoleModal } from "@/components/form/CreateRoleModal";
import { EditRolePermissionsModal } from "@/components/form/EditRolePermissionsModal";
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
import { useRolesList } from "@/hooks/api/role";
import { useAuthStore } from "@/stores/auth-store";

// 角色类型组件
function RoleTypeBadge({ type }: { type: string }) {
  if (type === "system") {
    return <Badge className="bg-purple-100 text-purple-700">系统角色</Badge>;
  }
  return <Badge className="bg-blue-100 text-blue-700">自定义角色</Badge>;
}

export default function RolesPage() {
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = user?.isSuperAdmin;
  const { data: rolesData, isLoading, refetch } = useRolesList({});

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditPermissionsOpen, setIsEditPermissionsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
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
              <p className="text-slate-500">只有超级管理员才能访问角色管理</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const filteredRoles =
    rolesData?.filter(
      (role: any) =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleDelete = async (id: string) => {
    // try {
    //   await deleteMutation.mutateAsync(id);
    //   toast.success("角色删除成功");
    //   refetch();
    // } catch (error) {
    //   toast.error("角色删除失败");
    // }
  };

  const handleBatchDelete = async () => {
    // if (selectedIds.size === 0) {
    //   toast.error("请选择要删除的角色");
    //   return;
    // }
    // try {
    //   await batchDeleteMutation.mutateAsync(Array.from(selectedIds));
    //   toast.success(`成功删除 ${selectedIds.size} 个角色`);
    //   setSelectedIds(new Set());
    //   refetch();
    // } catch (error) {
    //   toast.error("批量删除失败");
    // }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && filteredRoles) {
      setSelectedIds(new Set(filteredRoles.map((r: any) => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelect = (id: string, checked: boolean) => {
    const newSelectedIds = new Set(selectedIds);
    if (checked) {
      newSelectedIds.add(id);
    } else {
      newSelectedIds.delete(id);
    }
    setSelectedIds(newSelectedIds);
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
            <nav className="font-medium text-sm">角色管理</nav>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          {/* 页面头部 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-3xl text-slate-900">角色管理</h1>
              <p className="mt-2 text-slate-600">
                管理系统角色，配置角色权限，控制用户访问权限。
              </p>
            </div>

            <div className="flex items-center gap-3">
              {selectedIds.size > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      批量删除 ({selectedIds.size})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认批量删除</AlertDialogTitle>
                      <AlertDialogDescription>
                        确定要删除选中的 {selectedIds.size}{" "}
                        个角色吗？此操作不可撤销。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction onClick={handleBatchDelete}>
                        删除
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              <Button
                className="bg-indigo-600 text-white hover:bg-indigo-700"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Shield className="mr-2 h-4 w-4" />
                添加角色
              </Button>
            </div>
          </div>

          {/* 搜索栏 */}
          <Card>
            <CardHeader>
              <CardTitle>搜索角色</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索角色名称或描述..."
                value={searchTerm}
              />
            </CardContent>
          </Card>

          {/* 角色列表 */}
          <Card>
            {filteredRoles.length > 0 && (
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>角色列表</CardTitle>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      checked={selectedIds.size === filteredRoles.length}
                      className="rounded"
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      type="checkbox"
                    />
                    全选
                    <span className="text-slate-500">
                      ({selectedIds.size}/{filteredRoles.length})
                    </span>
                  </label>
                </div>
              </CardHeader>
            )}

            <CardContent>
              {filteredRoles.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 h-12 w-12 text-slate-300">
                    <Shield />
                  </div>
                  <h3 className="mb-2 font-semibold text-slate-900 text-xl">
                    {searchTerm ? "未找到匹配的角色" : "暂无角色"}
                  </h3>
                  <p className="mx-auto mb-6 max-w-md text-slate-500">
                    {searchTerm
                      ? "请尝试其他搜索关键词"
                      : "创建第一个角色来开始构建权限体系"}
                  </p>
                  {!searchTerm && (
                    <Button
                      className="bg-indigo-600 text-white hover:bg-indigo-700"
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      创建角色
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRoles.map((role: any) => (
                    <div
                      className="group flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                      key={role.id}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          checked={selectedIds.has(role.id)}
                          className="rounded"
                          onChange={(e) =>
                            handleSelect(role.id, e.target.checked)
                          }
                          type="checkbox"
                        />
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                          <Shield className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900">
                              {role.name}
                            </h3>
                            <RoleTypeBadge type={role.type} />
                            {role.priority > 0 && (
                              <Badge
                                className="bg-amber-100 text-amber-700"
                                variant="secondary"
                              >
                                优先级: {role.priority}
                              </Badge>
                            )}
                          </div>
                          {role.description && (
                            <p className="text-slate-500 text-sm">
                              {role.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => {
                            setSelectedRole({ id: role.id, name: role.name });
                            setIsEditPermissionsOpen(true);
                          }}
                          size="sm"
                          variant="outline"
                        >
                          编辑权限
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              删除
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确认删除</AlertDialogTitle>
                              <AlertDialogDescription>
                                确定要删除角色 "{role.name}"
                                吗？此操作不可撤销。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(role.id)}
                              >
                                删除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>

      {/* 创建角色对话框 */}
      <CreateRoleModal
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

      {/* 编辑角色权限对话框 */}
      {selectedRole && (
        <EditRolePermissionsModal
          onOpenChange={(open) => {
            setIsEditPermissionsOpen(open);
            if (!open) {
              setSelectedRole(null);
              refetch();
            }
          }}
          onSuccess={() => {
            refetch();
          }}
          open={isEditPermissionsOpen}
          roleId={selectedRole.id}
          roleName={selectedRole.name}
        />
      )}
    </SidebarProvider>
  );
}
