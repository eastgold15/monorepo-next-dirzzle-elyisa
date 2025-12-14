"use client";

import { Edit, Plus, Search } from "lucide-react";
import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import { CanCreateProducts } from "@/components/auth/PermissionGuard";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePermissions } from "@/hooks/api/user";

// Mock data - in real app, this would fetch from API
const INITIAL_PRODUCTS = [
  {
    id: "1",
    name: "SpeedDemon 2025",
    status: "published",
    categoryId: "1",
    factoryId: "1",
    baseData: {
      brand: "Nike",
    },
    skus: [
      { image: "/api/placeholder/100/100", stock: 100 },
      { image: "/api/placeholder/100/100", stock: 50 },
    ],
  },
  {
    id: "2",
    name: "Urban Walker Pro",
    status: "draft",
    categoryId: "2",
    factoryId: "2",
    baseData: {
      brand: "Adidas",
    },
    skus: [{ image: "/api/placeholder/100/100", stock: 75 }],
  },
];

const INITIAL_CATEGORIES = [
  { id: "1", name: "Running Shoes" },
  { id: "2", name: "Casual Shoes" },
];

const INITIAL_FACTORIES = [
  { id: "1", name: "Factory A - Shanghai" },
  { id: "2", name: "Factory B - Guangzhou" },
];

export default function ProductList() {
  const { role, dataScope, getAccessibleFactoryIds } = usePermissions();

  const getCategoryName = (id: string) =>
    INITIAL_CATEGORIES.find((c) => c.id === id)?.name || "Unknown";
  const getFactoryName = (id: string) =>
    INITIAL_FACTORIES.find((f) => f.id === id)?.name || "Unknown";

  // 根据用户权限过滤商品
  const getFilteredProducts = () => {
    if (dataScope.products === "all") {
      return INITIAL_PRODUCTS;
    }

    if (dataScope.products === "factory") {
      const factoryIds = getAccessibleFactoryIds();
      return INITIAL_PRODUCTS.filter((p) => factoryIds.includes(p.factoryId));
    }

    // 业务员只能看到自己的商品（这里需要根据实际业务逻辑调整）
    return INITIAL_PRODUCTS; // 暂时显示所有
  };

  const filteredProducts = getFilteredProducts();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator className="mr-2 h-4" orientation="vertical" />
            <nav className="font-medium text-sm">Products</nav>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-bold text-2xl text-slate-900">Products</h1>
                <p className="mt-1 text-slate-500">
                  Manage your product catalog and inventory.
                </p>
              </div>
              {/* 根据权限显示创建按钮 */}
              <CanCreateProducts>
                <Link
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-indigo-700"
                  href="/dashboard/products/create"
                >
                  <Plus size={18} />
                  <span>Create Product</span>
                </Link>
              </CanCreateProducts>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex gap-4 border-b p-4">
                <div className="relative max-w-md flex-1">
                  <Search
                    className="-translate-y-1/2 absolute top-1/2 left-3 text-slate-400"
                    size={18}
                  />
                  <input
                    className="w-full rounded-lg border border-slate-300 py-2 pr-4 pl-10 outline-none focus:border-indigo-500"
                    placeholder="Search products..."
                    type="text"
                  />
                </div>
              </div>

              <table className="w-full text-left">
                <thead className="border-slate-200 border-b bg-slate-50 font-semibold text-slate-500 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Factory</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => (
                    <tr className="hover:bg-slate-50" key={p.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 overflow-hidden rounded bg-slate-100">
                            <img
                              alt=""
                              className="h-full w-full object-cover"
                              src={
                                p.skus[0]?.image ||
                                `https://picsum.photos/seed/${p.id}/100`
                              }
                            />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">
                              {p.name}
                            </div>
                            <div className="text-slate-500 text-xs">
                              {p.baseData.brand}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        {getCategoryName(p.categoryId)}
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        <span
                          className="cursor-help border-slate-400 border-b border-dotted"
                          title={getFactoryName(p.factoryId)}
                        >
                          {getFactoryName(p.factoryId).substring(0, 15)}...
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2 py-1 font-medium text-xs capitalize ${
                            p.status === "published"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {p.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        {p.skus.reduce((acc, sku) => acc + sku.stock, 0)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {/* 编辑按钮根据权限显示 */}
                        <CanCreateProducts>
                          <button className="text-slate-400 transition-colors hover:text-indigo-600">
                            <Edit size={18} />
                          </button>
                        </CanCreateProducts>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
