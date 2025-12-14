"use client";

import {
  AlertCircle,
  Building2,
  Factory,
  Package,
  TrendingUp,
  Users,
} from "lucide-react";
import { useOrganization, usePermissions, useTeam } from "@/hooks/use-user";

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
const RoleSpecificStats = ({ userRole }: { userRole?: string }) => {
  const organization = useOrganization();
  const team = useTeam();

  const teamStats = team.getTeamStats();
  const factoriesCount = organization.getFactoriesCount();
  const exporter = organization.getExporter();
  const primaryFactory = organization.getPrimaryFactory();

  if (userRole === "exporter_admin") {
    return (
      <>
        <StatCard
          color="bg-indigo-500"
          icon={Building2}
          label="管理工厂"
          value={factoriesCount}
        />
        <StatCard
          color="bg-emerald-500"
          icon={Users}
          label="团队成员"
          value={teamStats.teamSize}
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

  if (userRole === "factory_admin") {
    const factoryName = primaryFactory?.id ? "已分配" : "未分配";
    return (
      <>
        <StatCard
          color="bg-blue-500"
          icon={Factory}
          label="我的工厂"
          value={factoryName}
        />
        <StatCard
          color="bg-emerald-500"
          icon={Users}
          label="工厂业务员"
          value={teamStats.subordinatesCount}
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

  if (userRole === "salesperson") {
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
const RoleSpecificNotifications = ({ userRole }: { userRole?: string }) => {
  if (userRole === "exporter_admin") {
    return (
      <div className="space-y-4">
        <div className="flex gap-3 text-sm">
          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
          <p className="text-slate-600">有3个新工厂申请需要审核。</p>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
          <p className="text-slate-600">
            本月总销售额达到 ¥2.5M，同比增长 15%。
          </p>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
          <p className="text-slate-600">A工厂库存告急，请及时补货。</p>
        </div>
      </div>
    );
  }

  if (userRole === "factory_admin") {
    return (
      <div className="space-y-4">
        <div className="flex gap-3 text-sm">
          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
          <p className="text-slate-600">生产线A维护通知，预计停工2天。</p>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
          <p className="text-slate-600">本月产品质量合格率 98.5%。</p>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-green-500" />
          <p className="text-slate-600">新增2个国际订单，价值 ¥450K。</p>
        </div>
      </div>
    );
  }

  if (userRole === "salesperson") {
    return (
      <div className="space-y-4">
        <div className="flex gap-3 text-sm">
          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-green-500" />
          <p className="text-slate-600">客户 ABC Corp 已确认订单，准备发货。</p>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
          <p className="text-slate-600">有5个新的询盘需要跟进。</p>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
          <p className="text-slate-600">本月销售目标完成度 85%。</p>
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
  const { user, isLoading, role, getRoleDisplayName } = usePermissions();
  const organization = useOrganization();
  const team = useTeam();

  if (isLoading) {
    return <div>加载中...</div>;
  }

  const exporter = organization.getExporter();
  const roleDisplayName = role ? getRoleDisplayName(role) : "用户";

  return (
    <div className="space-y-6">
      {/* 欢迎信息 */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 font-bold text-2xl text-slate-900">
          欢迎回来，{user?.name || "用户"}！
        </h2>
        <p className="text-slate-600">
          {roleDisplayName} · {exporter?.name || "未分配出口商"}
        </p>
      </div>

      {/* 角色特定的统计信息 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <RoleSpecificStats userRole={role!} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 系统通知 */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-lg">系统通知</h3>
          <RoleSpecificNotifications userRole={role!} />
        </div>

        {/* 快速操作 */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-lg">快速操作</h3>
          <div className="space-y-3">
            {role === "exporter_admin" && (
              <>
                <a
                  className="block rounded-lg bg-slate-50 p-3 transition-colors hover:bg-slate-100"
                  href="/dashboard/users"
                >
                  <p className="font-medium text-slate-900">管理用户</p>
                  <p className="text-slate-500 text-sm">创建和管理业务员账号</p>
                </a>
                <a
                  className="block rounded-lg bg-slate-50 p-3 transition-colors hover:bg-slate-100"
                  href="/dashboard/factories"
                >
                  <p className="font-medium text-slate-900">管理工厂</p>
                  <p className="text-slate-500 text-sm">查看和管理所有工厂</p>
                </a>
              </>
            )}
            {role === "factory_admin" && (
              <>
                <a
                  className="block rounded-lg bg-slate-50 p-3 transition-colors hover:bg-slate-100"
                  href="/dashboard/products"
                >
                  <p className="font-medium text-slate-900">产品管理</p>
                  <p className="text-slate-500 text-sm">管理工厂产品</p>
                </a>
                <a
                  className="block rounded-lg bg-slate-50 p-3 transition-colors hover:bg-slate-100"
                  href="/dashboard/media"
                >
                  <p className="font-medium text-slate-900">媒体文件</p>
                  <p className="text-slate-500 text-sm">上传和管理产品图片</p>
                </a>
              </>
            )}
            {role === "salesperson" && (
              <>
                <a
                  className="block rounded-lg bg-slate-50 p-3 transition-colors hover:bg-slate-100"
                  href="/dashboard/inquiries"
                >
                  <p className="font-medium text-slate-900">客户询盘</p>
                  <p className="text-slate-500 text-sm">查看和回复客户询盘</p>
                </a>
                <a
                  className="block rounded-lg bg-slate-50 p-3 transition-colors hover:bg-slate-100"
                  href="/dashboard/orders"
                >
                  <p className="font-medium text-slate-900">订单管理</p>
                  <p className="text-slate-500 text-sm">跟踪订单状态</p>
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
