"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

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
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              className="mr-2 data-[orientation=vertical]:h-4"
              orientation="vertical"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Overview</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="space-y-6">
            <h1 className="font-bold text-2xl text-slate-900">Dashboard</h1>
            <UserDashboard />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
