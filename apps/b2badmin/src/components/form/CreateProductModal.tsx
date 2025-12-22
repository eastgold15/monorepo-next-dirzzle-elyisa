"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Package } from "lucide-react";
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
import { MediaSelect } from "@/components/ui/media-select";
import { SiteCategoryTreeSelect } from "@/components/ui/site-category-tree-select";
import { Textarea } from "@/components/ui/textarea";
import { useTemplates } from "@/hooks/api/attributetemplate";
import { useProductsCreate } from "@/hooks/api/products";
import { useSiteCategoryStore } from "@/stores/site-category-store";

const formSchema = z.object({
  spuCode: z.string().min(1, "SPU编码不能为空"),
  name: z.string().min(1, "商品名称不能为空"),
  description: z.string().optional(),
  units: z.string().optional(),
  siteCategoryId: z.string().min(1, "请选择站点分类"),
  templateId: z.string().optional(),
  mediaIds: z.array(z.string()).optional(),
  mainImageId: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CreateProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateProductModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateProductModalProps) {
  const createProduct = useProductsCreate();
  const { siteCategories } = useSiteCategoryStore();
  const { data: templatesData = [] } = useTemplates({ page: 1, limit: 100 });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      spuCode: "",
      name: "",
      description: "",
      units: "",
      siteCategoryId: "",
      templateId: undefined,
      mediaIds: [],
      mainImageId: undefined,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createProduct.mutateAsync(data);
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

  // 自动生成 SPU 编码
  const generateSpuCode = (name: string) => {
    const timestamp = Date.now().toString().slice(-6);
    const prefix = name
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "")
      .slice(0, 6);
    return `${prefix}${timestamp}`;
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            创建新商品
          </DialogTitle>
          <DialogDescription>
            填写商品基本信息，创建新的SPU商品
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="spuCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SPU编码 *</FormLabel>
                    <FormControl>
                      <Input placeholder="例如：PRD001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>商品名称 *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="请输入商品名称"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          // 如果还没有 SPU 编码，自动生成
                          if (!form.getValues("spuCode")) {
                            form.setValue(
                              "spuCode",
                              generateSpuCode(e.target.value)
                            );
                          }
                        }}
                      />
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
                  <FormLabel>商品描述</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="请输入商品详细描述"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="units"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>计量单位</FormLabel>
                    <FormControl>
                      <Input placeholder="例如：个、件、套" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="templateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>属性模板</FormLabel>
                    <FormControl>
                      <select
                        className="w-full rounded-md border p-2"
                        onChange={(e) =>
                          field.onChange(e.target.value || undefined)
                        }
                        value={field.value || ""}
                      >
                        <option value="">选择属性模板（可选）</option>
                        {templatesData.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="siteCategoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>站点分类 *</FormLabel>
                  <FormControl>
                    <SiteCategoryTreeSelect
                      onChange={field.onChange}
                      placeholder="请选择站点分类"
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mediaIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>商品图片</FormLabel>
                  <FormControl>
                    <MediaSelect
                      max={10}
                      multiple
                      onChange={(ids) => field.onChange(ids)}
                      value={field.value || []}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mainImageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>主图</FormLabel>
                  <FormControl>
                    <MediaSelect
                      onChange={(ids) => field.onChange(ids[0] || undefined)}
                      placeholder="选择商品主图"
                      value={field.value ? [field.value] : []}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                disabled={createProduct.isPending}
                onClick={() => onOpenChange(false)}
                type="button"
                variant="outline"
              >
                取消
              </Button>
              <Button disabled={createProduct.isPending} type="submit">
                {createProduct.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    创建中...
                  </>
                ) : (
                  "创建商品"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
