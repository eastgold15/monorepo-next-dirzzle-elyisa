"use client";

import { Edit, Plus, Search } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { MediaUpload } from "@/components/MediaUpload";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  useProductsBatchDelete,
  useProductsCreate,
  useProductsDelete,
  useProductsList,
  useProductsUpdate,
} from "@/hooks/api/products";
import { useSiteCategories } from "@/hooks/api/site-category";

interface Product {
  id: string;
  name: string;
  spuCode: string;
  description?: string;
  status: number;
  siteCategoryId: string;
  sitePrice?: string;
  siteName?: string;
  siteDescription?: string;
  imageIds?: string[];
  mainImageId?: string;
  images?: Array<{
    id: string;
    url: string;
    alt?: string;
  }>;
  mainImage?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  children?: Category[];
}

// 创建/编辑商品对话框
function ProductDialog({
  product,
  isOpen,
  onClose,
}: {
  product?: Product;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { data: categories } = useSiteCategories();

  const [formData, setFormData] = useState({
    name: product?.name || "",
    spuCode: product?.spuCode || "",
    description: product?.description || "",
    siteCategoryId: product?.siteCategoryId || "",
    price: product?.sitePrice || "",
    siteName: product?.siteName || "",
    siteDescription: product?.siteDescription || "",
    imageIds: product?.imageIds || [],
    mainImageId: product?.mainImageId || "",
  });

  const createMutation = useProductsCreate();
  const updateMutation = useProductsUpdate();
  const isEdit = !!product;

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("商品名称不能为空");
      return;
    }
    if (!formData.spuCode.trim()) {
      toast.error("商品编码不能为空");
      return;
    }
    if (!formData.siteCategoryId) {
      toast.error("请选择商品分类");
      return;
    }

    try {
      const submitData = {
        name: formData.name,
        spuCode: formData.spuCode,
        description: formData.description || undefined,
        siteCategoryId: formData.siteCategoryId,
        price: formData.price ? Number(formData.price) : undefined,
        siteName: formData.siteName || undefined,
        siteDescription: formData.siteDescription || undefined,
        imageIds: formData.imageIds,
        mainImageId: formData.mainImageId || undefined,
      };

      if (isEdit && product) {
        await updateMutation.mutateAsync({
          id: product.id,
          data: submitData,
        });
        toast.success("商品更新成功");
      } else {
        await createMutation.mutateAsync(submitData);
        toast.success("商品创建成功");
      }
      onClose();
    } catch (error) {
      toast.error(isEdit ? "商品更新失败" : "商品创建失败");
    }
  };

  return (
    <Dialog onOpenChange={onClose} open={isOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑商品" : "创建商品"}</DialogTitle>
          <DialogDescription>
            填写商品信息。带 * 的字段为必填项。
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(100vh-200px)] space-y-6 overflow-y-auto py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                商品名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="请输入商品名称"
                value={formData.name}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spuCode">
                商品编码 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="spuCode"
                onChange={(e) =>
                  setFormData({ ...formData, spuCode: e.target.value })
                }
                placeholder="请输入商品编码"
                value={formData.spuCode}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">商品描述</Label>
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              id="description"
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="请输入商品描述"
              rows={3}
              value={formData.description}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siteCategoryId">
                商品分类 <span className="text-red-500">*</span>
              </Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                id="siteCategoryId"
                onChange={(e) =>
                  setFormData({ ...formData, siteCategoryId: e.target.value })
                }
                value={formData.siteCategoryId}
              >
                <option value="">请选择分类</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">商品价格</Label>
              <Input
                id="price"
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="0.00"
                step="0.01"
                type="number"
                value={formData.price}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteName">展示名称</Label>
            <Input
              id="siteName"
              onChange={(e) =>
                setFormData({ ...formData, siteName: e.target.value })
              }
              placeholder="商品在前端的展示名称（可选）"
              value={formData.siteName}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteDescription">展示描述</Label>
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              id="siteDescription"
              onChange={(e) =>
                setFormData({ ...formData, siteDescription: e.target.value })
              }
              placeholder="商品在前端的展示描述（可选）"
              rows={3}
              value={formData.siteDescription}
            />
          </div>

          <div className="space-y-2">
            <Label>商品图片</Label>
            <MediaUpload
              maxCount={5}
              onChange={(mediaIds) =>
                setFormData({ ...formData, imageIds: mediaIds })
              }
              value={formData.imageIds}
            />
          </div>

          <div className="space-y-2">
            <Label>主图设置</Label>
            <MediaUpload
              maxCount={1}
              onChange={(mediaIds) =>
                setFormData({ ...formData, mainImageId: mediaIds[0] || "" })
              }
              value={formData.mainImageId ? [formData.mainImageId] : []}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button onClick={onClose} variant="outline">
            取消
          </Button>
          <Button
            disabled={createMutation.isPending || updateMutation.isPending}
            onClick={handleSubmit}
          >
            {createMutation.isPending || updateMutation.isPending
              ? "处理中..."
              : isEdit
                ? "更新"
                : "创建"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ProductsPage() {
  const { data: productsData, isLoading, refetch } = useProductsList();
  const deleteMutation = useProductsDelete();
  const batchDeleteMutation = useProductsBatchDelete();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleDelete = async (product: Product) => {
    try {
      await deleteMutation.mutateAsync(product.id);
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
      setSelectedIds(new Set(productsData.map((p) => p.id)));
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
    productsData?.filter(
      (product) =>
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

              <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-indigo-600 text-white hover:bg-indigo-700">
                    <Plus className="mr-2 h-4 w-4" />
                    添加商品
                  </Button>
                </DialogTrigger>
              </Dialog>
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
                      onClick={() => setIsDialogOpen(true)}
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
                      className="flex items-center justify-between rounded-lg border p-4 hover:bg-slate-50"
                      key={product.id}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          checked={selectedIds.has(product.id)}
                          className="rounded"
                          onChange={(e) =>
                            handleSelect(product.id, e.target.checked)
                          }
                          type="checkbox"
                        />
                        {product.mainImage && (
                          <Image
                            alt={product.name}
                            className="h-16 w-16 rounded object-cover"
                            height={64}
                            src={product.mainImage}
                            width={64}
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-slate-900">
                              {product.name}
                            </h3>
                            <Badge
                              variant={
                                product.status === 1 ? "default" : "secondary"
                              }
                            >
                              {product.status === 1 ? "已发布" : "草稿"}
                            </Badge>
                          </div>
                          <p className="text-slate-500 text-sm">
                            编码: {product.spuCode}
                          </p>
                          {product.sitePrice && (
                            <p className="font-medium text-slate-700 text-sm">
                              价格: ¥{product.sitePrice}
                            </p>
                          )}
                          {product.siteDescription && (
                            <p className="mt-1 text-slate-600 text-sm">
                              {product.siteDescription}
                            </p>
                          )}
                        </div>
                      </div>
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>

      {/* 创建/编辑商品对话框 */}
      <ProductDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingProduct(undefined);
        }}
        product={editingProduct}
      />
    </SidebarProvider>
  );
}
