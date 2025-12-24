"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Loader2 } from "lucide-react";
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
import { useFactoryCreate } from "@/hooks/api/factory";

const formSchema = z.object({
  name: z.string().min(2, "工厂名称至少需要2个字符"),
  code: z.string().min(2, "工厂编码至少需要2个字符"),
  description: z.string().optional(),
  website: z.url("请输入有效的网站地址").or(z.literal("")),
  address: z.string().min(5, "请输入详细地址"),
  contactPhone: z.string().min(5, "请输入联系电话"),
  employeeCount: z.number().optional(),
  mainProducts: z.string().optional(),
  annualRevenue: z.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CreateFactoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateFactoryModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateFactoryModalProps) {
  const createFactory = useFactoryCreate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      website: "",
      address: "",
      contactPhone: "",
      employeeCount: undefined,
      mainProducts: "",
      annualRevenue: undefined,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createFactory.mutateAsync(data);
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
            <Building2 className="h-5 w-5" />
            创建新工厂
          </DialogTitle>
          <DialogDescription>
            填写工厂基本信息，创建新的制造工厂
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
                    <FormLabel>工厂名称</FormLabel>
                    <FormControl>
                      <Input placeholder="例如：华为制造工厂" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>工厂编码</FormLabel>
                    <FormControl>
                      <Input placeholder="例如：HW001" {...field} />
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
                  <FormLabel>工厂描述</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入工厂的详细描述" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>官网地址 *</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>详细地址 *</FormLabel>
                  <FormControl>
                    <Input placeholder="广东省深圳市南山区科技园" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>联系电话 *</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：0755-88888888" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="employeeCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>员工数量</FormLabel>
                    <FormControl>
                      <Input
                        min={0}
                        placeholder="例如：500"
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mainProducts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>主要产品</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="例如：电子元件、通信设备"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                disabled={createFactory.isPending}
                onClick={() => onOpenChange(false)}
                type="button"
                variant="outline"
              >
                取消
              </Button>
              <Button disabled={createFactory.isPending} type="submit">
                {createFactory.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    创建中...
                  </>
                ) : (
                  "创建工厂"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
