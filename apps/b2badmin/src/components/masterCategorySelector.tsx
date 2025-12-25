"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useMasterCategories } from "@/hooks/api/master-categories";

interface CategorySelectorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export function CategorySelector({
  value,
  onChange,
  placeholder = "请选择分类",
  disabled = false,
  error,
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: categories, isLoading } = useMasterCategories({
    page: 1,
    limit: 100,
  });

  const options = categories || [];
  const selectedOption = options.find((option) => option.id === value);

  return (
    <div className="relative">
      <button
        className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
            : error
              ? "border-red-300 bg-white text-slate-900 hover:border-red-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              : "border-slate-300 bg-white text-slate-900 hover:border-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        }
        `}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        type="button"
      >
        <div className="flex items-center justify-between">
          <span className={selectedOption ? "" : "text-slate-400"}>
            {selectedOption ? selectedOption.name : placeholder}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {error && <p className="mt-1 text-red-600 text-sm">{error}</p>}

      {isOpen && !disabled && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
            {isLoading ? (
              <div className="px-3 py-4 text-center text-slate-500 text-sm">
                加载中...
              </div>
            ) : options.length === 0 ? (
              <div className="px-3 py-4 text-center text-slate-500 text-sm">
                暂无分类
              </div>
            ) : (
              <div>
                {options.map((option) => (
                  <button
                    className={`w-full px-3 py-2 text-left transition-colors ${
                      option.id === value
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }
                    `}
                    key={option.id}
                    onClick={() => {
                      onChange(option.id);
                      setIsOpen(false);
                    }}
                    type="button"
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
