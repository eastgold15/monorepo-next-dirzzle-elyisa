"use client";

import type { MasterCategoryTModel } from "@repo/contract";
import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMasterCategories } from "@/hooks/api/master-category";

interface MasterCategorySelectProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function MasterCategorySelect({
  value,
  onChange,
  placeholder = "选择主分类",
  className = "",
}: MasterCategorySelectProps) {
  const { data: categories = [], isLoading } = useMasterCategories();

  // 扁平化的选项用于显示
  const flattenedOptions = useMemo(() => {
    const flatten = (
      cats: MasterCategoryTModel["Entity"][]
    ): Array<{ value: string; label: string }> => {
      const result: Array<{ value: string; label: string }> = [];
      cats.forEach((cat) => {
        result.push({
          value: cat.id,
          label: cat.name,
        });
      });
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
    <Select onValueChange={onChange} value={value || ""}>
      <SelectTrigger className={`w-full ${className}`}>
        <SelectValue placeholder={placeholder}>
          {selectedCategoryName || placeholder}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {categories.length === 0 ? (
          <div className="px-3 py-2 text-slate-500 text-sm">暂无主分类数据</div>
        ) : (
          categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
