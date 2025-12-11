"use client";

import { Filter, Search, Tag, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { INITIAL_MEDIA } from "../../../mockData";

export default function MediaLibrary() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMedia = INITIAL_MEDIA.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.tags.some((t) => t.includes(searchTerm.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-bold text-2xl text-slate-900">Media Library</h1>
            <p className="mt-1 text-slate-500">
              Manage product images and videos.
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-indigo-700">
            <Upload size={18} />
            <span>Upload Assets</span>
          </button>
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
    </AdminLayout>
  );
}
