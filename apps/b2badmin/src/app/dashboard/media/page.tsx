"use client";

import {
  FileIcon,
  Loader2,
  MoreHorizontal,
  Search,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce"; // 建议安装: bun add use-debounce

import { AppSidebar } from "@/components/app-sidebar";
import { Can } from "@/components/auth";
import { MediaUpload } from "@/components/MediaUpload";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useMediaDelete, useMediaList } from "@/hooks/api";
import { cn } from "@/lib/utils";

interface UseMediaList {
  id: string;
  createdAt: string;
  updatedAt: string;
  storageKey: string;
  category: string;
  url: string;
  originalName: string;
  mimeType: string;
  status: boolean;
  exporterId?: any;
  factoryId?: any;
  ownerId?: any;
  isPublic: boolean;
  siteId: string;
}
export default function MediaLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 500); // 500ms 防抖
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // 1. 获取数据 (使用防抖后的搜索词)
  const { data, isLoading, error, refetch } = useMediaList({
    category: category || undefined,
    search: debouncedSearch || undefined,
  });

  const mediaItems = (data as unknown as UseMediaList[]) || [];

  const deleteMediaMutation = useMediaDelete();

  // 2. 处理删除逻辑
  const handleDelete = async (ids: string[]) => {
    if (!window.confirm(`确定要删除选中的 ${ids.length} 个文件吗？`)) return;

    try {
      await deleteMediaMutation.mutateAsync(ids);
      toast.success("删除成功");
      setSelectedItems([]);
      refetch();
    } catch (err) {
      toast.error("删除失败");
    }
  };

  // 3. 全选逻辑
  const handleSelectAll = () => {
    if (selectedItems.length === mediaItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(mediaItems.map((item: any) => item.id));
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator className="mr-2 h-4" orientation="vertical" />
            <nav className="font-medium text-sm">Media Library</nav>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* 标题与操作区 */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="font-bold text-2xl text-slate-900 tracking-tight">
                媒体库
              </h1>
              <p className="text-slate-500 text-sm">
                管理站点范围内的所有数字资产
              </p>
            </div>

            <div className="flex items-center gap-3">
              {selectedItems.length > 0 && (
                <Can permission="MEDIA_DELETE">
                  <Button
                    disabled={deleteMediaMutation.isPending}
                    onClick={() => handleDelete(selectedItems)}
                    variant="destructive"
                  >
                    <Trash2 className="mr-2 size-4" />
                    批量删除 ({selectedItems.length})
                  </Button>
                </Can>
              )}

              <MediaUpload onUploadComplete={() => refetch()}>
                <Button className="bg-indigo-600 shadow-sm transition-all hover:bg-indigo-700 active:scale-95">
                  <Upload className="mr-2 size-4" />
                  上传文件
                </Button>
              </MediaUpload>
            </div>
          </div>

          {/* 搜索与筛选控制台 */}
          <div className="flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full rounded-lg border border-slate-200 py-2 pr-4 pl-10 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索文件名..."
                value={searchTerm}
              />
              {searchTerm && (
                <button
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setSearchTerm("")}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <select
              className="rounded-lg border border-slate-200 px-4 py-2 text-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
              onChange={(e) => setCategory(e.target.value)}
              value={category}
            >
              <option value="">所有类型</option>
              <option value="image">图片</option>
              <option value="video">视频</option>
              <option value="general">通用文件</option>
            </select>
          </div>

          {/* 全选控制条 */}
          {mediaItems.length > 0 && (
            <div className="flex items-center justify-between px-1">
              <label className="flex cursor-pointer items-center gap-2 font-medium text-slate-600 text-sm">
                <input
                  checked={
                    selectedItems.length === mediaItems.length &&
                    mediaItems.length > 0
                  }
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  onChange={handleSelectAll}
                  type="checkbox"
                />
                全选 ({selectedItems.length} / {mediaItems.length})
              </label>
            </div>
          )}

          {/* 媒体网格展示层 */}
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {isLoading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20">
                <Loader2 className="size-8 animate-spin text-indigo-600" />
                <p className="mt-4 text-slate-500 text-sm">
                  正在检索媒体文件...
                </p>
              </div>
            ) : mediaItems.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border-2 border-slate-200 border-dashed bg-slate-50 py-20">
                <div className="rounded-full bg-white p-4 shadow-sm">
                  <FileIcon className="size-8 text-slate-400" />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">
                  未找到文件
                </h3>
                <p className="text-slate-500 text-sm">
                  尝试更换搜索词或上传新文件
                </p>
              </div>
            ) : (
              mediaItems.map((asset: UseMediaList) => (
                <MediaCard
                  asset={asset}
                  isSelected={selectedItems.includes(asset.id)}
                  key={asset.id}
                  onDelete={() => handleDelete([asset.id])}
                  onSelect={() => {
                    setSelectedItems((prev) =>
                      prev.includes(asset.id)
                        ? prev.filter((i) => i !== asset.id)
                        : [...prev, asset.id]
                    );
                  }}
                />
              ))
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// --- 抽离出的媒体卡片子组件 ---
function MediaCard({
  asset,
  isSelected,
  onSelect,
  onDelete,
}: {
  asset: UseMediaList;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const isImage = asset.mimeType?.startsWith("image/");

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-white transition-all hover:shadow-lg",
        isSelected
          ? "border-indigo-600 ring-2 ring-indigo-600/20"
          : "border-slate-200"
      )}
    >
      {/* 选中勾选框 (始终可见或悬浮可见) */}
      <div
        className={cn(
          "absolute top-3 left-3 z-20 transition-opacity",
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      >
        <input
          checked={isSelected}
          className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          onChange={onSelect}
          type="checkbox"
        />
      </div>

      {/* 预览区 */}
      <div className="relative aspect-square w-full bg-slate-100">
        {isImage ? (
          <Image
            alt={asset.originalName}
            className="object-cover transition-transform group-hover:scale-105"
            fill
            sizes="(max-width: 768px) 50vw, 20vw"
            src={asset.url}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <FileIcon className="size-10 text-slate-400" />
            <span className="font-bold text-[10px] text-slate-400 uppercase">
              {asset.mimeType?.split("/")[1]}
            </span>
          </div>
        )}

        {/* 悬浮操作按钮 */}
        <div className="absolute top-2 right-2 z-20 opacity-0 transition-opacity group-hover:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="size-8 shadow-sm"
                size="icon"
                variant="secondary"
              >
                <MoreHorizontal size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => window.open(asset.url, "_blank")}
              >
                预览文件
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(asset.url);
                  toast.success("链接已复制");
                }}
              >
                复制链接
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Can permission="MEDIA_DELETE">
                <DropdownMenuItem className="text-red-600" onClick={onDelete}>
                  删除
                </DropdownMenuItem>
              </Can>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 信息区 */}
      <div className="flex flex-col p-3">
        <p
          className="truncate font-semibold text-slate-900 text-xs"
          title={asset.originalName}
        >
          {asset.originalName}
        </p>
        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
          <span>{asset.mimeType?.split("/")[0].toUpperCase()}</span>
          <span>{asset.status ? "已上传" : "未上传"}</span>
        </div>
        {asset.category && (
          <div className="mt-2 flex items-center gap-1">
            <Tag className="text-slate-400" size={10} />
            <span className="text-[10px] text-slate-500">{asset.category}</span>
          </div>
        )}
      </div>
    </div>
  );
}
