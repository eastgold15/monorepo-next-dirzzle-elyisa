"use client";

import {
  Filter,
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
import { AppSidebar } from "@/components/app-sidebar";
import { Has, PERMISSIONS } from "@/components/auth";
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
import { formatFileSize } from "@/lib/utils";

interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

export default function MediaLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // 使用 API 获取媒体数据
  const {
    data: mediaData,
    isLoading,
    error,
    refetch,
  } = useMediaList({
    page,
    limit,
    category,
    search: searchTerm,
  });

  // 删除媒体文件
  const deleteMediaMutation = useMediaDelete();

  const media = mediaData?.files || [];
  const pagination = mediaData?.pagination;

  const handleUploadComplete = (uploadedFiles: UploadFile[]) => {
    refetch();
    toast.success(`成功上传 ${uploadedFiles.length} 个文件`);
  };

  const handleUploadError = (error: string) => {
    toast.error(error);
  };

  // 处理删除
  const handleDelete = async (ids: string[]) => {
    try {
      await deleteMediaMutation.mutateAsync(ids);
      toast.success(`成功删除 ${ids.length} 个文件`);
      setSelectedItems([]);
      refetch();
    } catch (error) {
      toast.error("删除失败");
    }
  };

  // 切换选中状态
  const toggleSelect = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 全选/取消全选
  const handleSelectAll = () => {
    if (selectedItems.length === media.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(media.map((item) => item.id));
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator className="mr-2 h-4" orientation="vertical" />
            <nav className="font-medium text-sm">Media Library</nav>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="space-y-6">
            {/* Header with storage info */}
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="font-bold text-2xl text-slate-900">媒体库</h1>
                <p className="mt-1 text-slate-500">
                  管理产品图片、视频和其他媒体文件
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedItems.length > 0 && (
                  <Has permission={PERMISSIONS.MEDIA_DELETE}>
                    <Button
                      disabled={deleteMediaMutation.isPending}
                      onClick={() => handleDelete(selectedItems)}
                      variant="destructive"
                    >
                      <Trash2 className="mr-2" size={18} />
                      删除选中 ({selectedItems.length})
                    </Button>
                  </Has>
                )}
                <Has permission={PERMISSIONS.MEDIA_CREATE}>
                  <MediaUpload
                    onError={handleUploadError}
                    onUploadComplete={handleUploadComplete}
                  >
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      <Upload className="mr-2" size={18} />
                      上传文件
                    </Button>
                  </MediaUpload>
                </Has>
              </div>
            </div>

            {/* Search and filters */}
            <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
              <div className="relative flex-1">
                <Search
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  className="w-full rounded-lg border border-slate-300 py-2 pr-4 pl-10 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索文件名..."
                  type="text"
                  value={searchTerm}
                />
              </div>
              <select
                className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => setCategory(e.target.value)}
                value={category}
              >
                <option value="">所有分类</option>
                <option value="image">图片</option>
                <option value="video">视频</option>
                <option value="document">文档</option>
              </select>
              <button className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">
                <Filter size={18} />
                <span>筛选</span>
              </button>
            </div>

            {/* Selection controls */}
            {media.length > 0 && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    checked={selectedItems.length === media.length}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    onChange={handleSelectAll}
                    type="checkbox"
                  />
                  全选 ({selectedItems.length} / {media.length})
                </label>
                {selectedItems.length > 0 && (
                  <Button
                    onClick={() => setSelectedItems([])}
                    size="sm"
                    variant="ghost"
                  >
                    <X className="mr-1" size={16} />
                    取消选择
                  </Button>
                )}
              </div>
            )}

            {/* Media grid */}
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {isLoading ? (
                <div className="col-span-full py-8 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-indigo-600 border-b-2" />
                  <p className="mt-2 text-slate-500">加载中...</p>
                </div>
              ) : error ? (
                <div className="col-span-full py-8 text-center text-red-500">
                  <p className="font-medium">加载失败</p>
                  <p className="mt-1 text-slate-500 text-sm">{error.message}</p>
                </div>
              ) : media.length === 0 ? (
                <div className="col-span-full py-8 text-center text-slate-500">
                  <div className="mb-2 text-4xl">📁</div>
                  <p>暂无媒体文件</p>
                </div>
              ) : (
                media.map((asset) => (
                  <div
                    className={`group overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-md ${
                      selectedItems.includes(asset.id)
                        ? "border-indigo-500 ring-2 ring-indigo-500"
                        : "border-slate-200"
                    }`}
                    key={asset.id}
                  >
                    {/* Selection checkbox */}
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        checked={selectedItems.includes(asset.id)}
                        className="rounded border-slate-300 text-indigo-600 opacity-0 transition-opacity focus:ring-indigo-500 group-hover:opacity-100"
                        onChange={() => toggleSelect(asset.id)}
                        type="checkbox"
                      />
                    </div>

                    {/* Media preview */}
                    <div className="relative aspect-square bg-slate-100">
                      {asset.url && asset.mimeType?.startsWith("image/") ? (
                        <Image
                          alt={asset.originalName || "Image"}
                          className="h-full w-full object-cover"
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                          src={asset.url}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <div className="text-center">
                            <div className="mb-2 text-4xl">
                              {asset.mimeType?.startsWith("video/")
                                ? "🎥"
                                : asset.mimeType?.startsWith("audio/")
                                  ? "🎵"
                                  : asset.mimeType?.includes("pdf")
                                    ? "📄"
                                    : "📎"}
                            </div>
                            <p className="text-slate-500 text-xs uppercase">
                              {asset.mimeType?.split("/")[1] || "FILE"}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Actions dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="absolute top-2 right-2 rounded-md bg-white/90 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4 text-slate-600" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>查看详情</DropdownMenuItem>
                          <DropdownMenuItem>复制链接</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <Has permission={PERMISSIONS.MEDIA_DELETE}>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete([asset.id])}
                            >
                              删除文件
                            </DropdownMenuItem>
                          </Has>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* File info */}
                    <div className="p-3">
                      <h4
                        className="truncate font-medium text-slate-900 text-sm"
                        title={asset.originalName}
                      >
                        {asset.originalName}
                      </h4>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-slate-500 text-xs">
                          {asset.mimeType?.split("/")[0]?.toUpperCase()}
                        </span>
                        {asset.size && (
                          <span className="text-slate-500 text-xs">
                            {formatFileSize(asset.size)}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {asset.category && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-medium text-[10px] text-slate-600">
                            <Tag size={10} />
                            {asset.category}
                          </span>
                        )}
                        {asset.mediaType && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 font-medium text-[10px] text-blue-600">
                            {asset.mediaType}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-slate-600 text-sm">
                  显示 {(page - 1) * limit + 1} 到{" "}
                  {Math.min(page * limit, pagination.total)} 共{" "}
                  {pagination.total} 个文件
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    size="sm"
                    variant="outline"
                  >
                    上一页
                  </Button>
                  <span className="text-sm">
                    第 {page} / {pagination.totalPages} 页
                  </span>
                  <Button
                    disabled={page === pagination.totalPages}
                    onClick={() => setPage(page + 1)}
                    size="sm"
                    variant="outline"
                  >
                    下一页
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
