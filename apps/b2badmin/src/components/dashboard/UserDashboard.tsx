"use client";

import {
  Activity,
  AlertCircle,
  Building2,
  Factory,
  Globe,
  Package,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { useMe } from "@/hooks/api/use-user-api";
import { useCurrentSiteId } from "@/stores/site-store";
import { HasRole } from "@/components/auth";

// 统计卡片组件
const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: any;
  color: string;
}) => (
  <div className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <div>
      <p className="mb-1 font-medium text-slate-500 text-sm">{label}</p>
      <h3 className="font-bold text-2xl text-slate-900">{value}</h3>
    </div>
    <div className={`rounded-lg p-3 ${color}`}>
      <Icon className="text-white" size={24} />
    </div>
  </div>
);

// 统计内容组件
const StatsContent = () => {
  const { user, isSuperAdmin, isExporterAdmin, isFactoryAdmin, getCurrentSiteId } = usePermissions();
  const currentSiteId = getCurrentSiteId();

  // 超级管理员统计
  if (isSuperAdmin()) {
    return (
      <>
        <StatCard
          color="bg-purple-500"
          icon={ShieldCheck}
          label="管理站点"
          value="全部"
        />
        <StatCard
          color="bg-indigo-500"
          icon={Building2}
          label="出口商数量"
          value="8"
        />
        <StatCard
          color="bg-emerald-500"
          icon={Users}
          label="系统用户"
          value="156"
        />
        <StatCard
          color="bg-amber-500"
          icon={Globe}
          label="活跃站点"
          value="24"
        />
      </>
    );
  }

  // 出口商管理员统计
  if (isExporterAdmin()) {
    return (
      <>
        <StatCard
          color="bg-indigo-500"
          icon={Building2}
          label="管理工厂"
          value="5"
        />
        <StatCard
          color="bg-emerald-500"
          icon={Users}
          label="团队成员"
          value="23"
        />
        <StatCard
          color="bg-blue-500"
          icon={Package}
          label="总产品数"
          value="156"
        />
        <StatCard
          color="bg-amber-500"
          icon={TrendingUp}
          label="本月订单"
          value="89"
        />
      </>
    );
  }

  // 工厂管理员统计
  if (isFactoryAdmin()) {
    return (
      <>
        <StatCard
          color="bg-blue-500"
          icon={Factory}
          label="我的工厂"
          value={currentSiteId || "未分配"}
        />
        <StatCard
          color="bg-emerald-500"
          icon={Users}
          label="工厂业务员"
          value="8"
        />
        <StatCard
          color="bg-indigo-500"
          icon={Package}
          label="工厂产品"
          value="42"
        />
        <StatCard
          color="bg-amber-500"
          icon={AlertCircle}
          label="待审核"
          value="3"
        />
      </>
    );
  }

  // 默认统计
  return (
    <>
      <StatCard
        color="bg-indigo-500"
        icon={Package}
        label="Total Products"
        value="48"
      />
      <StatCard
        color="bg-emerald-500"
        icon={TrendingUp}
        label="Active Templates"
        value="12"
      />
      <StatCard
        color="bg-amber-500"
        icon={AlertCircle}
        label="Pending Review"
        value="3"
      />
      <StatCard
        color="bg-blue-500"
        icon={Users}
        label="Active Users"
        value="8"
      />
    </>
  );
};

// 角色特定的通知组件
const RoleSpecificNotifications = () => {
  const { isSuperAdmin, isExporterAdmin, isFactoryAdmin, getUserDisplayName } = usePermissions();

  if (isSuperAdmin()) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3 text-sm">
          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-purple-500" />
          <p className="text-slate-600">系统运行状态良好，所有服务正常</p>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
          <p className="text-slate-600">新增2个出口商申请，需要审核</p>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
          <p className="text-slate-600">系统将于本周三进行例行维护</p>
        </div>
      </div>
    );
  }

  if (isExporterAdmin()) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3 text-sm">
          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
          <p className="text-slate-600">本月新增5个工厂合作申请</p>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
          <p className="text-slate-600">产品销量环比增长15%</p>
        </div>
      </div>
    );
  }

  if (isFactoryAdmin()) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3 text-sm">
          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
          <p className="text-slate-600">生产线A维护通知，预计停工2天</p>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
          <p className="text-slate-600">新订单待处理：15个</p>
        </div>
      </div>
    );
  }

  return null;
};

export default function UserDashboard() {
  const { data: userData, isLoading } = useMe();
  const { getUserDisplayName, getUserRoleDisplay } = usePermissions();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* 欢迎信息 */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          欢迎回来，{getUserDisplayName()}
        </h1>
        <p className="text-slate-600 mt-1">
          当前角色：{getUserRoleDisplay()}
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsContent />
      </div>

      {/* 通知和快速操作 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 通知 */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">通知</h2>
            <RoleSpecificNotifications />
          </div>
        </div>

        {/* 快速操作 */}
        <HasRole role={["super_admin", "exporter_admin", "factory_admin"]}>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">快速操作</h2>
            <div className="space-y-3">
              <HasRole role="super_admin">
                <button className="w-full rounded-lg bg-purple-500 px-4 py-2 text-white hover:bg-purple-600">
                  系统设置
                </button>
              </HasRole>
              <HasRole role={["exporter_admin", "factory_admin"]}>
                <button className="w-full rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
                  产品管理
                </button>
              </HasRole>
              <HasRole role={["exporter_admin"]}>
                <button className="w-full rounded-lg bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600">
                  工厂管理
                </button>
              </HasRole>
              <HasRole role={["factory_admin"]}>
                <button className="w-full rounded-lg bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600">
                  订单管理
                </button>
              </HasRole>
            </div>
          </div>
        </HasRole>
      </div>
    </div>
  );
}