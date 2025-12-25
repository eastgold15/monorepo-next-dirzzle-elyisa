"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserCog } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useManageableUsers } from "@/hooks/api";
import { useRolesList } from "@/hooks/api/role";
import { useAccessibleSites } from "@/hooks/api/sites";
import { useUserSiteRoleCreate } from "@/hooks/api/usersiteroles";

const formSchema = z.object({
  userId: z.string().min(1, "请选择用户"),
  siteId: z.string().min(1, "请选择站点"),
  roleId: z.string().min(1, "请选择角色"),
});

type FormData = z.infer<typeof formSchema>;

interface AssignUserRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AssignUserRoleModal({
  open,
  onOpenChange,
  onSuccess,
}: AssignUserRoleModalProps) {
  const createMutation = useUserSiteRoleCreate();

  // 获取用户列表
  const { data: usersData, isLoading: usersLoading } = useManageableUsers();
  // 获取站点列表
  const { data: sitesData, isLoading: sitesLoading } = useAccessibleSites();
  // 获取角色列表
  const { data: rolesData, isLoading: rolesLoading } = useRolesList({});

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
      siteId: "",
      roleId: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createMutation.mutateAsync(data);
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

  const isLoading = usersLoading || sitesLoading || rolesLoading;

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            分配用户角色
          </DialogTitle>
          <DialogDescription>
            为用户分配站点和角色，授予相应的访问权限
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>选择用户</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择用户" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {usersData?.data?.map((user: any) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="siteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>选择站点</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择站点" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(sitesData || []).map((site: any) => (
                          <SelectItem key={site.id} value={site.id}>
                            {site.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>选择角色</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择角色" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(rolesData || []).map((role: any) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                            {role.type === "system" && (
                              <span className="text-slate-500 text-xs">
                                {" "}
                                (系统)
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  disabled={createMutation.isPending}
                  onClick={() => onOpenChange(false)}
                  type="button"
                  variant="outline"
                >
                  取消
                </Button>
                <Button disabled={createMutation.isPending} type="submit">
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      分配中...
                    </>
                  ) : (
                    "确认分配"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
