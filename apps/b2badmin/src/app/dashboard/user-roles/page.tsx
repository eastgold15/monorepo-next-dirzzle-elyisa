"use client";

import { Building2, Shield, UserCog, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { AssignUserRoleModal } from "@/components/form/AssignUserRoleModal";
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
import {
  useUserSiteRoleDelete,
  useUserSiteRolesList,
} from "@/hooks/api/usersiteroles";
import { useAuthStore } from "@/stores/auth-store";

// 角色类型徽章
function RoleTypeBadge({ type }: { type: string }) {
  if (type === "system") {
    return (
      <Badge className="bg-purple-100 text-purple-700 text-xs">系统</Badge>
    );
  }
  return <Badge className="bg-blue-100 text-blue-700 text-xs">自定义</Badge>;
}

export default function UserRolesPage() {
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = user?.isSuperAdmin;
  const {
    data: userSiteRolesData,
    isLoading,
    refetch,
  } = useUserSiteRolesList();
  const { data: rolesData } = useRolesList({});
  const deleteMutation = useUserSiteRoleDelete();

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRoles =
    userSiteRolesData?.filter(
      (role: any) =>
        role.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.site?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.role?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleDelete = async (id: string, userName: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success(`已取消 ${userName} 的角色分配`);
      refetch();
    } catch (error) {
      toast.error("取消角色分配失败");
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
            <nav className="font-medium text-sm">用户角色管理</nav>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          {/* 页面头部 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-3xl text-slate-900">
                用户角色管理
              </h1>
              <p className="mt-2 text-slate-600">
                为用户分配站点角色，控制用户在各个站点的访问权限。
              </p>
            </div>

            <Button
              className="bg-indigo-600 text-white hover:bg-indigo-700"
              onClick={() => setIsAssignModalOpen(true)}
            >
              <UserCog className="mr-2 h-4 w-4" />
              分配角色
            </Button>
          </div>

          {/* 搜索栏 */}
          <Card>
            <CardHeader>
              <CardTitle>搜索角色分配</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索用户名、邮箱、站点或角色..."
                value={searchTerm}
              />
            </CardContent>
          </Card>

          {/* 角色分配列表 */}
          <Card>
            <CardHeader>
              <CardTitle>角色分配列表 ({filteredRoles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredRoles.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 h-12 w-12 text-slate-300">
                    <UserCog />
                  </div>
                  <h3 className="mb-2 font-semibold text-slate-900 text-xl">
                    {searchTerm ? "未找到匹配的结果" : "暂无角色分配"}
                  </h3>
                  <p className="mx-auto mb-6 max-w-md text-slate-500">
                    {searchTerm
                      ? "请尝试其他搜索关键词"
                      : "还没有为用户分配站点角色"}
                  </p>
                  {!searchTerm && (
                    <Button
                      className="bg-indigo-600 text-white hover:bg-indigo-700"
                      onClick={() => setIsAssignModalOpen(true)}
                    >
                      <UserCog className="mr-2 h-4 w-4" />
                      分配角色
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-slate-50 text-slate-600 text-sm">
                        <th className="px-4 py-3 text-left font-medium">
                          用户
                        </th>
                        <th className="px-4 py-3 text-left font-medium">
                          站点
                        </th>
                        <th className="px-4 py-3 text-left font-medium">
                          角色
                        </th>
                        <th className="px-4 py-3 text-left font-medium">
                          分配时间
                        </th>
                        <th className="px-4 py-3 text-right font-medium">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRoles.map((userRole) => (
                        <tr
                          className="border-slate-100 border-b hover:bg-slate-50"
                          key={userRole.userId}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
                                <Users className="h-4 w-4 text-indigo-600" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">
                                  {userRole.user?.name || "未知用户"}
                                </p>
                                <p className="text-slate-500 text-xs">
                                  {userRole.user?.email || ""}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-700 text-sm">
                                {userRole.site?.name || "未知站点"}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-700 text-sm">
                                {userRole.role?.name || "未知角色"}
                              </span>
                              {userRole.role && (
                                <RoleTypeBadge type={userRole.role.type} />
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <p className="text-slate-500 text-sm">
                              {userRole.createdAt
                                ? new Date(
                                    userRole.createdAt
                                  ).toLocaleDateString("zh-CN")
                                : "-"}
                            </p>
                          </td>

                          <td className="px-4 py-3 text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  取消分配
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    确认取消角色分配
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    确定要取消用户 "{userRole.user?.name}"
                                    在站点 "{userRole.site?.name}" 的角色 "
                                    {userRole.role?.name}"
                                    吗？用户将失去该站点的访问权限。
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>取消</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDelete(
                                        userRole.userId,
                                        userRole.user?.name || "未知用户"
                                      )
                                    }
                                  >
                                    确认取消
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 角色统计 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-medium text-slate-600 text-sm">
                  总分配数
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-bold text-3xl text-slate-900">
                  {filteredRoles.length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-medium text-slate-600 text-sm">
                  可用角色
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-bold text-3xl text-slate-900">
                  {rolesData?.length || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-medium text-slate-600 text-sm">
                  系统角色
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-bold text-3xl text-slate-900">
                  {rolesData?.filter((r: any) => r.type === "system").length ||
                    0}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>

      {/* 分配角色对话框 */}
      <AssignUserRoleModal
        onOpenChange={(open) => {
          setIsAssignModalOpen(open);
          if (!open) {
            refetch();
          }
        }}
        onSuccess={() => {
          refetch();
        }}
        open={isAssignModalOpen}
      />
    </SidebarProvider>
  );
}
