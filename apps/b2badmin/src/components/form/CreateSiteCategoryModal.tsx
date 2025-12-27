"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { SiteCategoriesDTO } from "@repo/contract";
import { FolderPlus, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MasterCategorySelect } from "@/components/ui/master-category-select";
import { SiteCategoryTreeSelect } from "@/components/ui/site-category-tree-select";
import {
  useCreateSiteCategory,
  useUpdateSiteCategory,
} from "@/hooks/api/site-category";

type SiteCategory = SiteCategoriesDTO["TreeResponse"];

const formSchema = z.object({
  name: z.string().min(1, "分类名称不能为空"),
  parentId: z.string().optional(),
  sortOrder: z.number().optional(),
  masterCategoryId: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CreateSiteCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editingCategory?: SiteCategory;
}

export function CreateSiteCategoryModal({
  open,
  onOpenChange,
  onSuccess,
  editingCategory,
}: CreateSiteCategoryModalProps) {
  const createSiteCategory = useCreateSiteCategory();
  const updateSiteCategory = useUpdateSiteCategory();

  const isEdit = !!editingCategory;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      parentId: undefined,
      sortOrder: 0,
      masterCategoryId: undefined,
    },
  });

  // 当编辑的分类变化时，重置表单
  useEffect(() => {
    if (editingCategory) {
      form.reset({
        name: editingCategory.name,
        parentId: editingCategory.parentId || undefined,
        // sortOrder: editingCategory.sortOrder,
        masterCategoryId: editingCategory.masterCategoryId || undefined,
      });
    } else {
      form.reset({
        name: "",
        parentId: undefined,
        sortOrder: 0,
        masterCategoryId: undefined,
      });
    }
  }, [editingCategory, form]);

  const onSubmit = async (data: FormData) => {
    try {
      // 将空字符串的 parentId 转换为 null
      const submitData = {
        ...data,
        parentId: data.parentId || null,
        sortOrder: data.sortOrder || 0,
      };

      if (isEdit && editingCategory) {
        await updateSiteCategory.mutateAsync({
          id: editingCategory.id,
          data: submitData,
        });
      } else {
        await createSiteCategory.mutateAsync(submitData);
      }
      onSuccess?.();
      form.reset();
      onOpenChange(false);
    } catch (error) {
      // 错误已在 mutation 中处理
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
    }
    onOpenChange(isOpen);
  };

  const isLoading =
    createSiteCategory.isPending || updateSiteCategory.isPending;

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            {isEdit ? "编辑站点分类" : "创建站点分类"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "修改站点分类信息" : "创建新的站点分类，支持树形结构组织"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>分类名称 *</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入分类名称" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>父级分类</FormLabel>
                  <FormControl>
                    <SiteCategoryTreeSelect
                      onChange={field.onChange}
                      placeholder="选择父级分类（可选）"
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="masterCategoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>关联Master分类</FormLabel>
                  <FormControl>
                    <MasterCategorySelect
                      onChange={field.onChange}
                      placeholder="选择关联的Master分类（可选）"
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>排序</FormLabel>
                  <FormControl>
                    <Input
                      min={0}
                      placeholder="0"
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.valueAsNumber || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                disabled={isLoading}
                onClick={() => onOpenChange(false)}
                type="button"
                variant="outline"
              >
                取消
              </Button>
              <Button disabled={isLoading} type="submit">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEdit ? "保存中..." : "创建中..."}
                  </>
                ) : isEdit ? (
                  "保存修改"
                ) : (
                  "创建分类"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
