"use client";

import { AlertCircle, Package, TrendingUp, Users } from "lucide-react";
import Image from "next/image";
import { AdminLayout } from "@/components/admin/AdminLayout";

// Mock data - in real app, this would fetch from API
const INITIAL_PRODUCTS = [
  {
    id: "1",
    name: "SpeedDemon 2025",
    status: "active",
    skus: [{ image: "/api/placeholder/100/100" }],
  },
  {
    id: "2",
    name: "Urban Walker Pro",
    status: "draft",
    skus: [{ image: "/api/placeholder/100/100" }],
  },
];

const INITIAL_TEMPLATES = [
  { id: "1", name: "Summer Collection" },
  { id: "2", name: "Winter Sports" },
];

const StatCard = ({ label, value, icon: Icon, color }: any) => (
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

export default function Dashboard() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="font-bold text-2xl text-slate-900">Dashboard</h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            color="bg-indigo-500"
            icon={Package}
            label="Total Products"
            value={INITIAL_PRODUCTS.length}
          />
          <StatCard
            color="bg-emerald-500"
            icon={TrendingUp}
            label="Active Templates"
            value={INITIAL_TEMPLATES.length}
          />
          <StatCard
            color="bg-amber-500"
            icon={AlertCircle}
            label="Pending Review"
            value="12"
          />
          <StatCard
            color="bg-blue-500"
            icon={Users}
            label="Active Users"
            value="8"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-semibold text-lg">Recent Products</h3>
            <div className="space-y-4">
              {INITIAL_PRODUCTS.map((p) => (
                <div
                  className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                  key={p.id}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-md bg-slate-200">
                      <Image
                        alt=""
                        className="h-full w-full object-cover"
                        height={100}
                        src={
                          p.skus[0]?.image ||
                          `https://picsum.photos/seed/${p.id}/100`
                        }
                        width={100}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{p.name}</p>
                      <p className="text-slate-500 text-xs">
                        {p.skus.length} variants
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-green-100 px-2 py-1 font-medium text-green-700 text-xs capitalize">
                    {p.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-semibold text-lg">System Notifications</h3>
            <div className="space-y-4">
              <div className="flex gap-3 text-sm">
                <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                <p className="text-slate-600">
                  New template "Summer Sandals" needs approval.
                </p>
              </div>
              <div className="flex gap-3 text-sm">
                <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-amber-500" />
                <p className="text-slate-600">
                  Low stock alert for SKU-001 (SpeedDemon 2025).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
