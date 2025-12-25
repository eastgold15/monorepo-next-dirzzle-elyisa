"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FolderOpen, Loader2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCreateMasterCategory } from "@/hooks/api/master-categories";

const formSchema = z.object({
  name: z.string().min(1, "分类名称不能为空"),
  slug: z
    .string()
    .min(1, "标识符不能为空")
    .regex(/^[a-z0-9-]+$/, "标识符只能包含小写字母、数字和连字符"),
  description: z.string().min(1, "描述不能为空"),
  parentId: z.string().optional(),
  sortOrder: z.number().optional().default(0),
  isVisible: z.boolean().optional().default(true),
  icon: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CreateMasterCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateMasterCategoryModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateMasterCategoryModalProps) {
  const createMasterCategory = useCreateMasterCategory();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      parentId: undefined,
      sortOrder: 0,
      isVisible: true,
      icon: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createMasterCategory.mutateAsync({
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

  // 生成 slug
  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
      .replace(/^-+|-+$/g, "");

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            创建Master分类
          </DialogTitle>
          <DialogDescription>
            创建全局Master分类，用于跨站点的分类标准化管理
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>分类名称 *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="请输入分类名称"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          // 自动生成 slug
                          if (!form.getValues("slug")) {
                            form.setValue("slug", generateSlug(e.target.value));
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>标识符 *</FormLabel>
                    <FormControl>
                      <Input placeholder="category-slug" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述 *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="请输入分类描述"
                      rows={3}
                      {...field}
                    />
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
                    <MasterCategorySelect
                      excludeId={field.value}
                      onChange={field.onChange}
                      placeholder="选择父级分类（可选）"
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
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

              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>图标</FormLabel>
                    <FormControl>
                      <Input placeholder="例如: shopping-bag" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isVisible"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">是否可见</FormLabel>
                    <div className="text-muted-foreground text-sm">
                      启用后该分类将在前端显示
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                disabled={createMasterCategory.isPending}
                onClick={() => onOpenChange(false)}
                type="button"
                variant="outline"
              >
                取消
              </Button>
              <Button disabled={createMasterCategory.isPending} type="submit">
                {createMasterCategory.isPending ? (
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
