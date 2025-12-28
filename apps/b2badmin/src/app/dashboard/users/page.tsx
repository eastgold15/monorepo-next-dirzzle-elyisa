"use client";

import {
  Briefcase,
  Building2,
  CheckCircle,
  Mail,
  Phone,
  Plus,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { HasRole } from "@/components/auth";
import { CreateSalespersonModal } from "@/components/form/CreateSalespersonModal";
import { EditSalespersonModal } from "@/components/form/EditSalespersonModal";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useDeleteSalesperson, useSalespersons } from "@/hooks/api/salesperson";
import type { SalespersonWithDetails } from "@repo/contract";

export default function UsersPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSalesperson, setEditingSalesperson] = useState<
    SalespersonWithDetails | null
  >(null);
  const [isMounted, setIsMounted] = useState(false);

  // 避免hydration错误
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 获取业务员列表
  const {
    data: response,
    isLoading,
    refetch,
  } = useSalespersons({
    page: 1,
    limit: 100,
  });
  const salespersons = response?.data || [];

  // 删除业务员
  const deleteSalesperson = useDeleteSalesperson();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定要删除业务员 "${name}" 吗？此操作不可恢复。`)) {
      return;
    }
    await deleteSalesperson.mutateAsync(id);
  };

  // 如果还没挂载，返回一个加载状态的占位符
  if (!isMounted) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex h-16 shrink-0 items-center gap-2">
            <div className="h-4 w-4 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
              <p className="text-slate-500 text-sm">加载中...</p>
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
            <nav className="font-medium text-sm">业务员管理</nav>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-bold text-2xl text-slate-900">
                  业务员管理
                </h1>
                <p className="mt-1 text-slate-500">
                  管理您的业务团队，分配主分类和权限
                </p>
              </div>
              <HasRole
                role={["super_admin", "exporter_admin", "factory_admin"]}
              >
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="mr-2" size={18} />
                  创建业务员
                </Button>
              </HasRole>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
                  <p className="text-slate-500 text-sm">加载中...</p>
                </div>
              </div>
            ) : salespersons.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Briefcase className="mb-4 h-12 w-12 text-slate-300" />
                <h3 className="mb-2 font-semibold text-slate-900">
                  暂无业务员
                </h3>
                <p className="mb-4 text-center text-slate-500">
                  您还没有创建任何业务员。点击下方按钮开始创建您的第一个业务员。
                </p>
                <HasRole
                  role={["super_admin", "exporter_admin", "factory_admin"]}
                >
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="mr-2" size={18} />
                    创建第一个业务员
                  </Button>
                </HasRole>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {salespersons.map((salesperson) => (
                  <div
                    className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                    key={salesperson.id}
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-indigo-100 p-2">
                          <User className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-slate-900">
                            {salesperson.user?.name || "未命名"}
                          </h3>
                          {salesperson.position && (
                            <p className="font-medium text-slate-500 text-sm">
                              {salesperson.position}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {salesperson.user?.isActive ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        {salesperson.affiliations &&
                          salesperson.affiliations.length > 0 && (
                            <div className="rounded-full bg-blue-100 px-2 py-1">
                              <span className="font-medium text-blue-700 text-xs">
                                {salesperson.affiliations[0].entityType ===
                                "exporter"
                                  ? "出口商"
                                  : "工厂"}
                              </span>
                            </div>
                          )}
                      </div>
                    </div>

                    <div className="mb-4 space-y-2 text-slate-600 text-sm">
                      {salesperson.user?.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <span className="truncate">
                            {salesperson.user.email}
                          </span>
                        </div>
                      )}
                      {salesperson.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <span>{salesperson.phone}</span>
                        </div>
                      )}
                      {salesperson.department && (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-slate-400" />
                          <span>{salesperson.department}</span>
                        </div>
                      )}
                    </div>

                    {salesperson.masterCategories &&
                      salesperson.masterCategories.length > 0 && (
                        <div className="mb-4">
                          <p className="mb-2 font-medium text-slate-700 text-xs">
                            负责主分类：
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {salesperson.masterCategories
                              .slice(0, 3)
                              .map((mc) => (
                                <span
                                  className="rounded-full bg-indigo-50 px-2 py-1 text-indigo-700 text-xs"
                                  key={mc.id}
                                >
                                  {mc?.name}
                                </span>
                              ))}
                            {salesperson.masterCategories.length > 3 && (
                              <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600 text-xs">
                                +{salesperson.masterCategories.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                    <div className="border-slate-100 border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-slate-500 text-xs">
                          <Briefcase className="h-3 w-3" />
                          <span>业务员</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="font-medium text-indigo-600 text-sm hover:text-indigo-700"
                            onClick={() => {
                              setEditingSalesperson(salesperson);
                              setIsEditModalOpen(true);
                            }}
                          >
                            编辑
                          </button>
                          <button
                            className="font-medium text-red-600 text-sm hover:text-red-700"
                            onClick={() =>
                              handleDelete(
                                salesperson.id,
                                salesperson.user?.name || "未命名"
                              )
                            }
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SidebarInset>

      {/* 创建业务员弹窗 */}
      <CreateSalespersonModal
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          refetch();
        }}
        open={isCreateModalOpen}
      />

      {/* 编辑业务员弹窗 */}
      <EditSalespersonModal
        onOpenChange={setIsEditModalOpen}
        onSuccess={() => {
          refetch();
        }}
        open={isEditModalOpen}
        salesperson={editingSalesperson}
      />
    </SidebarProvider>
  );
}
