"use client";

import type { SiteCategoriesDTO } from "@repo/contract";
import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSiteCategoryStore } from "@/stores/site-category-store";

interface SiteCategoryTreeSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowClear?: boolean;
  excludeId?: string; // 排除某个ID（用于编辑时防止选择自己）
}

export function SiteCategoryTreeSelect({
  value,
  onChange,
  placeholder = "选择站点分类",
  disabled = false,
  className,
  allowClear = false,
  excludeId,
}: SiteCategoryTreeSelectProps) {
  const { treeData, isLoading, getCategoryById } = useSiteCategoryStore();

  // 扁平化选项用于显示
  const flattenedOptions = useMemo(() => {
    const flatten = (
      cats: SiteCategoriesDTO["TreeResponse"][],
      level = 0
    ): Array<{ value: string; label: string }> => {
      const result: Array<{ value: string; label: string }> = [];
      cats.forEach((cat) => {
        // 排除指定的ID
        if (cat.id !== excludeId) {
          result.push({
            value: cat.id,
            label: "  ".repeat(level) + cat.name,
          });
        }
        if (cat.children && cat.children.length > 0) {
          result.push(...flatten(cat.children, level + 1));
        }
      });
      return result;
    };

    return flatten(treeData || []);
  }, [treeData, excludeId]);

  // 获取选中的分类名称
  const selectedCategoryName = useMemo(() => {
    if (!value) return "";
    const category = getCategoryById(value);
    return category?.name || "";
  }, [value, getCategoryById]);

  // 处理值变化
  const handleValueChange = (newValue: string) => {
    if (allowClear && newValue === "none") {
      onChange?.("");
    } else if (newValue === "root") {
      // 选择 root 时视为空值（顶级分类）
      onChange?.("");
    } else {
      onChange?.(newValue);
    }
  };

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
    <Select
      onValueChange={handleValueChange}
      value={value || (allowClear ? "none" : "")}
    >
      <SelectTrigger className={`w-full ${className}`} disabled={disabled}>
        <SelectValue placeholder={placeholder}>
          {selectedCategoryName || placeholder}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {allowClear && (
          <SelectItem value="none">
            <span className="text-slate-400">无（清除选择）</span>
          </SelectItem>
        )}
        {!allowClear && (
          <SelectItem value="root">
            <span className="text-slate-400">无（顶级分类）</span>
          </SelectItem>
        )}
        {flattenedOptions.length === 0 ? (
          <div className="px-3 py-2 text-slate-500 text-sm">
            暂无站点分类数据
          </div>
        ) : (
          flattenedOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
