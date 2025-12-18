"use client";

import {
  BarChart3,
  DollarSign,
  Package,
  TrendingUp,
  Users,
} from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { CanViewAnalytics } from "@/components/auth/PermissionGuard";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePermissions } from "@/hooks/use-permissions";

// Mock analytics data
const generateMockData = (role: string | null) => {
  const baseData = {
    totalProducts:
      role === "salesperson" ? 12 : role === "factory_admin" ? 156 : 1247,
    totalOrders:
      role === "salesperson" ? 28 : role === "factory_admin" ? 892 : 5634,
    totalRevenue:
      role === "salesperson"
        ? 12_840
        : role === "factory_admin"
          ? 456_780
          : 3_456_789,
    totalUsers:
      role === "salesperson" ? 1 : role === "factory_admin" ? 45 : 234,
  };

  // Generate monthly data based on role scope
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const monthlyData = months.map((month, index) => ({
    month,
    sales:
      role === "salesperson"
        ? Math.floor(Math.random() * 5000) + 1000
        : role === "factory_admin"
          ? Math.floor(Math.random() * 50_000) + 20_000
          : Math.floor(Math.random() * 200_000) + 100_000,
    orders:
      role === "salesperson"
        ? Math.floor(Math.random() * 10) + 2
        : role === "factory_admin"
          ? Math.floor(Math.random() * 200) + 50
          : Math.floor(Math.random() * 1000) + 200,
  }));

  return {
    ...baseData,
    monthlyData,
  };
};

export default function AnalyticsPage() {
  const { role, dataScope, getAccessibleFactoryIds } = usePermissions();

  const mockData = generateMockData(role);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <CanViewAnalytics
      fallback={
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator className="mr-2 h-4" orientation="vertical" />
                <nav className="font-medium text-sm">Analytics</nav>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                  <BarChart3
                    className="mx-auto mb-4 text-slate-400"
                    size={48}
                  />
                  <h3 className="mb-2 font-medium text-lg text-slate-900">
                    Access Restricted
                  </h3>
                  <p className="text-slate-500">
                    You don't have permission to view analytics.
                  </p>
                  <p className="mt-2 text-slate-400 text-sm">
                    This feature is available to administrators only.
                  </p>
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      }
    >
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator className="mr-2 h-4" orientation="vertical" />
              <nav className="font-medium text-sm">Analytics</nav>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h1 className="font-bold text-2xl text-slate-900">
                  Analytics Dashboard
                </h1>
                <p className="mt-1 text-slate-500">
                  Track your business performance and metrics.
                  <span className="ml-2 rounded-full bg-indigo-50 px-2 py-1 font-medium text-indigo-700 text-xs">
                    Viewing as:{" "}
                    {role?.replace("_", " ").toUpperCase() || "GUEST"}
                  </span>
                </p>
                {dataScope.products !== "all" && (
                  <p className="mt-2 text-slate-400 text-sm">
                    Data scope is limited to your accessible resources
                  </p>
                )}
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm">Total Products</p>
                      <p className="font-bold text-2xl text-slate-900">
                        {mockData.totalProducts}
                      </p>
                    </div>
                    <div className="rounded-full bg-blue-100 p-3">
                      <Package className="text-blue-600" size={20} />
                    </div>
                  </div>
                  {role === "salesperson" && (
                    <p className="mt-2 text-slate-400 text-xs">
                      Your uploaded products
                    </p>
                  )}
                  {role === "factory_admin" && (
                    <p className="mt-2 text-slate-400 text-xs">
                      Products from your factories
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm">Total Orders</p>
                      <p className="font-bold text-2xl text-slate-900">
                        {mockData.totalOrders}
                      </p>
                    </div>
                    <div className="rounded-full bg-green-100 p-3">
                      <TrendingUp className="text-green-600" size={20} />
                    </div>
                  </div>
                  <p className="mt-2 text-green-600 text-xs">
                    +12% from last month
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm">Revenue</p>
                      <p className="font-bold text-2xl text-slate-900">
                        {formatCurrency(mockData.totalRevenue)}
                      </p>
                    </div>
                    <div className="rounded-full bg-yellow-100 p-3">
                      <DollarSign className="text-yellow-600" size={20} />
                    </div>
                  </div>
                  <p className="mt-2 text-green-600 text-xs">
                    +8% from last month
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm">Active Users</p>
                      <p className="font-bold text-2xl text-slate-900">
                        {mockData.totalUsers}
                      </p>
                    </div>
                    <div className="rounded-full bg-purple-100 p-3">
                      <Users className="text-purple-600" size={20} />
                    </div>
                  </div>
                  {role === "exporter_admin" && (
                    <p className="mt-2 text-slate-400 text-xs">
                      All users in system
                    </p>
                  )}
                  {role === "factory_admin" && (
                    <p className="mt-2 text-slate-400 text-xs">
                      Users in your factories
                    </p>
                  )}
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Sales Chart */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 font-semibold text-lg">Sales Overview</h3>
                  <div className="space-y-3">
                    {mockData.monthlyData.map((data, index) => (
                      <div className="flex items-center gap-3" key={data.month}>
                        <span className="w-12 font-medium text-slate-600 text-sm">
                          {data.month}
                        </span>
                        <div className="flex-1 rounded-full bg-slate-100">
                          <div
                            className="h-6 rounded-full bg-indigo-500 text-white text-xs leading-6"
                            style={{
                              width: `${(data.sales / (mockData.monthlyData.reduce((max, d) => Math.max(max, d.sales), 0) || 1)) * 100}%`,
                            }}
                          >
                            <span className="ml-2">
                              {formatCurrency(data.sales)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Orders Chart */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 font-semibold text-lg">Orders Trend</h3>
                  <div className="space-y-3">
                    {mockData.monthlyData.map((data, index) => (
                      <div className="flex items-center gap-3" key={data.month}>
                        <span className="w-12 font-medium text-slate-600 text-sm">
                          {data.month}
                        </span>
                        <div className="flex-1 rounded-full bg-slate-100">
                          <div
                            className="h-6 rounded-full bg-green-500 text-white text-xs leading-6"
                            style={{
                              width: `${(data.orders / (mockData.monthlyData.reduce((max, d) => Math.max(max, d.orders), 0) || 1)) * 100}%`,
                            }}
                          >
                            <span className="ml-2">{data.orders} orders</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Permission Notice */}
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                <h4 className="font-medium text-indigo-900">
                  Data Access Level
                </h4>
                <p className="mt-1 text-indigo-700 text-sm">
                  You are currently viewing analytics with{" "}
                  <strong>{role?.replace("_", " ")}</strong> privileges.
                  {dataScope.products === "factory" &&
                    " Data is limited to your factory's performance."}
                  {dataScope.products === "own" &&
                    " Data is limited to your personal performance metrics."}
                </p>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </CanViewAnalytics>
  );
}
