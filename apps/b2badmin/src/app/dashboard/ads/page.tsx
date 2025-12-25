"use client";

import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  Edit,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Plus,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediaSelect } from "@/components/ui/media-select";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useAdsBatchDelete,
  useAdsCreate,
  useAdsDelete,
  useAdsList,
  useAdsUpdate,
} from "@/hooks/api/ads";

// 广告类型
interface Ad {
  id: string;
  title: string;
  description: string;
  type: "banner" | "carousel" | "list" | undefined;
  link: string;
  position: "home-top" | "home-middle" | "sidebar" | null | undefined;
  startDate: string;
  endDate: string;
  sortOrder: number;
  isActive: boolean;
  mediaId: string;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

// 广告类型映射
const AD_TYPE_LABELS = {
  banner: "横幅广告",
  carousel: "轮播图",
  list: "列表广告",
} as const;

// 广告位置映射
const AD_POSITION_LABELS = {
  "home-top": "首页顶部",
  "home-middle": "首页中部",
  sidebar: "侧边栏",
} as const;

// 创建/编辑广告对话框
function AdsDialog({
  ad,
  isOpen,
  onClose,
}: {
  ad?: Ad;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    title: ad?.title || "",
    description: ad?.description || "",
    type: ad?.type || "banner",
    position: ad?.position || "home-top",
    link: ad?.link || "",
    sortOrder: ad?.sortOrder || 0,
    isActive: ad?.isActive ?? true,
    startDate: ad?.startDate
      ? format(new Date(ad.startDate), "yyyy-MM-dd'T'HH:mm")
      : "",
    endDate: ad?.endDate
      ? format(new Date(ad.endDate), "yyyy-MM-dd'T'HH:mm")
      : "",
    mediaId: ad?.mediaId || "",
  });

  const createMutation = useAdsCreate();
  const updateMutation = useAdsUpdate();

