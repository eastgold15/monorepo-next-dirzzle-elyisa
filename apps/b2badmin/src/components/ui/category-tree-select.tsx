"use client";

import type { SiteCategoriesDTO } from "@repo/contract";
import { ChevronDown, ChevronRight } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { useSiteCategoriesTree } from "@/hooks/api/site-category";

// 将契约层的实体类型转换为前端使用的带children的类型
type SiteCategory = SiteCategoriesDTO["TreeResponse"];

interface CategoryTreeSelectProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CategoryTreeSelect({
  value,
  onChange,
  placeholder = "选择分类",
  className = "",
}: CategoryTreeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const { data: categories = [], isLoading } = useSiteCategoriesTree();

  // 扁平化的选项用于显示选中的分类名称
  const flattenedOptions = useMemo(() => {
    const flatten = (
      cats: SiteCategory[]
    ): Array<{ value: string; label: string }> => {
      const result: Array<{ value: string; label: string }> = [];
      const traverse = (items: SiteCategory[], level = 0) => {
        items.forEach((item) => {
          result.push({
            value: item.id,
            label: level > 0 ? "  ".repeat(level) + item.name : item.name,
          });
          if (item.children && item.children.length > 0) {
            traverse(item.children, level + 1);
          }
        });
      };
      traverse(cats);
      return result;
    };
    return flatten(categories);
  }, [categories]);

  // 获取选中的分类名称
  const selectedCategoryName = useMemo(() => {
    if (!value) return "";
    const option = flattenedOptions.find((opt) => opt.value === value);
    return option?.label || "";
  }, [value, flattenedOptions]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const handleCategoryClick = (categoryId: string) => {
    onChange(categoryId);
    setIsOpen(false);
  };

  const renderTree = (items: SiteCategory[], level = 0): React.ReactNode =>
    items.map((category) => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedNodes.has(category.id);
      const isSelected = value === category.id;

      return (
        <div className="select-none" key={category.id}>
          <div
            className={`flex cursor-pointer items-center rounded-md px-3 py-2 transition-colors hover:bg-slate-100 ${
              isSelected
                ? "bg-indigo-50 font-medium text-indigo-600"
                : "text-slate-700"
            }`}
            onClick={() => handleCategoryClick(category.id)}
            style={{ paddingLeft: `${12 + level * 20}px` }}
          >
            {hasChildren && (
              <button
                className="mr-1 rounded p-0.5 hover:bg-slate-200"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(category.id);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
            {!hasChildren && <span className="mr-5" />}
            <span className="flex-1">{category.name}</span>
          </div>
          {hasChildren && isExpanded && (
            <div className="ml-2">
              {renderTree(category.children!, level + 1)}
            </div>
          )}
        </div>
      );
    });

  if (isLoading) {
    return (
      <div
        className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-500 ${className}`}
      >
        加载中...
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className="w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 transition-colors hover:border-slate-400"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <span
            className={
              selectedCategoryName ? "text-slate-900" : "text-slate-500"
            }
          >
            {selectedCategoryName || placeholder}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {isOpen && (
        <>
          {/* 遮罩层 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* 下拉面板 */}
          <div className="absolute top-full right-0 left-0 z-20 mt-1 max-h-80 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
            <div className="p-2">
              {categories.length === 0 ? (
                <div className="py-4 text-center text-slate-500">
                  暂无分类数据
                </div>
              ) : (
                renderTree(categories)
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
