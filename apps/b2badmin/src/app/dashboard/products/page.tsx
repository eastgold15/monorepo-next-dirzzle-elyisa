"use client";

import { Edit, Plus, Search, Video } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { CreateProductModal } from "@/components/form/CreateProductModal";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  useProductsBatchDelete,
  useProductsList,
} from "@/hooks/api/products";

// 使用后端返回的类型
interface Product {
  id: string;
  name: string;
  spuCode: string;
  description: string | null;
  status: number;
  units: string | null;
  createdAt: Date;
  updatedAt: Date;
  sitePrice: string | null;
  siteName: string | null;
  siteDescription: string | null;
  siteCategoryId: string | null;
  templateId: string | null;
  // 媒体 ID（用于编辑）
  mediaIds: string[];
  videoIds: string[];
  // 媒体数据
  images: Array<{
    id: string;
    url: string;
    originalName: string;
    mimeType: string;
    isMain: boolean;
    sortOrder: number;
  }>;
  videos: Array<{
    id: string;
    url: string;
    originalName: string;
    mimeType: string;
    thumbnailUrl: string | null;
  }>;
  mainImage: string | null;
  mainImageId: string | null;
  // SKU 数据
  skus: Array<{
    id: string;
    skuCode: string;
    price: string;
    stock: string;
    specJson: any;
    status: number;
  }>;
  skuCount: number;
}

