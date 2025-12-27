"use client";

import { Label } from "@radix-ui/react-label";
import { Switch } from "@radix-ui/react-switch";
import type { MasterDTO } from "@repo/contract";
import {
  ChevronDown,
  ChevronRight,
  Edit,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { CreateMasterCategoryModal } from "@/components/form/CreateMasterCategoryModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  useBatchDeleteMasterCategories,
  useDeleteMasterCategory,
  useMasterCategoriesTree,
} from "@/hooks/api/master-categories";
import { useAuthStore } from "@/stores/auth-store";

// 将契约层的实体类型转换为前端使用的带children的类型
type MasterCategory = MasterDTO["Response"] & {
  children?: MasterCategory[];
};

// 树形节点组件
function MasterCategoryTreeNode({
  category,
  level,
  onEdit,
  onDelete,
  selectedIds,
  onSelect,
  allCategories,
}: {
  category: MasterCategory;
  level: number;
  onEdit: (category: MasterCategory) => void;
  onDelete: (category: MasterCategory) => void;
  selectedIds: Set<string>;
  onSelect: (id: string, checked: boolean) => void;
  allCategories: MasterCategory[];
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const categoryPath = getMasterCategoryPath(category, allCategories);

  return (
    <div>
      <div
        className="group flex items-center gap-2 border-slate-100 border-b px-4 py-3 transition-colors hover:bg-slate-50"
        style={{ paddingLeft: `${level * 24 + 16}px` }}
      >
        <input
          checked={selectedIds.has(category.id)}
          className="rounded border-slate-300 text-slate-600 focus:ring-2 focus:ring-indigo-500"
          onChange={(e) => onSelect(category.id, e.target.checked)}
          type="checkbox"
        />

        {category.children && category.children.length > 0 && (
          <button
            className="rounded p-1 transition-colors hover:bg-slate-200"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-500" />
            )}
          </button>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium text-slate-900">
              {category.name}
            </span>
            <span className="whitespace-nowrap text-slate-500 text-xs">
              排序: {category.sortOrder}
            </span>
            {!category.isActive && (
              <span className="rounded bg-amber-50 px-2 py-1 text-amber-600 text-xs">
                隐藏
              </span>
            )}
          </div>
          {categoryPath && (
            <div className="truncate text-slate-400 text-xs">
              {categoryPath}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            className="h-8 w-8 p-0"
            onClick={() => onEdit(category)}
            size="sm"
            variant="ghost"
          >
            <Edit className="h-4 w-4" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                size="sm"
                variant="ghost"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认删除</AlertDialogTitle>
                <AlertDialogDescription>
                  确定要删除主分类 "{category.name}" 吗？此操作不可撤销。
                  {category.children && category.children.length > 0 && (
                    <div className="mt-2 rounded border border-amber-200 bg-amber-50 p-2 text-amber-800 text-sm">
                      ⚠️ 该主分类下有 {category.children.length}{" "}
                      个子分类，删除后子分类也会被删除。
                    </div>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(category)}>
                  删除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {isExpanded && category.children && category.children.length > 0 && (
        <div>
          {category.children.map((child) => (
            <MasterCategoryTreeNode
              allCategories={allCategories}
              category={child}
              key={child.id}
              level={level + 1}
              onDelete={onDelete}
              onEdit={onEdit}
              onSelect={onSelect}
              selectedIds={selectedIds}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// 获取分类路径（用于显示）
function getMasterCategoryPath(
  category: MasterCategory,
  allCategories: MasterCategory[]
): string {
  const path: string[] = [];
  let currentCategory: MasterCategory | undefined = category;

  while (currentCategory) {
    path.unshift(currentCategory.name);
    if (currentCategory.parentId) {
      currentCategory = findMasterCategoryById(
        currentCategory.parentId,
        allCategories
      );
    } else {
      break;
    }
  }

  return path.join(" > ");
}

// 根据ID查找分类
function findMasterCategoryById(
  id: string,
  categories: MasterCategory[]
): MasterCategory | undefined {
  for (const category of categories) {
    if (category.id === id) {
      return category;
    }
    if (category.children && category.children.length > 0) {
      const found = findMasterCategoryById(id, category.children);
      if (found) {
        return found;
      }
    }
  }
  return;
}

export default function MasterCategoryManager() {
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = user?.isSuperAdmin;
  const { data: categoriesTree, isLoading } = useMasterCategoriesTree();
  const deleteMutation = useDeleteMasterCategory();
  const batchDeleteMutation = useBatchDeleteMasterCategories();

  // 所有 hooks 必须在权限检查之前调用
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<
    MasterCategory | undefined
  >();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [showHidden, setShowHidden] = useState(false);

  // 权限检查：只有超级管理员才能访问
  if (!isSuperAdmin) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <h2 className="mb-2 font-bold text-2xl text-slate-900">
                权限不足
              </h2>
              <p className="text-slate-500">只有超级管理员才能访问主分类管理</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // 过滤分类
  const filteredCategories =
    categoriesTree?.filter((category) => {
      const matchesSearch =
        !searchTerm ||
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.slug.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesVisibility = showHidden || category.isActive;
      return matchesSearch && matchesVisibility;
    }) || [];

  const handleEdit = (category: MasterCategory) => {
    setEditingCategory(category);
    setIsCreateModalOpen(true);
  };

  const handleDelete = async (category: MasterCategory) => {
    try {
      await deleteMutation.mutateAsync(category.id);
      toast.success("主分类删除成功");
    } catch (error) {
      toast.error("主分类删除失败");
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) {
      toast.error("请选择要删除的主分类");
      return;
    }

    try {
      await batchDeleteMutation.mutateAsync({ ids: Array.from(selectedIds) });
      toast.success(`成功删除 ${selectedIds.size} 个主分类`);
      setSelectedIds(new Set());
    } catch (error) {
      toast.error("批量删除失败");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // 递归收集所有分类ID
      const allIds: string[] = [];
      const collectIds = (cats: MasterCategory[]) => {
        cats.forEach((cat) => {
          allIds.push(cat.id);
          if (cat.children && cat.children.length > 0) {
            collectIds(cat.children);
          }
        });
      };
      if (filteredCategories) {
        collectIds(filteredCategories);
      }
      setSelectedIds(new Set(allIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelect = (id: string, checked: boolean) => {
    const newSelectedIds = new Set(selectedIds);
    if (checked) {
      newSelectedIds.add(id);
    } else {
      newSelectedIds.delete(id);
    }
    setSelectedIds(newSelectedIds);
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
              <p className="mt-2 text-slate-500">加载中...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const hasCategories = filteredCategories && filteredCategories.length > 0;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator className="mr-2 h-4" orientation="vertical" />
            <nav className="font-medium text-sm">主分类管理</nav>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          {/* 页面头部 */}
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="font-bold text-3xl text-slate-900">主分类管理</h1>
              <p className="mt-2 text-slate-600">
                管理全局主分类体系，这是所有站点分类的标准参考。出口商的站点分类通过映射关系关联到主分类。
              </p>
              <p className="mt-1 text-slate-500 text-sm">
                <a
                  className="text-indigo-600 hover:underline"
                  href="/dashboard/master-categories/demo"
                >
                  查看主分类选择器演示
                </a>
              </p>
            </div>

            {/* 搜索和操作栏 */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-1 items-center gap-4">
                <div className="relative max-w-md flex-1">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    className="pl-10"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="搜索主分类名称或标识..."
                    type="text"
                    value={searchTerm}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Label htmlFor="showHidden">显示隐藏分类</Label>
                  <Switch
                    checked={showHidden}
                    id="showHidden"
                    onCheckedChange={setShowHidden}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                {selectedIds.size > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        批量删除 ({selectedIds.size})
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确认批量删除</AlertDialogTitle>
                        <AlertDialogDescription>
                          确定要删除选中的 {selectedIds.size}{" "}
                          个主分类吗？此操作不可撤销。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBatchDelete}>
                          删除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                <Button
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={() => {
                    setEditingCategory(undefined);
                    setIsCreateModalOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  添加主分类
                </Button>
              </div>
            </div>
          </div>

          {/* 分类列表 */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            {hasCategories && (
              <div className="border-slate-200 border-b bg-slate-50 px-4 py-3">
                <label className="flex items-center gap-2 font-medium text-slate-700 text-sm">
                  <input
                    checked={
                      selectedIds.size > 0 && filteredCategories
                        ? selectedIds.size === filteredCategories.length
                        : false
                    }
                    className="rounded border-slate-300 text-slate-600 focus:ring-2 focus:ring-indigo-500"
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    type="checkbox"
                  />
                  全选
                  <span className="text-slate-500">
                    ({selectedIds.size}/{filteredCategories.length})
                  </span>
                </label>
              </div>
            )}

            {hasCategories ? (
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                {filteredCategories.map((category) => (
                  <MasterCategoryTreeNode
                    allCategories={filteredCategories}
                    category={category}
                    key={category.id}
                    level={0}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onSelect={handleSelect}
                    selectedIds={selectedIds}
                  />
                ))}
              </div>
            ) : (
              <div className="px-8 py-12 text-center">
                <div className="mb-6">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                    <Plus className="h-8 w-8 text-slate-400" />
                  </div>
                </div>
                <h3 className="mb-2 font-semibold text-slate-900 text-xl">
                  暂无主分类
                </h3>
                <p className="mx-auto mb-6 max-w-md text-slate-500">
                  创建第一个主分类来开始构建全局分类体系
                </p>
                <Button
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={() => {
                    setEditingCategory(undefined);
                    setIsCreateModalOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  创建主分类
                </Button>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>

      {/* 创建/编辑主分类对话框 */}
      <CreateMasterCategoryModal
        editingCategory={editingCategory}
        onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) {
            setEditingCategory(undefined);
          }
        }}
        onSuccess={() => {
          // 数据会通过 React Query 自动刷新
        }}
        open={isCreateModalOpen}
      />
    </SidebarProvider>
  );
}
