"use client";

import { Check, X } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useState } from "react";

interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

// Mock data - in real app, this would fetch from API
const INITIAL_MEDIA: MediaAsset[] = [
  {
    id: "1",
    name: "shoe-1.jpg",
    url: "/api/placeholder/300/300",
    type: "image/jpeg",
    size: 245_760,
  },
  {
    id: "2",
    name: "shoe-2.jpg",
    url: "/api/placeholder/300/300",
    type: "image/jpeg",
    size: 327_680,
  },
  {
    id: "3",
    name: "factory-1.jpg",
    url: "/api/placeholder/300/300",
    type: "image/jpeg",
    size: 163_840,
  },
  {
    id: "4",
    name: "category-1.jpg",
    url: "/api/placeholder/300/300",
    type: "image/jpeg",
    size: 409_600,
  },
];

export const MediaPicker: React.FC<MediaPickerProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // In a real app, this would fetch from API
  const assets: MediaAsset[] = INITIAL_MEDIA;

  if (!isOpen) return null;

  const handleConfirm = () => {
    const asset = assets.find((a) => a.id === selectedId);
    if (asset) {
      onSelect(asset.url);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="font-semibold text-lg">Select Image</h3>
          <button
            className="rounded-full p-1 hover:bg-slate-100"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 overflow-y-auto p-6 sm:grid-cols-4">
          {assets.map((asset) => (
            <div
              className={`group relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
                selectedId === asset.id
                  ? "border-indigo-600 ring-2 ring-indigo-100"
                  : "border-slate-200 hover:border-indigo-300"
              }`}
              key={asset.id}
              onClick={() => setSelectedId(asset.id)}
            >
              <Image
                alt={asset.name}
                className="h-full w-full object-cover"
                src={asset.url}
              />
              {selectedId === asset.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-indigo-600/20">
                  <div className="rounded-full bg-indigo-600 p-1 text-white">
                    <Check size={16} />
                  </div>
                </div>
              )}
              <div className="absolute right-0 bottom-0 left-0 truncate bg-black/60 p-1 text-white text-xs opacity-0 transition-opacity group-hover:opacity-100">
                {asset.name}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 rounded-b-xl border-t bg-slate-50 p-4">
          <button
            className="px-4 py-2 font-medium text-slate-600 hover:text-slate-800"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!selectedId}
            onClick={handleConfirm}
          >
            Select Asset
          </button>
        </div>
      </div>
    </div>
  );
};
