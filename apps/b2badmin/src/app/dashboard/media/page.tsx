"use client";

import { Filter, Search, Tag, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { MediaUpload } from "@/components/MediaUpload";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { INITIAL_MEDIA } from "@/mockData";

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
  const [media, setMedia] = useState(INITIAL_MEDIA);

  const filteredMedia = media.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.tags.some((t) => t.includes(searchTerm.toLowerCase()))
  );

  const handleUploadComplete = (uploadedFiles: UploadFile[]) => {
    // 将新上传的文件添加到媒体列表
    const newMediaItems = uploadedFiles.map((file) => ({
      id: file.id,
      name: file.name,
      url: file.preview || "/placeholder-image.jpg",
      type: file.type.startsWith("image/") ? "image" : "video",
      tags: ["新上传"],
      createdAt: new Date().toISOString(),
    }));

    setMedia((prev) => [...newMediaItems, ...prev]);
  };

  const handleUploadError = (error: string) => {
    console.error("Upload error:", error);
    // 这里可以添加错误提示，比如使用 toast
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
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="font-bold text-2xl text-slate-900">
                  Media Library
                </h1>
                <p className="mt-1 text-slate-500">
                  Manage product images and videos.
                </p>
              </div>
              <MediaUpload
                onError={handleUploadError}
                onUploadComplete={handleUploadComplete}
              >
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Upload className="mr-2" size={18} />
                  上传资源
                </Button>
              </MediaUpload>
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
              <div className="relative flex-1">
                <Search
                  className="-translate-y-1/2 absolute top-1/2 left-3 text-slate-400"
                  size={18}
                />
                <input
                  className="w-full rounded-lg border border-slate-300 py-2 pr-4 pl-10 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or tag..."
                  type="text"
                  value={searchTerm}
                />
              </div>
              <button className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">
                <Filter size={18} />
                <span>Filter</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredMedia.map((asset) => (
                <div
                  className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                  key={asset.id}
                >
                  <div className="relative aspect-square bg-slate-100">
                    <img
                      alt={asset.name}
                      className="h-full w-full object-cover"
                      src={asset.url}
                    />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <button className="rounded-full bg-white/90 p-2 text-red-600 hover:bg-white">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="truncate font-medium text-slate-900 text-sm">
                      {asset.name}
                    </h4>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {asset.tags.map((tag) => (
                        <span
                          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-medium text-[10px] text-slate-600"
                          key={tag}
                        >
                          <Tag size={10} /> {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
