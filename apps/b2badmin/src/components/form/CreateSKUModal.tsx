"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PackagePlus, Plus, X } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateSKUBatch, useProductsForSKU } from "@/hooks/api/skus";

// SKU 基础信息 schema
const skuSchema = z.object({
  skuCode: z.string().optional(), // SKU编码会在提交时自动生成
  price: z.number().min(0, "价格不能小于0"),
  marketPrice: z.number().optional(),
  costPrice: z.number().optional(),
  weight: z.number().optional(),
  volume: z.number().optional(),

  stock: z.number().min(0, "库存不能小于0"),
  specJson: z.record(z.string(), z.string()),
  mediaIds: z.array(z.string()).optional(),
  extraAttributes: z.record(z.string(), z.any()).optional(),
});

// 主表单 schema
const formSchema = z.object({
  productId: z.string().min(1, "请选择商品"),
  skus: z.array(skuSchema).min(1, "至少需要创建一个SKU"),
  baseSkuCode: z.string().min(1, "请输入基础SKU编码"),
});

type FormData = z.infer<typeof formSchema>;

interface CreateSKUModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  productId?: string; // 预设的商品ID
}

export function CreateSKUModal({
  open,
  onOpenChange,
  onSuccess,
  productId,
}: CreateSKUModalProps) {
  const createSKUBatch = useCreateSKUBatch();
  const { data: productsData } = useProductsForSKU();

  // 获取当前商品名称 - 处理可能为空的情况
  const currentProduct = productsData?.data?.find(
    (p: any) => p.id === productId
  );

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: productId || "",
      baseSkuCode: "",
      skus: [
        {
          skuCode: "",
          price: 0,
          marketPrice: undefined,
          costPrice: undefined,
          weight: undefined,
          volume: undefined,
          stock: 0,
          specJson: {},
          mediaIds: [],
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "skus",
  });

  // 当 productId 变化时，更新表单的 productId
  useEffect(() => {
    if (productId) {
      form.setValue("productId", productId);
    }
  }, [productId, form]);

  const onSubmit = async (data: FormData) => {
    console.log("CreateSKUModal onSubmit:", data);
    try {
      // 生成完整的SKU编码
      const processedSkus = data.skus.map((sku, index) => ({
        ...sku,
        skuCode: `${data.baseSkuCode}-${String(index + 1).padStart(3, "0")}`,
      }));
      console.log("Processed SKUs:", processedSkus);

      const result = await createSKUBatch.mutateAsync({
        productId: data.productId,
        skus: processedSkus,
      });
      console.log("Create result:", result);

      onSuccess?.();
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Create SKU error:", error);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
    }
    onOpenChange(isOpen);
  };

  const addSKU = () => {
    append({
      skuCode: "",
      price: 0,
      marketPrice: undefined,
      costPrice: undefined,
      weight: undefined,
      volume: undefined,
      stock: 0,
      specJson: {},
      mediaIds: [],
    });
  };

  const addSpecValue = (skuIndex: number) => {
    const currentSpecs = form.getValues(`skus.${skuIndex}.specJson`) || {};
    const newKey = `规格${Object.keys(currentSpecs).length + 1}`;
    form.setValue(`skus.${skuIndex}.specJson`, {
      ...currentSpecs,
      [newKey]: "",
    });
  };

  const removeSpecValue = (skuIndex: number, specKey: string) => {
    const currentSpecs = form.getValues(`skus.${skuIndex}.specJson`) || {};
    const newSpecs = { ...currentSpecs };
    delete newSpecs[specKey];
    form.setValue(`skus.${skuIndex}.specJson`, newSpecs);
  };

  return (
    <Dialog
      key={productId || "create"}
      onOpenChange={handleOpenChange}
      open={open}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[1200px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5" />
            {currentProduct
              ? `为 "${currentProduct.name}" 创建 SKU`
              : "批量创建 SKU"}
          </DialogTitle>
          <DialogDescription>
            {currentProduct
              ? `为商品 "${currentProduct.name}" 批量创建SKU，支持规格组合定价`
              : "为商品批量创建SKU，支持规格组合定价"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            {/* 基础信息 */}
            <div className="grid grid-cols-2 gap-4">
              {/* 商品选择 - 只有在没有预设 productId 时显示 */}
              {!productId && (
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>商品 *</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择商品" />
                          </SelectTrigger>
                          <SelectContent>
                            {productsData?.data?.map((product: any) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="baseSkuCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>基础SKU编码 *</FormLabel>
                    <FormControl>
                      <Input placeholder="例如：SHIRT-RED" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* SKU列表 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-lg">SKU列表</h3>
                <Button
                  onClick={addSKU}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  添加SKU
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {fields.map((field, index) => (
                  <Card key={field.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="font-medium text-sm">
                          SKU {index + 1}
                        </CardTitle>
                        {fields.length > 1 && (
                          <Button
                            onClick={() => remove(index)}
                            size="sm"
                            type="button"
                            variant="ghost"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* 基础价格信息 */}
                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name={`skus.${index}.price`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>售价 *</FormLabel>
                              <FormControl>
                                <Input
                                  min={0}
                                  placeholder="0.00"
                                  step={0.01}
                                  type="number"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      Number.parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`skus.${index}.stock`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>库存 *</FormLabel>
                              <FormControl>
                                <Input
                                  min={0}
                                  placeholder="0"
                                  type="number"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      Number.parseInt(e.target.value, 10) || 0
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name={`skus.${index}.marketPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>市场价</FormLabel>
                              <FormControl>
                                <Input
                                  min={0}
                                  placeholder="0.00"
                                  step={0.01}
                                  type="number"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value
                                        ? Number.parseFloat(e.target.value)
                                        : undefined
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`skus.${index}.costPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>成本价</FormLabel>
                              <FormControl>
                                <Input
                                  min={0}
                                  placeholder="0.00"
                                  step={0.01}
                                  type="number"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value
                                        ? Number.parseFloat(e.target.value)
                                        : undefined
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name={`skus.${index}.weight`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>重量(kg)</FormLabel>
                              <FormControl>
                                <Input
                                  min={0}
                                  placeholder="0.000"
                                  step={0.001}
                                  type="number"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value
                                        ? Number.parseFloat(e.target.value)
                                        : undefined
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`skus.${index}.volume`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>体积(m³)</FormLabel>
                              <FormControl>
                                <Input
                                  min={0}
                                  placeholder="0.000"
                                  step={0.001}
                                  type="number"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value
                                        ? Number.parseFloat(e.target.value)
                                        : undefined
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* 规格信息 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-sm">规格信息</FormLabel>
                          <Button
                            onClick={() => addSpecValue(index)}
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            添加规格
                          </Button>
                        </div>

                        <div className="space-y-1">
                          {Object.entries(
                            form.watch(`skus.${index}.specJson`) || {}
                          ).map(([key, value]) => (
                            <div className="flex gap-2" key={key}>
                              <Input
                                className="flex-1"
                                placeholder="规格名"
                                readOnly
                                value={key}
                              />
                              <Input
                                className="flex-1"
                                onChange={(e) => {
                                  const currentSpecs =
                                    form.getValues(`skus.${index}.specJson`) ||
                                    {};
                                  form.setValue(`skus.${index}.specJson`, {
                                    ...currentSpecs,
                                    [key]: e.target.value,
                                  });
                                }}
                                placeholder="规格值"
                                value={value || ""}
                              />
                              <Button
                                onClick={() => removeSpecValue(index, key)}
                                size="sm"
                                type="button"
                                variant="ghost"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* SKU 图片选择 */}
                      <FormField
                        control={form.control}
                        name={`skus.${index}.mediaIds`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">SKU 图片</FormLabel>
                            <FormControl>
                              <MediaSelect
                                maxCount={6}
                                multiple
                                onChange={(ids) => field.onChange(ids)}
                                placeholder="选择 SKU 图片（最多 6 张）"
                                value={field.value || []}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* 显示生成的SKU编码 */}
                      <div>
                        <Badge className="text-xs" variant="outline">
                          {form.watch("baseSkuCode")
                            ? `${form.watch("baseSkuCode")}-${String(
                                index + 1
                              ).padStart(3, "0")}`
                            : "SKU-待生成"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button
                disabled={createSKUBatch.isPending}
                onClick={() => onOpenChange(false)}
                type="button"
                variant="outline"
              >
                取消
              </Button>
              <Button disabled={createSKUBatch.isPending} type="submit">
                {createSKUBatch.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    创建中...
                  </>
                ) : (
                  `批量创建 ${fields.length} 个SKU`
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
