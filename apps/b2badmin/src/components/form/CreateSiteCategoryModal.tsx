"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FolderPlus, Loader2 } from "lucide-react";
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
import { useCreateSiteCategory } from "@/hooks/api/site-category";
import { useMasterCategoryStore } from "@/stores/master-categories-store";

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
}

export function CreateSiteCategoryModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateSiteCategoryModalProps) {
  const createSiteCategory = useCreateSiteCategory();
  const { flatData } = useMasterCategoryStore();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      parentId: undefined,
      sortOrder: 0,
      masterCategoryId: undefined,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createSiteCategory.mutateAsync({
        ...data,
        sortOrder: data.sortOrder || 0,
      });
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

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            创建站点分类
          </DialogTitle>
          <DialogDescription>
            创建新的站点分类，支持树形结构组织
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
                disabled={createSiteCategory.isPending}
                onClick={() => onOpenChange(false)}
                type="button"
                variant="outline"
              >
                取消
              </Button>
              <Button disabled={createSiteCategory.isPending} type="submit">
                {createSiteCategory.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    创建中...
                  </>
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
