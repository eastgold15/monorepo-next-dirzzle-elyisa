"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Key, Loader2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePermissionCreate } from "@/hooks/api/permission";

// 权限分组和操作
const PERMISSION_GROUPS = {
  USER: "用户管理",
  PRODUCT: "商品管理",
  SKU: "SKU管理",
  ORDER: "订单管理",
  SITE: "站点管理",
  MEDIA: "媒体管理",
  ADVERTISEMENT: "广告管理",
  FACTORY: "工厂管理",
  EXPORTER: "出口商管理",
  SYSTEM: "系统管理",
};

const PERMISSION_ACTIONS = {
  VIEW: "查看",
  CREATE: "创建",
  EDIT: "编辑",
  DELETE: "删除",
  MANAGE: "管理",
  ALL: "全部权限",
};

const formSchema = z.object({
  name: z.string().min(2, "权限名称至少需要2个字符"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CreatePermissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreatePermissionModal({
  open,
  onOpenChange,
  onSuccess,
}: CreatePermissionModalProps) {
  const createPermission = usePermissionCreate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createPermission.mutateAsync(data);
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

  // 快速生成权限名称
  const generatePermissionName = (group: string, action: string) => {
    if (action === "ALL") {
      return group;
    }
    return `${group}_${action}`;
  };

  const onGroupChange = (group: string) => {
    const currentName = form.getValues("name");
    const currentAction = currentName?.split("_").pop() || "VIEW";
    form.setValue("name", generatePermissionName(group, currentAction));
  };

  const onActionChange = (action: string) => {
    const currentName = form.getValues("name");
    const parts = currentName?.split("_") || [];
    const group = parts.length > 1 ? parts.slice(0, -1).join("_") : "USER";
    form.setValue("name", generatePermissionName(group, action));
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            创建新权限
          </DialogTitle>
          <DialogDescription>创建系统权限，用于角色权限配置</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>权限名称</FormLabel>
                    <FormControl>
                      <Input placeholder="例如：PRODUCT_VIEW" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>权限分组</FormLabel>
                <Select onValueChange={onGroupChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择分组" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(PERMISSION_GROUPS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>

              <FormItem>
                <FormLabel>权限操作</FormLabel>
                <Select onValueChange={onActionChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择操作" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(PERMISSION_ACTIONS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>权限描述</FormLabel>
                  <FormControl>
                    <Input placeholder="描述该权限的作用和范围" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                disabled={createPermission.isPending}
                onClick={() => onOpenChange(false)}
                type="button"
                variant="outline"
              >
                取消
              </Button>
              <Button disabled={createPermission.isPending} type="submit">
                {createPermission.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    创建中...
                  </>
                ) : (
                  "创建权限"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
