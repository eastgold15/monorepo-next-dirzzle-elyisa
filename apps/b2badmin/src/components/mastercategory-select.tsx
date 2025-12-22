"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMasterCategoriesTree } from "@/hooks/api/mastercategory";
import { useMasterCategoryStore } from "@/stores/mastercategory-store";

interface MasterCategorySelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showFullPath?: boolean; // 是否显示完整路径
}

// 递归获取分类的完整路径
function getCategoryPath(
  categoryId: string,
  flatData: Map<string, any>
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
  onValueChange,
  placeholder = "选择主分类",
  disabled = false,
  className,
  showFullPath = false,
}: MasterCategorySelectProps) {
  const { data: categoriesTree, isLoading } = useMasterCategoriesTree();
  const { flatData } = useMasterCategoryStore();

  // 将树形结构扁平化为数组
  const flattenedCategories = useMemo(() => {
    if (!categoriesTree) return [];

    const result: any[] = [];

    function traverse(nodes: any[], level = 0) {
      nodes.forEach((node) => {
        result.push({ ...node, level });
        if (node.children && node.children.length > 0) {
          traverse(node.children, level + 1);
        }
      });
    }

    traverse(categoriesTree);
    return result;
  }, [categoriesTree]);

  // 获取显示文本
  const displayText = useMemo(() => {
    if (!(value && flatData)) return "";

    if (showFullPath) {
      return getCategoryPath(value, flatData);
    }

    const category = flatData.get(value);
    return category ? category.name : "";
  }, [value, flatData, showFullPath]);

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger className={className}>
          <SelectValue placeholder="加载中..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select disabled={disabled} onValueChange={onValueChange} value={value}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder}>{displayText}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {flattenedCategories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            <div className="flex items-center">
              {/* 添加缩进表示层级 */}
              <span style={{ paddingLeft: `${category.level * 16}px` }}>
                {category.name}
                {showFullPath && category.parentId && (
                  <span className="ml-2 text-gray-500 text-xs">
                    ({getCategoryPath(category.id, flatData)})
                  </span>
                )}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
