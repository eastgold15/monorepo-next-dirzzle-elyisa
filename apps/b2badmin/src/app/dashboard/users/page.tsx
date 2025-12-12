"use client";

import { Settings } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function UsersPage() {
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
            <div className="flex items-center gap-3">
              <Settings className="text-slate-600" size={28} />
              <div>
                <h1 className="font-bold text-2xl text-slate-900">
                  User Settings
                </h1>
                <p className="mt-1 text-slate-500">
                  Manage system settings and user preferences.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="py-12 text-center">
                <Settings className="mx-auto mb-4 text-slate-400" size={48} />
                <h3 className="mb-2 font-medium text-lg text-slate-900">
                  Settings Page
                </h3>
                <p className="text-slate-500">
                  User management and system settings will be implemented here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
