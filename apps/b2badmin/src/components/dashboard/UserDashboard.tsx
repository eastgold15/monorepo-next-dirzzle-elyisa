"use client";

import {
  AlertCircle,
  Building2,
  Globe,
  Package,
  Settings,
  ShieldCheck,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { Can } from "@/components/auth/Can"; // 我们之前写的权限组件
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth-store";

// --- 1. 配置定义：统计数据预设 ---
const STATS_PRESETS = {
  super_admin: [
    {
      label: "管理站点",
      value: "全部",
      icon: ShieldCheck,
      color: "bg-purple-500",
    },
    {
      label: "出口商数量",
      value: "8",
      icon: Building2,
      color: "bg-indigo-500",
    },
    { label: "系统用户", value: "156", icon: Users, color: "bg-emerald-500" },
    { label: "活跃站点", value: "24", icon: Globe, color: "bg-amber-500" },
  ],
  exporter_admin: [
    { label: "管理工厂", value: "5", icon: Building2, color: "bg-indigo-500" },
    { label: "团队成员", value: "23", icon: Users, color: "bg-emerald-500" },
    { label: "总产品数", value: "156", icon: Package, color: "bg-blue-500" },
    { label: "本月订单", value: "89", icon: TrendingUp, color: "bg-amber-500" },
  ],
  factory_admin: [
    { label: "工厂业务员", value: "8", icon: Users, color: "bg-emerald-500" },
    { label: "工厂产品", value: "42", icon: Package, color: "bg-indigo-500" },
    { label: "待审核", value: "3", icon: AlertCircle, color: "bg-amber-500" },
  ],
  default: [
    {
      label: "Total Products",
      value: "48",
      icon: Package,
      color: "bg-indigo-500",
    },
    { label: "Active Users", value: "8", icon: Users, color: "bg-blue-500" },
  ],
};

// --- 2. 配置定义：角色通知预设 ---
const NOTIFICATION_PRESETS = {
  super_admin: [
    { text: "系统运行状态良好，所有服务正常", color: "bg-purple-500" },
    { text: "新增2个出口商申请，需要审核", color: "bg-blue-500" },
  ],
  exporter_admin: [
    { text: "本月新增5个工厂合作申请", color: "bg-blue-500" },
    { text: "产品销量环比增长15%", color: "bg-emerald-500" },
  ],
  factory_admin: [
    { text: "生产线A维护通知，预计停工2天", color: "bg-amber-500" },
    { text: "新订单待处理：15个", color: "bg-blue-500" },
  ],
};

// --- 子组件：统计卡片 ---
const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-hover hover:shadow-md">
    <div>
      <p className="mb-1 font-medium text-slate-500 text-sm">{label}</p>
      <h3 className="font-bold text-2xl text-slate-900">{value}</h3>
    </div>
    <div className={`rounded-lg p-3 ${color} text-white shadow-inner`}>
      <Icon size={24} />
    </div>
  </div>
);

export default function UserDashboard() {
  const { user, isSuperAdmin } = useAuthStore();

  // 3. 根据当前角色获取配置 (使用 useMemo 优化)
  const roleName = user?.role.name || "default";
  const stats =
    STATS_PRESETS[roleName as keyof typeof STATS_PRESETS] ||
    STATS_PRESETS.default;
  const notifications =
    NOTIFICATION_PRESETS[roleName as keyof typeof NOTIFICATION_PRESETS] || [];

  if (!user) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8 p-6 lg:p-10">
      {/* 欢迎头部 */}
      <header className="flex flex-col gap-1">
        <h1 className="font-extrabold text-3xl text-slate-900 tracking-tight">
          欢迎回来，{user.name} 👋
        </h1>
        <p className="text-slate-500">
          {user.role.description || "普通用户"} | {user.email}
        </p>
      </header>

      {/* 1. 统计区域 (数据驱动渲染) */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* 2. 通知中心 (条件渲染) */}
        <div className="lg:col-span-2">
          <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 font-bold text-slate-900 text-xl">通知中心</h2>
            <div className="space-y-5">
              {notifications.length > 0 ? (
                notifications.map((note, i) => (
                  <div className="group flex items-center gap-4" key={i}>
                    <div
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${note.color} ring-4 ring-slate-50`}
                    />
                    <p className="text-slate-600 transition-colors group-hover:text-slate-900">
                      {note.text}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic">暂无新通知</p>
              )}
            </div>
          </div>
        </div>

        {/* 3. 快速操作 (权限驱动渲染 - 关键改动) */}
        <aside>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 font-bold text-slate-900 text-xl">快速操作</h2>
            <div className="flex flex-col gap-3">
              <Can permission="SITES_MANAGE">
                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 font-semibold text-white transition-all hover:bg-purple-700 hover:shadow-lg active:scale-95">
                  <Settings size={18} /> 系统设置
                </button>
              </Can>

              <Can permission="PRODUCTS_TABLE_VIEW">
                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg active:scale-95">
                  <Package size={18} /> 产品管理
                </button>
              </Can>

              <Can permission="FACTORIES_VIEW">
                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition-all hover:bg-emerald-700 hover:shadow-lg active:scale-95">
                  <Building2 size={18} /> 工厂管理
                </button>
              </Can>

              <Can permission="QUOTATIONS_VIEW">
                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-95">
                  <ShoppingCart size={18} /> 订单管理
                </button>
              </Can>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// 骨架屏组件
function DashboardSkeleton() {
  return (
    <div className="space-y-8 p-6 lg:p-10">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton className="h-32 rounded-xl" key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}
