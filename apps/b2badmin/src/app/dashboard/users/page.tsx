"use client";

import {
  Edit,
  Loader2,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { CreateSalespersonModal } from "@/components/admin/CreateSalespersonModal";
import { AppSidebar } from "@/components/app-sidebar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  useIsExporterAdmin,
  useIsFactoryAdmin,
  useIsSuperAdmin,
} from "@/stores/user-store";
import {
  useFactoriesQuery,
  useUserManagement,
  useUsersWithSearch,
} from "@/hooks/api/use-users-with-search";
import "@/hooks/api/use-user-api";

export default function UsersPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 权限检查
  const isSuperAdmin = useIsSuperAdmin();
  const isExporterAdmin = useIsExporterAdmin();
  const isFactoryAdmin = useIsFactoryAdmin();
  const canCreateUser = isSuperAdmin || isExporterAdmin || isFactoryAdmin;

  // 使用自定义hooks
  const {
    users,
    pagination,
    isLoading: loading,
    error,
    handleSearch,
    refetch,
    searchQuery,
    setSearchQuery,
  } = useUsersWithSearch();

  const {
    createSalesperson,
    createFactoryAdmin,
    updateUserStatus,
    isCreatingSalesperson,
    isCreatingFactoryAdmin,
    isUpdatingStatus,
  } = useUserManagement();

  // 获取工厂列表（用于CreateSalespersonModal）
  const { data: factories } = useFactoriesQuery();

  // 处理搜索
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    handleSearch(value);
  };

  // 切换用户状态
  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await updateUserStatus({ userId, isActive: !isActive });
    } catch (error) {
      console.error("切换用户状态失败:", error);
    }
  };

  // 创建业务员成功回调
  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator className="mr-2 h-4" orientation="vertical" />
            <nav className="font-medium text-sm">Users</nav>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-bold text-2xl text-slate-900">用户管理</h1>
                <p className="mt-1 text-slate-500">管理业务员账号和权限设置</p>
              </div>
              {canCreateUser && (
                <Button
                  className="flex items-center gap-2"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus size={18} />
                  {isExporterAdmin ? "创建账号" : "创建业务员"}
                </Button>
              )}
            </div>

            {/* Search */}
            <div className="flex items-center gap-2">
              <div className="relative max-w-md flex-1">
                <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-slate-400" />
                <Input
                  className="pl-10"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索用户姓名或邮箱..."
                  value={searchQuery}
                />
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Users List */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                  <span className="ml-2 text-slate-500">加载中...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-slate-200 border-b bg-slate-50">
                        <th className="px-6 py-3 text-left font-medium text-slate-500 text-xs uppercase">
                          用户信息
                        </th>
                        <th className="px-6 py-3 text-left font-medium text-slate-500 text-xs uppercase">
                          角色
                        </th>
                        <th className="px-6 py-3 text-left font-medium text-slate-500 text-xs uppercase">
                          工厂
                        </th>
                        <th className="px-6 py-3 text-left font-medium text-slate-500 text-xs uppercase">
                          联系方式
                        </th>
                        <th className="px-6 py-3 text-left font-medium text-slate-500 text-xs uppercase">
                          状态
                        </th>
                        <th className="px-6 py-3 text-left font-medium text-slate-500 text-xs uppercase">
                          创建时间
                        </th>
                        <th className="px-6 py-3 text-right font-medium text-slate-500 text-xs uppercase">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr
                          className="border-slate-100 border-b hover:bg-slate-50"
                          key={user.id}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200">
                                <Users className="h-5 w-5 text-slate-500" />
                              </div>
                              <div>
                                <div className="font-medium text-slate-900">
                                  {user.name}
                                </div>
                                <div className="text-slate-500 text-sm">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {user.roles?.map((role, index) => (
                                <span
                                  key={index}
                                  className={`inline-flex items-center rounded-full px-2 py-1 font-medium text-xs mr-1 ${
                                    role.role.name === "factory_admin"
                                      ? "bg-purple-100 text-purple-700"
                                      : role.role.name === "salesperson"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {role.role.name === "factory_admin"
                                    ? "工厂管理员"
                                    : role.role.name === "salesperson"
                                    ? "业务员"
                                    : role.role.name}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600 text-sm">
                            <div className="space-y-1">
                              {user.factories?.map((factory, index) => (
                                <div key={index}>{factory.name}</div>
                              ))}
                              {user.exporters?.map((exporter, index) => (
                                <div key={index}>{exporter.name}</div>
                              ))}
                              {(!user.factories || user.factories.length === 0) &&
                                (!user.exporters || user.exporters.length === 0) && "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {user.phone && (
                                <div className="flex items-center gap-1 text-slate-600 text-sm">
                                  <Phone className="h-4 w-4" />
                                  {user.phone}
                                </div>
                              )}
                              <div className="text-slate-500 text-xs">
                                {user.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 font-medium text-xs ${
                                user.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {user.isActive ? "活跃" : "停用"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-600 text-sm">
                            {user.createdAt}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {canCreateUser && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    className="h-8 w-8 p-0"
                                    variant="ghost"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    发送邮件
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="flex items-center gap-2">
                                    <Edit className="h-4 w-4" />
                                    编辑信息
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className={`flex items-center gap-2 ${
                                      user.isActive
                                        ? "text-red-600"
                                        : "text-green-600"
                                    }`}
                                    onClick={() =>
                                      handleToggleUserStatus(
                                        user.id,
                                        user.isActive
                                      )
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    {user.isActive ? "停用账号" : "启用账号"}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {users.length === 0 && (
                    <div className="py-12 text-center">
                      <Users className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                      <h3 className="mb-2 font-medium text-lg text-slate-900">
                        暂无用户
                      </h3>
                      <p className="text-slate-500">
                        {searchQuery
                          ? "没有找到匹配的用户"
                          : "还没有创建任何业务员账号"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm">总用户数</p>
                    <p className="font-bold text-2xl text-slate-900">
                      {pagination.total}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-slate-400" />
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm">活跃用户</p>
                    <p className="font-bold text-2xl text-green-600">
                      {users.filter((u) => u.isActive).length}
                    </p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <span className="font-medium text-green-600 text-xs">
                      ✓
                    </span>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm">业务员数量</p>
                    <p className="font-bold text-2xl text-blue-600">
                      {users.filter((u) =>
                        u.roles?.some(r => r.role.name === "salesperson")
                      ).length}
                    </p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <span className="font-medium text-blue-600 text-xs">S</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Create Salesperson Modal */}
      <CreateSalespersonModal
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          // 刷新用户列表
          refetch();
        }}
        open={isCreateModalOpen}
      />
    </SidebarProvider>
  );
}
