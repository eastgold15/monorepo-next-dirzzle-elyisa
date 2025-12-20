"use client";

import { Switch } from "@radix-ui/react-switch";
import type { MasterCategoryTModel } from "@repo/contract";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import {
  useBatchDeleteMasterCategories,
  useCreateMasterCategory,
  useDeleteMasterCategory,
  useMasterCategoriesTree,
  useUpdateMasterCategory,
} from "@/hooks/api/master-category";
import { useIsSuperAdmin } from "@/stores/user-store";

// 将契约层的实体类型转换为前端使用的带children的类型
type MasterCategory = MasterCategoryTModel["Entity"] & {
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
            {!category.isVisible && (
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

// 创建/编辑主分类对话框
function MasterCategoryDialog({
  category,
  isOpen,
  onClose,
  allCategories,
}: {
  category?: MasterCategory;
  isOpen: boolean;
  onClose: () => void;
  allCategories: MasterCategory[];
}) {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    slug: category?.slug || "",
    description: category?.description || "",
    parentId: category?.parentId || null,
    sortOrder: category?.sortOrder || 0,
    isVisible: category?.isVisible ?? true,
    icon: category?.icon || "",
  });

  const createMutation = useCreateMasterCategory();
  const updateMutation = useUpdateMasterCategory();

  const isEdit = !!category;

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("分类名称不能为空");
      return;
    }
    if (!formData.slug.trim()) {
      toast.error("分类标识不能为空");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("分类描述不能为空");
      return;
    }

    try {
      if (isEdit && category) {
        await updateMutation.mutateAsync({
          id: category.id,
          data: formData,
        });
        toast.success("主分类更新成功");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("主分类创建成功");
      }
      onClose();
    } catch (error) {
      toast.error(isEdit ? "主分类更新失败" : "主分类创建失败");
    }
  };

  // 生成slug
  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  return (
    <Dialog onOpenChange={onClose} open={isOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑主分类" : "创建主分类"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              分类名称 <span className="text-red-500">*</span>
            </Label>
            <Input
              className="focus:ring-2 focus:ring-indigo-500"
              id="name"
              onChange={(e) => {
                const name = e.target.value;
                setFormData({
                  ...formData,
                  name,
                  slug: formData.slug || generateSlug(name),
                });
              }}
              placeholder="请输入分类名称"
              value={formData.name}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">
              分类标识 <span className="text-red-500">*</span>
            </Label>
            <Input
              className="focus:ring-2 focus:ring-indigo-500"
              id="slug"
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              placeholder="分类的唯一标识，用于URL和API"
              value={formData.slug}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              分类描述 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              className="focus:ring-2 focus:ring-indigo-500"
              id="description"
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="请输入分类描述"
              rows={3}
              value={formData.description}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="parent">父分类</Label>
              <Select
                onValueChange={(value) =>
                  setFormData({ ...formData, parentId: value || null })
                }
                value={formData.parentId || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择父分类（可选）" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">无（顶级分类）</SelectItem>
                  {allCategories
                    ?.filter((cat) => !isEdit || cat.id !== category?.id)
                    .map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">排序</Label>
              <Input
                className="focus:ring-2 focus:ring-indigo-500"
                id="sortOrder"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sortOrder: Number.parseInt(e.target.value, 10) || 0,
                  })
                }
                placeholder="0"
                type="number"
                value={formData.sortOrder}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">图标</Label>
            <Input
              className="focus:ring-2 focus:ring-indigo-500"
              id="icon"
              onChange={(e) =>
                setFormData({ ...formData, icon: e.target.value })
              }
              placeholder="图标名称或URL"
              value={formData.icon}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.isVisible}
              id="isVisible"
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isVisible: checked })
              }
            />
            <Label htmlFor="isVisible">显示在分类中</Label>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button onClick={onClose} variant="outline">
            取消
          </Button>
          <Button
            className="bg-indigo-600 text-white hover:bg-indigo-700"
            disabled={createMutation.isPending || updateMutation.isPending}
            onClick={handleSubmit}
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                处理中...
              </span>
            ) : isEdit ? (
              "更新"
            ) : (
              "创建"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
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
  const isSuperAdmin = useIsSuperAdmin();
  const { data: categoriesTree, isLoading } = useMasterCategoriesTree();
  const deleteMutation = useDeleteMasterCategory();
  const batchDeleteMutation = useBatchDeleteMasterCategories();

  // 所有 hooks 必须在权限检查之前调用
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
      const matchesVisibility = showHidden || category.isVisible;
      return matchesSearch && matchesVisibility;
    }) || [];

  const handleEdit = (category: MasterCategory) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
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

                <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-indigo-600 text-white hover:bg-indigo-700">
                      <Plus className="mr-2 h-4 w-4" />
                      添加主分类
                    </Button>
                  </DialogTrigger>
                </Dialog>
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
                  onClick={() => setIsDialogOpen(true)}
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
      <MasterCategoryDialog
        allCategories={filteredCategories || []}
        category={editingCategory}
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingCategory(undefined);
        }}
      />
    </SidebarProvider>
  );
}
