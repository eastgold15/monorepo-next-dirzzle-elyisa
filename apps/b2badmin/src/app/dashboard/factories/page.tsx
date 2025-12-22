"use client";

import {
  Building2,
  CheckCircle,
  Globe,
  MapPin,
  Phone,
  Plus,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { HasRole } from "@/components/auth";
import { CreateFactoryModal } from "@/components/form/CreateFactoryModal";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useFactoriesQuery } from "@/hooks/api/use-factories";

export default function FactoryManager() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 避免hydration错误
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 获取工厂列表
  const { data: factories = [], isLoading, refetch } = useFactoriesQuery();

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
            <nav className="font-medium text-sm">工厂管理</nav>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-bold text-2xl text-slate-900">工厂管理</h1>
                <p className="mt-1 text-slate-500">
                  管理您的制造合作伙伴和工厂信息
                </p>
              </div>
              <HasRole role={["super_admin", "exporter_admin"]}>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="mr-2" size={18} />
                  创建工厂
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
            ) : factories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Building2 className="mb-4 h-12 w-12 text-slate-300" />
                <h3 className="mb-2 font-semibold text-slate-900">暂无工厂</h3>
                <p className="mb-4 text-center text-slate-500">
                  您还没有创建任何工厂。点击下方按钮开始创建您的第一个工厂。
                </p>
                <HasRole role={["super_admin", "exporter_admin"]}>
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="mr-2" size={18} />
                    创建第一个工厂
                  </Button>
                </HasRole>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {factories.map((factory) => (
                  <div
                    className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                    key={factory.id}
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-indigo-100 p-2">
                          <Building2 className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-slate-900">
                            {factory.name}
                          </h3>
                          <p className="font-medium text-slate-500 text-sm">
                            #{factory.code}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {factory.isActive ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        {factory.isVerified && (
                          <div className="rounded-full bg-blue-100 px-2 py-1">
                            <span className="font-medium text-blue-700 text-xs">
                              已认证
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {factory.description && (
                      <p className="mb-4 text-slate-600 text-sm">
                        {factory.description}
                      </p>
                    )}

                    <div className="space-y-2 text-slate-600 text-sm">
                      {factory.contactPhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <span>{factory.contactPhone}</span>
                        </div>
                      )}
                      {factory.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                          <span className="line-clamp-2">
                            {factory.address}
                          </span>
                        </div>
                      )}
                      {factory.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-slate-400" />
                          <a
                            className="truncate text-indigo-600 hover:text-indigo-700"
                            href={factory.website}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            访问官网
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 border-slate-100 border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-slate-500 text-xs">
                          <Users className="h-3 w-3" />
                          <span>工厂管理员</span>
                        </div>
                        <button className="font-medium text-indigo-600 text-sm hover:text-indigo-700">
                          查看详情
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SidebarInset>

      {/* 创建工厂弹窗 */}
      <CreateFactoryModal
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          refetch();
        }}
        open={isCreateModalOpen}
      />
    </SidebarProvider>
  );
}