export default function ProductsPage() {
  const {
    data: productsData,
    isLoading,
    refetch,
  } = useProductsList({
    page: 1,
    limit: 100,
  });
  const batchDeleteMutation = useProductsBatchDelete();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsCreateModalOpen(true);
  };

  const handleDelete = async (product: Product) => {
    try {
      // 使用批量删除方法（单个ID作为数组传递）
      await batchDeleteMutation.mutateAsync([product.id]);
      toast.success("商品删除成功");
      refetch();
    } catch (error) {
      toast.error("商品删除失败");
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) {
      toast.error("请选择要删除的商品");
      return;
    }

    try {
      await batchDeleteMutation.mutateAsync(Array.from(selectedIds));
      toast.success(`成功删除 ${selectedIds.size} 个商品`);
      setSelectedIds(new Set());
      refetch();
    } catch (error) {
      toast.error("批量删除失败");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && productsData) {
      setSelectedIds(new Set(productsData.data.map((p: Product) => p.id)));
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

  // 过滤商品
  const filteredProducts =
    productsData?.data.filter(
      (product: Product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.spuCode.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

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
            <nav className="font-medium text-sm">商品管理</nav>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          {/* 页面头部 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-3xl text-slate-900">商品管理</h1>
              <p className="mt-2 text-slate-600">
                管理站点商品信息，支持分类管理、价格设置等功能。
              </p>
            </div>

            <div className="flex items-center gap-3">
              {selectedIds.size > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      批量删除 ({selectedIds.size})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认批量删除</AlertDialogTitle>
                      <AlertDialogDescription>
                        确定要删除选中的 {selectedIds.size}{" "}
                        个商品吗？此操作不可撤销。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction onClick={handleBatchDelete}>
                        删除
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              <Button
                className="bg-indigo-600 text-white hover:bg-indigo-700"
                onClick={() => {
                  setEditingProduct(undefined);
                  setIsCreateModalOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                添加商品
              </Button>
            </div>
          </div>

          {/* 搜索栏 */}
          <Card>
            <CardHeader>
              <CardTitle>搜索商品</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  className="pl-10"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索商品名称或编码..."
                  value={searchTerm}
                />
              </div>
            </CardContent>
          </Card>

          {/* 商品列表 */}
          <Card>
            {filteredProducts.length > 0 && (
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>商品列表</CardTitle>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      checked={selectedIds.size === filteredProducts.length}
                      className="rounded"
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      type="checkbox"
                    />
                    全选
                    <span className="text-slate-500">
                      ({selectedIds.size}/{filteredProducts.length})
                    </span>
                  </label>
                </div>
              </CardHeader>
            )}

            <CardContent>
              {filteredProducts.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 h-12 w-12 text-slate-300">
                    <Search />
                  </div>
                  <h3 className="mb-2 font-semibold text-slate-900 text-xl">
                    {searchTerm ? "未找到匹配的商品" : "暂无商品"}
                  </h3>
                  <p className="mx-auto mb-6 max-w-md text-slate-500">
                    {searchTerm
                      ? "请尝试其他搜索关键词"
                      : "创建第一个商品来开始管理您的商品目录"}
                  </p>
                  {!searchTerm && (
                    <Button
                      className="bg-indigo-600 text-white hover:bg-indigo-700"
                      onClick={() => {
                        setEditingProduct(undefined);
                        setIsCreateModalOpen(true);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      创建商品
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProducts.map((product) => (
                    <div
                      className="rounded-lg border bg-white p-4 hover:bg-slate-50"
                      key={product.id}
                    >
                      {/* 商品头部 */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <input
                            checked={selectedIds.has(product.id)}
                            className="mt-1 rounded"
                            onChange={(e) =>
                              handleSelect(product.id, e.target.checked)
                            }
                            type="checkbox"
                          />
                          {/* 主图 */}
                          <div className="relative h-20 w-20 flex-shrink-0">
                            {product.mainImage ? (
                              <Image
                                alt={product.name}
                                className="h-full w-full rounded object-cover"
                                fill
                                sizes="80px"
                                src={product.mainImage}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center rounded bg-slate-100">
                                <span className="text-slate-400 text-xs">
                                  无图片
                                </span>
                              </div>
                            )}
                            {/* 图片数量标记 */}
                            {product.images.length > 1 && (
                              <div className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-xs">
                                {product.images.length}
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-lg text-slate-900">
                                {product.name}
                              </h3>
                              <Badge
                                variant={
                                  product.status === 1 ? "default" : "secondary"
                                }
                              >
                                {product.status === 1 ? "已发布" : "草稿"}
                              </Badge>
                              {/* 视频标记 */}
                              {product.videos.length > 0 && (
                                <Badge
                                  className="flex items-center gap-1"
                                  variant="outline"
                                >
                                  <Video className="h-3 w-3" />
                                  {product.videos.length}
                                </Badge>
                              )}
                              {/* SKU 数量 */}
                              {product.skuCount > 0 && (
                                <Badge variant="secondary">
                                  {product.skuCount} SKU
                                </Badge>
                              )}
                            </div>

                            <p className="text-slate-500 text-sm">
                              编码: {product.spuCode}
                            </p>

                            {/* 描述 */}
                            {product.description && (
                              <p className="mt-1 line-clamp-1 text-slate-600 text-sm">
                                {product.description}
                              </p>
                            )}

                            {/* 价格范围 */}
                            {product.skus.length > 0 ? (
                              <p className="mt-2 font-medium text-indigo-600 text-sm">
                                ¥
                                {Math.min(
                                  ...product.skus.map((s) =>
                                    Number.parseFloat(s.price)
                                  )
                                )}
                                {product.skus.length > 1 &&
                                  ` - ¥${Math.max(...product.skus.map((s) => Number.parseFloat(s.price)))}`}
                              </p>
                            ) : product.sitePrice ? (
                              <p className="mt-2 font-medium text-indigo-600 text-sm">
                                ¥{product.sitePrice}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleEdit(product)}
                            size="sm"
                            variant="outline"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                删除
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>确认删除</AlertDialogTitle>
                                <AlertDialogDescription>
                                  确定要删除商品 "{product.name}"
                                  吗？此操作不可撤销。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(product)}
                                >
                                  删除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      {/* 媒体缩略图 */}
                      {(product.images.length > 0 ||
                        product.videos.length > 0) && (
                        <div className="mt-4 border-t pt-3">
                          <div className="flex items-center gap-2 overflow-x-auto">
                            {/* 图片缩略图 */}
                            {product.images.slice(0, 5).map((image) => (
                              <div
                                className="relative h-12 w-12 flex-shrink-0 rounded border-2"
                                key={image.id}
                                style={{
                                  borderColor: image.isMain
                                    ? "rgb(79 70 229)"
                                    : "rgb(226 232 240)",
                                }}
                              >
                                <Image
                                  alt={image.originalName}
                                  className="h-full w-full rounded object-cover"
                                  fill
                                  sizes="48px"
                                  src={image.url}
                                />
                                {image.isMain && (
                                  <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-white text-xs">
                                    ★
                                  </div>
                                )}
                              </div>
                            ))}
                            {/* 视频缩略图 */}
                            {product.videos.slice(0, 3).map((video) => (
                              <div
                                className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded bg-slate-100"
                                key={video.id}
                              >
                                <Video className="h-5 w-5 text-slate-500" />
                                <span className="absolute right-0 bottom-0 text-slate-500 text-xs">
                                  ▶
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SKU 信息 */}
                      {product.skus.length > 0 && (
                        <div className="mt-3 border-t pt-3">
                          <p className="mb-2 font-medium text-slate-600 text-xs">
                            SKU 规格 ({product.skuCount})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {product.skus.map((sku) => (
                              <div
                                className="flex items-center gap-2 rounded border bg-slate-50 px-3 py-1.5 text-xs"
                                key={sku.id}
                              >
                                <span className="font-medium text-slate-900">
                                  {sku.skuCode}
                                </span>
                                <span className="text-slate-500">
                                  {Object.entries(sku.specJson || {}).map(
                                    ([key, value]) => (
                                      <span className="mr-1" key={key}>
                                        {key}: {value}
                                      </span>
                                    )
                                  )}
                                </span>
                                <span className="font-medium text-indigo-600">
                                  ¥{sku.price}
                                </span>
                                <span className="text-slate-500">
                                  库存: {sku.stock}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>

      {/* 创建/编辑商品对话框 */}
      <CreateProductModal
        onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) {
            setEditingProduct(undefined);
          }
        }}
        onSuccess={() => {
          // 刷新数据
          refetch();
        }}
        open={isCreateModalOpen}
        product={editingProduct}
      />
    </SidebarProvider>
  );
}
