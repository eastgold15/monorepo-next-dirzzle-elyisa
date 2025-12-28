"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMasterCategories } from "@/hooks/api/master-categories";
import { useUpdateSalesperson } from "@/hooks/api/salesperson";
import { useUpdateSalespersonMasterCategories } from "@/hooks/api/salesperson";
import type { SalespersonWithDetails } from "@repo/contract";

const formSchema = z.object({
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  avatar: z.string().optional(),
  isActive: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EditSalespersonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  salesperson: SalespersonWithDetails | null;
}

export function EditSalespersonModal({
  open,
  onOpenChange,
  onSuccess,
  salesperson,
}: EditSalespersonModalProps) {
  const updateSalesperson = useUpdateSalesperson();
  const updateMasterCategories = useUpdateSalespersonMasterCategories();
  const { data: masterCategoriesResponse } = useMasterCategories({
    page: 1,
    limit: 100,
  });
  const masterCategories = masterCategoriesResponse || [];

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: "",
      whatsapp: "",
      position: "",
      department: "",
      avatar: "",
      isActive: true,
    },
  });

  // 当 salesperson 变化时，填充表单
  useEffect(() => {
    if (salesperson) {
      form.reset({
        phone: salesperson.phone || "",
        whatsapp: salesperson.whatsapp || "",
        position: salesperson.position || "",
        department: salesperson.department || "",
        avatar: salesperson.avatar || "",
        isActive: salesperson.user?.isActive ?? true,
      });
    }
  }, [salesperson, form]);

  // 当前已选择的主分类 ID
  const selectedMasterCategoryIds =
    salesperson?.masterCategories?.map((mc) => mc.masterCategoryId) || [];

  const onSubmit = async (data: FormData) => {
    if (!salesperson) return;

    try {
      // 更新业务员基本信息
      await updateSalesperson.mutateAsync({
        id: salesperson.id,
        data,
      });

      // 更新主分类
      await updateMasterCategories.mutateAsync({
        id: salesperson.id,
        masterCategoryIds: selectedMasterCategoryIds,
      });

      onSuccess?.();
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
    updateSalesperson.isPending || updateMasterCategories.isPending;

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>编辑业务员</DialogTitle>
          <DialogDescription>
            修改业务员的基本信息和负责的主分类
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            {/* 业务员信息 */}
            <div className="space-y-4">
              <div className="border-slate-200 border-b pb-2">
                <h3 className="font-semibold text-slate-900">业务员信息</h3>
                <p className="text-slate-500 text-sm">
                  设置业务员的联系方式和职位信息
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>手机号码</FormLabel>
                      <FormControl>
                        <Input placeholder="+86 138 0000 0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp</FormLabel>
                      <FormControl>
                        <Input placeholder="+86 138 0000 0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>职位</FormLabel>
                      <FormControl>
                        <Input placeholder="销售经理" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>部门</FormLabel>
                      <FormControl>
                        <Input placeholder="销售部" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>头像 URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/avatar.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>账号状态</FormLabel>
                      <p className="text-slate-500 text-xs">
                        启用后业务员可以登录系统
                      </p>
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
            </div>

            {/* 主分类分配 */}
            <div className="space-y-4">
              <div className="border-slate-200 border-b pb-2">
                <h3 className="font-semibold text-slate-900">主分类分配</h3>
                <p className="text-slate-500 text-sm">
                  选择该业务员负责的主分类（可多选）
                </p>
              </div>

              <div>
                <div className="mb-2 block">
                  <Label>负责的主分类</Label>
                </div>
                <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-3">
                  {masterCategories.length === 0 ? (
                    <p className="text-slate-500 text-sm">暂无主分类</p>
                  ) : (
                    masterCategories.map((category) => {
                      const isSelected =
                        selectedMasterCategoryIds.includes(category.id);
                      return (
                        <div
                          className="flex items-center space-x-2"
                          key={category.id}
                        >
                          <Switch
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                selectedMasterCategoryIds.push(category.id);
                              } else {
                                const index = selectedMasterCategoryIds.indexOf(
                                  category.id
                                );
                                if (index > -1) {
                                  selectedMasterCategoryIds.splice(index, 1);
                                }
                              }
                              // 强制重新渲染
                              form.setValue("phone", form.getValues("phone"));
                            }}
                          />
                          <label className="text-slate-700 text-sm">
                            {category.name}
                          </label>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

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
                    保存中...
                  </>
                ) : (
                  "保存修改"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
