"use client";

import {
  Building2,
  FileBox,
  Image,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Tags,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";

const SidebarItem = ({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: any;
  label: string;
}) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
        isActive
          ? "bg-indigo-50 font-medium text-indigo-600"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
      href={href}
    >
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
};

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed z-10 hidden h-full w-64 flex-col border-slate-200 border-r bg-white md:flex">
        <div className="border-slate-100 border-b p-6">
          <div className="flex items-center gap-2 font-bold text-indigo-600 text-xl">
            <Package size={28} />
            <span>ShoeMatrix</span>
          </div>
          <p className="mt-1 text-slate-400 text-xs">B2B Management System</p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <div className="px-4 py-2 font-semibold text-slate-400 text-xs uppercase tracking-wider">
            Overview
          </div>
          <SidebarItem href="" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem href="/products" icon={ShoppingBag} label="Products" />

          <div className="mt-4 px-4 py-2 font-semibold text-slate-400 text-xs uppercase tracking-wider">
            Management
          </div>
          <SidebarItem href="/categories" icon={Tags} label="Categories" />
          <SidebarItem href="/factories" icon={Building2} label="Factories" />
          <SidebarItem href="/templates" icon={FileBox} label="Templates" />
          <SidebarItem href="/media" icon={Image} label="Media Library" />

          <div className="mt-4 px-4 py-2 font-semibold text-slate-400 text-xs uppercase tracking-wider">
            System
          </div>
          <SidebarItem href="/users" icon={Settings} label="Settings" />
        </nav>

        <div className="border-slate-100 border-t p-4">
          <button className="flex w-full items-center gap-3 px-4 py-2 font-medium text-slate-500 text-sm transition-colors hover:text-red-600">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden p-4 md:ml-64 md:p-8">
        {children}
      </main>
    </div>
  );
};
