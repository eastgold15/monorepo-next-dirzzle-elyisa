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
import {
  useCurrentRole,
  useCurrentSite,
  useCurrentUser,
  useIsExporterAdmin,
  useIsExporterSite,
  useIsFactoryAdmin,
  useIsFactorySite,
  useIsSalesperson,
  useIsSuperAdmin,
  useIsUserLoading,
  useUserRole,
} from "@/stores/user-store";

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

// 角色特定的统计信息组件
const RoleSpecificStats = () => {
  // 站点相关hooks
  const currentSite = useCurrentSite();
  const isSuperAdmin = useIsSuperAdmin();
  const isExporterAdmin = useIsExporterAdmin();
  const isFactoryAdmin = useIsFactoryAdmin();
  const isSalesperson = useIsSalesperson();
  const isExporterSite = useIsExporterSite();
  const isFactorySite = useIsFactorySite();

  // 暂时使用模拟数据，后续可以从 API 获取

  if (isSuperAdmin) {
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

  if (isExporterAdmin && isExporterSite) {
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

  if (currentSite && isFactoryAdmin && isFactorySite) {
    const siteName = currentSite.site?.name || "未分配";
    return (
      <>
        <StatCard
          color="bg-blue-500"
          icon={Factory}
          label="我的工厂"
          value={siteName}
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

  if (isSalesperson) {
    return (
      <>
        <StatCard
          color="bg-blue-500"
          icon={Users}
          label="我的客户"
          value="28"
        />
        <StatCard
          color="bg-emerald-500"
          icon={TrendingUp}
          label="本月销售额"
          value="¥125K"
        />
        <StatCard
          color="bg-indigo-500"
          icon={Package}
          label="跟进产品"
          value="15"
        />
        <StatCard
          color="bg-amber-500"
          icon={AlertCircle}
          label="待处理询盘"
          value="7"
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
  // 站点相关hooks
  const currentSite = useCurrentSite();
  const isSuperAdmin = useIsSuperAdmin();
  const isExporterAdmin = useIsExporterAdmin();
  const isFactoryAdmin = useIsFactoryAdmin();
  const isSalesperson = useIsSalesperson();
  const isExporterSite = useIsExporterSite();
  const isFactorySite = useIsFactorySite();

  if (isSuperAdmin) {
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

  if (isFactoryAdmin && isFactorySite) {
    const siteName = currentSite?.site?.name || "当前站点";
    return (
      <div className="space-y-4">
        <div className="flex gap-3 text-sm">
          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
          <p className="text-slate-600">
            {siteName}生产线A维护通知，预计停工2天
          </p>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
          <p className="text-slate-600">本月产品质量合格率 98.5%</p>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-green-500" />
          <p className="text-slate-600">新增2个国际订单，价值 ¥450K</p>
        </div>
      </div>
    );
  }

  if (isSalesperson) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3 text-sm">
          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-green-500" />
          <p className="text-slate-600">客户 ABC Corp 已确认订单，准备发货</p>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
          <p className="text-slate-600">有5个新的询盘需要跟进</p>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
          <p className="text-slate-600">本月销售目标完成度 85%</p>
        </div>
      </div>
    );
  }

  // 默认通知
  return (
    <div className="space-y-4">
      <div className="flex gap-3 text-sm">
        <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
        <p className="text-slate-600">欢迎使用管理系统！</p>
      </div>
    </div>
  );
};

export function UserDashboard() {
  const user = useCurrentUser();
  const isLoading = useIsUserLoading();
  const userRole = useUserRole();
  const getRoleDisplayName = useRoleDisplayName();

  // 站点相关hooks
  const currentSite = useCurrentSite();
  const currentRole = useCurrentRole();
  const isSuperAdmin = useIsSuperAdmin();
  const isExporterAdmin = useIsExporterAdmin();
  const isFactoryAdmin = useIsFactoryAdmin();
  const isSalesperson = useIsSalesperson();
  const isExporterSite = useIsExporterSite();
  const isFactorySite = useIsFactorySite();

  if (isLoading || !user) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-slate-600">正在加载用户信息...</p>
        </div>
      </div>
    );
  }

  // 获取站点显示名称
  const getSiteDisplayName = () => {
    if (!currentSite?.site) return "未知站点";
    return currentSite.site.name || "未知站点";
  };

  const roleDisplayName = getRoleDisplayName(currentRole);

  return (
    <div className="space-y-6">
      {/* 欢迎信息 */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 font-bold text-2xl text-slate-900">
          欢迎回来，{user?.name || "用户"}！
        </h2>
        <div className="flex items-center gap-4 text-slate-600">
          <span>{roleDisplayName}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            {isExporterSite && <Globe className="size-4 text-blue-600" />}
            {isFactorySite && <Factory className="size-4 text-green-600" />}
            {getSiteDisplayName()}
          </span>
          {isSuperAdmin && (
            <>
              <span>·</span>
              <span className="rounded bg-purple-100 px-2 py-1 font-medium text-purple-800 text-xs">
                超级管理员
              </span>
            </>
          )}
        </div>
      </div>

      {/* 角色特定的统计信息 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <RoleSpecificStats />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 系统通知 */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-lg">
            <AlertCircle className="size-5 text-amber-500" />
            系统通知
          </h3>
          <RoleSpecificNotifications />
        </div>

        {/* 快速操作 */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-lg">
            <Activity className="size-5 text-blue-500" />
            快速操作
          </h3>
          <div className="space-y-3">
            {isSuperAdmin && (
              <>
                <a
                  className="block rounded-lg bg-slate-50 p-3 transition-colors hover:bg-slate-100"
                  href="/dashboard/users"
                >
                  <p className="font-medium text-slate-900">全局用户管理</p>
                  <p className="text-slate-500 text-sm">管理所有站点的用户</p>
                </a>
                <a
                  className="block rounded-lg bg-slate-50 p-3 transition-colors hover:bg-slate-100"
                  href="/dashboard/factories"
                >
                  <p className="font-medium text-slate-900">工厂管理</p>
                  <p className="text-slate-500 text-sm">管理所有工厂</p>
                </a>
                <a
                  className="block rounded-lg bg-slate-50 p-3 transition-colors hover:bg-slate-100"
                  href="/dashboard/analytics"
                >
                  <p className="font-medium text-slate-900">数据分析</p>
                  <p className="text-slate-500 text-sm">全局数据统计</p>
                </a>
              </>
            )}
            {(isExporterAdmin || isFactoryAdmin) && (
              <>
                <a
                  className="block rounded-lg bg-slate-50 p-3 transition-colors hover:bg-slate-100"
                  href="/dashboard/products"
                >
                  <p className="font-medium text-slate-900">产品管理</p>
                  <p className="text-slate-500 text-sm">
                    管理{isExporterSite ? "出口商" : "工厂"}产品
                  </p>
                </a>
                {isExporterSite && isExporterAdmin && (
                  <a
                    className="block rounded-lg bg-slate-50 p-3 transition-colors hover:bg-slate-100"
                    href="/dashboard/factories"
                  >
                    <p className="font-medium text-slate-900">工厂管理</p>
                    <p className="text-slate-500 text-sm">查看和管理下属工厂</p>
                  </a>
                )}
                <a
                  className="block rounded-lg bg-slate-50 p-3 transition-colors hover:bg-slate-100"
                  href="/dashboard/media"
                >
                  <p className="font-medium text-slate-900">媒体文件</p>
                  <p className="text-slate-500 text-sm">上传和管理产品图片</p>
                </a>
              </>
            )}
            {isSalesperson && (
              <>
                <a
                  className="block rounded-lg bg-slate-50 p-3 transition-colors hover:bg-slate-100"
                  href="/dashboard/products"
                >
                  <p className="font-medium text-slate-900">产品查看</p>
                  <p className="text-slate-500 text-sm">查看可管理的产品</p>
                </a>
                <a
                  className="block rounded-lg bg-slate-50 p-3 transition-colors hover:bg-slate-100"
                  href="/dashboard/analytics"
                >
                  <p className="font-medium text-slate-900">业绩统计</p>
                  <p className="text-slate-500 text-sm">查看销售数据</p>
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
