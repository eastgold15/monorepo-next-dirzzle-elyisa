"use client";

import { Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { CreateSKUModal } from "@/components/form/CreateSKUModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  type SkusRes,
  useProductsForSKU,
  useSkuDelete,
  useSkusList,
} from "@/hooks/api/skus";
import { useSiteCategoryStore } from "@/stores/site-category-store";

interface SKU {
  id: string;
  skuCode: string;
  price: number;
  marketPrice?: number;
  costPrice?: number;
  weight?: number;
  volume?: number;
  stock: number;
  specJson: Record<string, any>;
  status: number;
  productId: string;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    name: string;
    spuCode: string;
    siteCategoryId: string;
    siteCategory?: {
      name: string;
    };
  };
}

export default function SKUManagementPage() {
  const { data: skusData, isLoading, refetch } = useSkusList();

  const deleteMutation = useSkuDelete();
  const { data: productsData } = useProductsForSKU();

  const { getCategoryById } = useSiteCategoryStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProductId, setFilterProductId] = useState<string>("all");

  if (!skusData) {
    return null;
  }

  if (!productsData) {
    return null;
  }
  const handleDelete = async (ids: string | string[]) => {
    try {
      const idsToDelete = Array.isArray(ids) ? ids : [ids];
      await deleteMutation.mutateAsync(idsToDelete);
      toast.success(`成功删除 ${idsToDelete.length} 个SKU`);
      setSelectedIds(new Set());
      refetch();
    } catch (error) {
      toast.error("删除失败");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && skusData) {
      setSelectedIds(new Set(skusData.map((sku: SkusRes) => sku.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelect = (id: string, checked: boolean) => {
    const newSelectedIds = new Set(selectedIds);
    if (checked) {
      newSelectedIds.add(id);
    } else {
      newSelectedIds.delete(id);
    }
    setSelectedIds(newSelectedIds);
  };

  // 过滤 SKU
  const filteredSKUs =
    skusData.filter((sku: SkusRes) => {
      const matchesSearch =
        sku.skuCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sku.product?.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesProduct =
        filterProductId === "all" || sku.product.id === filterProductId;

      return matchesSearch && matchesProduct;
    }) || [];

  // 格式化规格 JSON
  const formatSpecs = (specJson: Record<string, any>) =>
    Object.entries(specJson)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");

  // 获取站点名称
  const getSiteCategoryName = (siteCategoryId: string) => {
    const category = getCategoryById(siteCategoryId);
    return category?.name || "未知分类";
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
              <p className="mt-2 text-slate-500">加载中...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator className="mr-2 h-4" orientation="vertical" />
            <nav className="font-medium text-sm">SKU管理</nav>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          {/* 页面头部 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-3xl text-slate-900">SKU管理</h1>
              <p className="mt-2 text-slate-600">
                管理商品SKU库存、价格和规格信息
              </p>
            </div>

            <div className="flex items-center gap-3">
              {selectedIds.size > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      批量删除 ({selectedIds.size})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认批量删除</AlertDialogTitle>
                      <AlertDialogDescription>
                        确定要删除选中的 {selectedIds.size}{" "}
                        个SKU吗？此操作不可撤销。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(Array.from(selectedIds))}
                      >
                        删除
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              <Button
                className="bg-indigo-600 text-white hover:bg-indigo-700"
                onClick={() => {
                  setSelectedProduct(null);
                  setIsCreateModalOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                批量创建SKU
              </Button>
            </div>
          </div>

          {/* 搜索和筛选栏 */}
          <div className="flex items-center gap-4">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-10"
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索SKU编码或商品名称..."
                value={searchTerm}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-600 text-sm">商品筛选：</span>
              <Select
                onValueChange={setFilterProductId}
                value={filterProductId || "all"}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="选择商品" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部商品</SelectItem>
                  {productsData.data.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* SKU列表 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>SKU列表</CardTitle>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    checked={
                      selectedIds.size > 0 && skusData
                        ? selectedIds.size === skusData.length
                        : false
                    }
                    className="rounded border-slate-300 text-slate-600 focus:ring-2 focus:ring-indigo-500"
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    type="checkbox"
                  />
                  全选
                  <span className="text-slate-500">
                    ({selectedIds.size}/{skusData?.length || 0})
                  </span>
                </label>
              </div>
            </CardHeader>
            <CardContent>
              {filteredSKUs.length === 0 ? (
                <div className="px-8 py-12 text-center">
                  <div className="mb-6">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                      <Plus className="h-8 w-8 text-slate-400" />
                    </div>
                  </div>
                  <h3 className="mb-2 font-semibold text-slate-900 text-xl">
                    {searchTerm ? "未找到匹配的SKU" : "暂无SKU数据"}
                  </h3>
                  <p className="mx-auto mb-6 max-w-md text-slate-500">
                    {searchTerm
                      ? "请尝试其他搜索关键词"
                      : "创建第一个SKU来开始管理商品库存"}
                  </p>
                  {!searchTerm && (
                    <Button
                      className="bg-indigo-600 text-white hover:bg-indigo-700"
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      批量创建SKU
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSKUs.map((sku: SkusRes) => (
                    <div
                      className="flex items-center gap-4 rounded-lg border p-4"
                      key={sku.id}
                    >
                      <input
                        checked={selectedIds.has(sku.id)}
                        className="rounded border-slate-300 text-slate-600 focus:ring-2 focus:ring-indigo-500"
                        onChange={(e) => handleSelect(sku.id, e.target.checked)}
                        type="checkbox"
                      />

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium text-slate-900">
                              {sku.skuCode}
                            </p>
                            <p className="text-slate-500 text-sm">
                              {sku.product?.name}
                            </p>
                          </div>
                          {/* <Badge variant="secondary">
                            {sku.siteCategoryId?.name || "未分类"}
                          </Badge> */}
                        </div>

                        <div className="flex items-center gap-6 text-sm">
                          <div>
                            <span className="text-slate-500">售价：</span>
                            <span className="font-medium">¥{sku.price}</span>
                          </div>
                          {/* {sku.marketPrice && (
                            <div>
                              <span className="text-slate-500">市场价：</span>
                              <span className="text-slate-700">
                                ¥{sku.marketPrice}
                              </span>
                            </div>
                          )} */}
                          <div>
                            <span className="text-slate-500">库存：</span>
                            <span
                              className={`font-medium ${sku.stock <= 10 ? "text-red-600" : "text-green-600"}`}
                            >
                              {sku.stock}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">规格：</span>
                            <span className="text-slate-700">
                              {formatSpecs(sku.specJson)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setSelectedProduct({
                              id: sku.product?.id || "",
                              name: sku.product?.name || "",
                            });
                            setIsCreateModalOpen(true);
                          }}
                          size="sm"
                          variant="outline"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              size="sm"
                              variant="ghost"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确认删除</AlertDialogTitle>
                              <AlertDialogDescription>
                                确定要删除SKU "{sku.skuCode}"
                                吗？此操作不可撤销。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(sku.id)}
                              >
                                删除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>

      {/* 创建SKU对话框 */}
      <CreateSKUModal
        onOpenChange={(open) => {
          setIsCreateModalOpen(open);
        }}
        onSuccess={() => {
          refetch();
        }}
        open={isCreateModalOpen}
        productId={selectedProduct?.id}
      />
    </SidebarProvider>
  );
}