  const isEdit = !!ad;

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("广告标题不能为空");
      return;
    }
    if (!formData.link.trim()) {
      toast.error("广告链接不能为空");
      return;
    }

    try {
      const submitData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        link: formData.link,
        position: formData.position,
        startDate: formData.startDate
          ? new Date(formData.startDate).toISOString()
          : new Date().toISOString(),
        endDate: formData.endDate
          ? new Date(formData.endDate).toISOString()
          : new Date().toISOString(),
        sortOrder: formData.sortOrder,
        isActive: formData.isActive,
        mediaId: formData.mediaId,
      };

      if (isEdit && ad) {
        await updateMutation.mutateAsync({
          id: ad.id,
          data: submitData,
        });
        toast.success("广告更新成功");
      } else {
        await createMutation.mutateAsync(submitData);
        toast.success("广告创建成功");
      }
      onClose();
    } catch (error) {
      toast.error(isEdit ? "广告更新失败" : "广告创建失败");
    }
  };

  return (
    <Dialog onOpenChange={onClose} open={isOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑广告" : "创建广告"}</DialogTitle>
        </DialogHeader>

        <div className="max-h-[calc(100vh-200px)] space-y-6 overflow-y-auto py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                广告标题 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="请输入广告标题"
                value={formData.title}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">广告类型</Label>
              <Select
                onValueChange={(value: any) =>
                  setFormData({ ...formData, type: value })
                }
                value={formData.type}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(AD_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              广告描述 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="请输入广告描述"
              rows={3}
              value={formData.description}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">
              广告链接 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="link"
              onChange={(e) =>
                setFormData({ ...formData, link: e.target.value })
              }
              placeholder="https://example.com"
              type="url"
              value={formData.link}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">广告位置</Label>
              <Select
                onValueChange={(value: any) =>
                  setFormData({ ...formData, position: value })
                }
                value={formData.position}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(AD_POSITION_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">排序值</Label>
              <Input
                id="sortOrder"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sortOrder: Number.parseInt(e.target.value, 10) || 0,
                  })
                }
                placeholder="0"
                type="number"
                value={formData.sortOrder}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">
                开始时间 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startDate"
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                type="datetime-local"
                value={formData.startDate}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">
                结束时间 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="endDate"
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                type="datetime-local"
                value={formData.endDate}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>广告图片</Label>
            <MediaSelect
              maxCount={1}
              onChange={(mediaIds) =>
                setFormData({ ...formData, mediaId: mediaIds[0] || "" })
              }
              placeholder="选择广告图片"
              value={formData.mediaId ? [formData.mediaId] : []}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.isActive}
              id="isActive"
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
            />
            <Label htmlFor="isActive">启用广告</Label>
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
            {createMutation.isPending || updateMutation.isPending ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                处理中...
              </span>
            ) : isEdit ? (
              "更新"
            ) : (
              "创建"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdsPage() {
  const { data: adsData, isLoading, refetch } = useAdsList();
  const deleteMutation = useAdsDelete();
  const batchDeleteMutation = useAdsBatchDelete();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | undefined>();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleEdit = (ad: any) => {
    setEditingAd(ad);
    setIsDialogOpen(true);
  };

  const handleDelete = async (ad: any) => {
    try {
      await deleteMutation.mutateAsync(ad.id);
      toast.success("广告删除成功");
      refetch();
    } catch (error) {
      toast.error("广告删除失败");
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) {
      toast.error("请选择要删除的广告");
      return;
    }

    try {
      await batchDeleteMutation.mutateAsync(Array.from(selectedIds));
      toast.success(`成功删除 ${selectedIds.size} 个广告`);
      setSelectedIds(new Set());
      refetch();
    } catch (error) {
      toast.error("批量删除失败");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && adsData) {
      setSelectedIds(new Set(adsData.map((ad) => ad.id)));
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

  const handleToggleActive = (ad: any) => {
    try {
      refetch();
    } catch (error) {
      toast.error("操作失败");
    }
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

  const ads = adsData || [];
  const hasAds = ads.length > 0;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator className="mr-2 h-4" orientation="vertical" />
            <nav className="font-medium text-sm">广告管理</nav>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          {/* 页面头部 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-3xl text-slate-900">广告管理</h1>
              <p className="mt-2 text-slate-600">
                管理站点的广告内容，支持横幅、轮播图和列表广告。
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
                        个广告吗？此操作不可撤销。
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
                    添加广告
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>

          {/* 广告列表 */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            {hasAds && (
              <div className="border-slate-200 border-b bg-slate-50 px-4 py-3">
                <label className="flex items-center gap-2 font-medium text-slate-700 text-sm">
                  <input
                    checked={selectedIds.size === ads.length}
                    className="rounded border-slate-300 text-slate-600 focus:ring-2 focus:ring-indigo-500"
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    type="checkbox"
                  />
                  全选
                  <span className="text-slate-500">
                    ({selectedIds.size}/{ads.length})
                  </span>
                </label>
              </div>
            )}

            {hasAds ? (
              <div className="divide-y divide-slate-200">
                {ads.map((ad) => (
                  <div
                    className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-slate-50"
                    key={ad.id}
                  >
                    <input
                      checked={selectedIds.has(ad.id)}
                      className="rounded border-slate-300 text-slate-600 focus:ring-2 focus:ring-indigo-500"
                      onChange={(e) => handleSelect(ad.id, e.target.checked)}
                      type="checkbox"
                    />

                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {ad.mediaUrl ? (
                        <Image
                          alt={ad.title}
                          className="h-full w-full object-cover"
                          height={64}
                          src={ad.mediaUrl}
                          width={64}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-slate-400" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-medium text-slate-900">
                          {ad.title}
                        </h3>
                        <Badge variant={ad.isActive ? "default" : "secondary"}>
                          {ad.isActive ? "启用" : "禁用"}
                        </Badge>
                        <Badge variant="outline">
                          {AD_TYPE_LABELS[ad.type] || ad.type}
                        </Badge>
                      </div>
                      {ad.description && (
                        <p className="mt-1 truncate text-slate-500 text-sm">
                          {ad.description}
                        </p>
                      )}
                      <div className="mt-1 flex items-center gap-4 text-slate-400 text-xs">
                        <span>
                          位置: {AD_POSITION_LABELS[ad.position || "home-top"]}
                        </span>
                        <span>排序: {ad.sortOrder}</span>
                        <span>
                          有效期:{" "}
                          {format(new Date(ad.startDate), "MM/dd", {
                            locale: zhCN,
                          })}{" "}
                          -{" "}
                          {format(new Date(ad.endDate), "MM/dd", {
                            locale: zhCN,
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        className={
                          ad.isActive
                            ? "text-orange-600 hover:text-orange-700"
                            : "text-green-600 hover:text-green-700"
                        }
                        onClick={() => handleToggleActive(ad)}
                        size="sm"
                        variant="ghost"
                      >
                        {ad.isActive ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>

                      <Button
                        onClick={() => handleEdit(ad)}
                        size="sm"
                        variant="ghost"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            className="text-red-600 hover:text-red-700"
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
                              确定要删除广告 "{ad.title}" 吗？此操作不可撤销。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(ad)}>
                              删除
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-8 py-12 text-center">
                <div className="mb-6">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                    <ImageIcon className="h-8 w-8 text-slate-400" />
                  </div>
                </div>
                <h3 className="mb-2 font-semibold text-slate-900 text-xl">
                  暂无广告
                </h3>
                <p className="mx-auto mb-6 max-w-md text-slate-500">
                  创建第一个广告来开始推广您的内容
                </p>
                <Button
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  创建广告
                </Button>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>

      {/* 创建/编辑广告对话框 */}
      <AdsDialog
        ad={editingAd}
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingAd(undefined);
        }}
      />
    </SidebarProvider>
  );
}
