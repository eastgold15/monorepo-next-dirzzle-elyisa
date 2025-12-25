"use client";

import Image from "next/image";
import { useState } from "react";

interface ImageItem {
  id: string;
  url: string;
  isMain?: boolean;
  originalName?: string;
}

interface ImageGalleryProps {
  images: ImageItem[];
  maxDisplay?: number;
  size?: "sm" | "md" | "lg";
  title?: string;
  onPreview?: (url: string) => void;
  className?: string;
}

const sizeConfig = {
  sm: { size: "h-12 w-12", sizes: "48px" },
  md: { size: "h-16 w-16", sizes: "64px" },
  lg: { size: "h-20 w-20", sizes: "80px" },
};

export function ImageGallery({
  images,
  maxDisplay = 6,
  size = "sm",
  title,
  onPreview,
  className = "",
}: ImageGalleryProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handlePreview = (url: string) => {
    setPreviewUrl(url);
    onPreview?.(url);
  };

  const config = sizeConfig[size];
  const displayImages = images.slice(0, maxDisplay);
  const remainingCount = images.length - maxDisplay;

  return (
    <>
      {title && (
        <p className="mb-2 font-medium text-slate-700 text-xs uppercase tracking-wide">
          {title} ({images.length})
        </p>
      )}
      <div className={`flex items-center gap-2 overflow-x-auto ${className}`}>
        {displayImages.map((image) => (
          <div
            className={`${config.size} relative flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 bg-white shadow-sm transition-all hover:scale-105 hover:shadow-md`}
            key={image.id}
            onClick={() => handlePreview(image.url)}
            style={{
              borderColor: image.isMain
                ? "rgb(99 102 241)"
                : "rgb(226 232 240)",
            }}
          >
            <Image
              alt={image.originalName || "图片"}
              className="h-full w-full object-cover"
              fill
              sizes={config.sizes}
              src={image.url}
            />
            {image.isMain && (
              <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-xs shadow-sm">
                ★
              </div>
            )}
          </div>
        ))}
        {remainingCount > 0 && (
          <span className="flex h-16 w-8 items-center justify-center rounded border border-slate-300 border-dashed bg-slate-50 text-slate-500 text-xs">
            +{remainingCount}
          </span>
        )}
      </div>

      {/* 图片预览 */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <button
              className="absolute -top-12 right-0 h-10 w-10 rounded-full bg-white/90 p-0 shadow-lg transition-all hover:bg-white hover:shadow-xl"
              onClick={() => setPreviewUrl(null)}
            >
              ✕
            </button>
            <div
              className="overflow-hidden rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                alt="预览图片"
                className="max-h-[85vh] w-auto object-contain"
                height={1200}
                src={previewUrl}
                width={1200}
              />
            </div>
            <div className="mt-4 text-center text-white/80 text-xs">
              点击图片或按 ESC 关闭
            </div>
          </div>
        </div>
      )}
    </>
  );
}
