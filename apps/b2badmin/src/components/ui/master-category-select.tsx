"use client";

import type { MasterDTO } from "@repo/contract";
import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMasterCategoryStore } from "@/stores/master-categories-store";

interface MasterCategorySelectProps {
  value?: string;
  onChange?: (value: string) => void;
  onValueChange?: (value: string) => void; // 别名，兼容不同命名习惯
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  allowClear?: boolean;
  excludeId?: string; // 排除某个ID（用于编辑时防止选择自己）
  showFullPath?: boolean; // 是否显示完整路径
}

// 递归获取分类的完整路径
function getCategoryPath(
  categoryId: string,
  flatData: Map<string, MasterDTO["TreeEntity"]>
): string {
  const path: string[] = [];
  let current = flatData.get(categoryId);

  while (current) {
    path.unshift(current.name);
    if (current.parentId) {
      current = flatData.get(current.parentId);
    } else {
      break;
    }
  }

  return path.join(" > ");
}

export function MasterCategorySelect({
  value,
  onChange,
  onValueChange,
  placeholder = "选择主分类",
  className = "",
  disabled = false,
  allowClear = false,
  excludeId,
  showFullPath = false,
}: MasterCategorySelectProps) {
  const { treeData, isLoading, flatData, getCategoryById } =
    useMasterCategoryStore();

  // 统一处理值变化
  const handleChange = (newValue: string) => {
    const actualValue = allowClear && newValue === "none" ? "" : newValue;
    onChange?.(actualValue);
    onValueChange?.(actualValue);
  };

  // 扁平化的选项用于显示（带层级信息）
  const flattenedOptions = useMemo(() => {
    const flatten = (
      cats: MasterDTO["TreeEntity"][],
      level = 0
    ): Array<{ value: string; label: string; level: number }> => {
      const result: Array<{ value: string; label: string; level: number }> = [];
      cats.forEach((cat) => {
        // 排除指定的ID
        if (cat.id !== excludeId) {
          result.push({
            value: cat.id,
            label: cat.name,
            level,
          });
        }
        // 递归处理子分类
        if (cat.children && cat.children.length > 0) {
          result.push(...flatten(cat.children, level + 1));
        }
      });
      return result;
    };
    return flatten(treeData);
  }, [treeData, excludeId]);

  // 获取选中的分类名称或完整路径
  const selectedCategoryText = useMemo(() => {
    if (!(value && flatData)) return placeholder;
    if (showFullPath) {
      return getCategoryPath(value, flatData);
    }
    const category = getCategoryById(value);
    return category?.name || placeholder;
  }, [value, flatData, showFullPath, getCategoryById, placeholder]);

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
      disabled={disabled}
      onValueChange={handleChange}
      value={value || (allowClear ? "none" : "")}
    >
      <SelectTrigger className={`w-full ${className}`}>
        <SelectValue placeholder={placeholder}>
          {selectedCategoryText}
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
              <div className="flex items-center gap-2">
                {/* 层级缩进 */}
                {option.level > 0 && (
                  <span style={{ paddingLeft: `${option.level * 16}px` }} />
                )}
                <span>{option.label}</span>
                {showFullPath && option.level > 0 && flatData && (
                  <span className="text-gray-500 text-xs">
                    ({getCategoryPath(option.value, flatData)})
                  </span>
                )}
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
