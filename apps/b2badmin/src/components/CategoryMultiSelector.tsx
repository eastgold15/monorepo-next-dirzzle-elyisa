"use client";

import { Check, ChevronDown, X } from "lucide-react";
import { useState } from "react";
import { flattenCategories, useMasterCategoriesTree } from "@/hooks/api";

interface CategoryMultiSelectorProps {
  value?: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  maxSelected?: number;
}

export function CategoryMultiSelector({
  value = [],
  onChange,
  placeholder = "请选择分类",
  disabled = false,
  error,
  maxSelected = 5,
}: CategoryMultiSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: categories, isLoading } = useMasterCategoriesTree();
  const [searchQuery, setSearchQuery] = useState("");

  const options = categories ? flattenCategories(categories) : [];
  const selectedOptions = options.filter((option) =>
    value.includes(option.value)
  );

  // 过滤选项
  const filteredOptions = options.filter(
    (option) =>
      !value.includes(option.value) &&
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (categoryId: string) => {
    if (value.length >= maxSelected) {
      return;
    }
    onChange([...value, categoryId]);
  };

  const handleRemove = (categoryId: string) => {
    onChange(value.filter((id) => id !== categoryId));
  };

  return (
    <div className="relative">
      {/* 选中的分类标签 */}
      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <div
              className="flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-indigo-700 text-sm"
              key={option.value}
            >
              <span>{option.label}</span>
              <button
                className="hover:text-indigo-900 disabled:opacity-50"
                disabled={disabled}
                onClick={() => handleRemove(option.value)}
                type="button"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 选择器按钮 */}
      <button
        className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
            : error
              ? "border-red-300 bg-white text-slate-900 hover:border-red-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              : "border-slate-300 bg-white text-slate-900 hover:border-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        }
        `}
        disabled={disabled || value.length >= maxSelected}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        type="button"
      >
        <div className="flex items-center justify-between">
          <span className="text-slate-400">
            {value.length === 0 ? placeholder : `已选择 ${value.length} 个分类`}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {error && <p className="mt-1 text-red-600 text-sm">{error}</p>}
      {value.length >= maxSelected && (
        <p className="mt-1 text-amber-600 text-sm">
          最多只能选择 {maxSelected} 个分类
        </p>
      )}

      {/* 下拉菜单 */}
      {isOpen && !disabled && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
            {/* 搜索框 */}
            <div className="border-slate-100 border-b p-3">
              <input
                autoFocus
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索分类..."
                type="text"
                value={searchQuery}
              />
            </div>

            {/* 选项列表 */}
            <div className="max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="px-3 py-4 text-center text-slate-500 text-sm">
                  加载中...
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="px-3 py-4 text-center text-slate-500 text-sm">
                  {searchQuery ? "没有找到匹配的分类" : "暂无更多分类"}
                </div>
              ) : (
                <div>
                  {filteredOptions.map((option) => (
                    <button
                      className="w-full px-3 py-2 text-left text-slate-700 transition-colors hover:bg-slate-50"
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      type="button"
                    >
                      <div className="flex items-center justify-between">
                        <span>{option.label}</span>
                        <Check className="h-4 w-4 text-slate-400" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
