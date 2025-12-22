"use client";

import type { MasterContractDto } from "@repo/contract";
import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMasterCategoryStore } from "@/stores/mastercategory-store";

interface MasterCategorySelectProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  allowClear?: boolean;
  excludeId?: string; // 排除某个ID（用于编辑时防止选择自己）
}

export function MasterCategorySelect({
  value,
  onChange,
  placeholder = "选择主分类",
  className = "",
  allowClear = false,
  excludeId,
}: MasterCategorySelectProps) {
  const { treeData, isLoading, getCategoryById } = useMasterCategoryStore();

  // 扁平化的选项用于显示
  const flattenedOptions = useMemo(() => {
    const flatten = (
      cats: MasterContractDto["TreeEntity"][]
    ): Array<{ value: string; label: string }> => {
      const result: Array<{ value: string; label: string }> = [];
      cats.forEach((cat) => {
        // 排除指定的ID
        if (cat.id !== excludeId) {
          result.push({
            value: cat.id,
            label: cat.name,
          });
        }
        // 递归处理子分类
        if (cat.children && cat.children.length > 0) {
          result.push(...flatten(cat.children));
        }
      });
      return result;
    };
    return flatten(treeData);
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
      onChange("");
    } else {
      onChange(newValue);
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
      <SelectTrigger className={`w-full ${className}`}>
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
        {flattenedOptions.length === 0 ? (
          <div className="px-3 py-2 text-slate-500 text-sm">暂无主分类数据</div>
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
