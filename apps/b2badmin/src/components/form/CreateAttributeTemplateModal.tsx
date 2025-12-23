"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Loader2, Plus, X } from "lucide-react";
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
import { MasterCategorySelect } from "@/components/ui/master-category-select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTemplate } from "@/hooks/api/attributetemplate";
import { useMasterCategoryStore } from "@/stores/mastercategory-store";

// 属性值的 schema
const attributeValueSchema = z.object({
  value: z.string().min(1, "属性值不能为空"),
  sort: z.number().optional().default(0),
});

// 属性的 schema
const attributeSchema = z.object({
  name: z.string().min(1, "属性名不能为空"),
  type: z.enum(["text", "number", "select", "multiselect", "boolean"]),
  required: z.boolean().optional().default(false),
  sort: z.number().optional().default(0),
  values: z.array(attributeValueSchema).optional(),
});

// 主表单 schema
const formSchema = z.object({
  name: z.string().min(1, "模板名称不能为空"),
  categoryId: z.string().min(1, "请选择分类"),
  description: z.string().optional(),
  attributes: z.array(attributeSchema).min(1, "至少需要添加一个属性"),
});

type FormData = z.infer<typeof formSchema>;

interface CreateAttributeTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateAttributeTemplateModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateAttributeTemplateModalProps) {
  const createAttributeTemplate = useCreateTemplate();
  const { masterCategories } = useMasterCategoryStore();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      description: "",
      attributes: [
        {
          name: "",
          type: "text",
          required: false,
          sort: 0,
          values: [],
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "attributes",
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createAttributeTemplate.mutateAsync(data);
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

  const addAttribute = () => {
    append({
      name: "",
      type: "text",
      required: false,
      sort: fields.length,
      values: [],
    });
  };

  const getAttributeTypeLabel = (type: string) => {
    const typeMap = {
      text: "文本",
      number: "数字",
      select: "单选",
      multiselect: "多选",
      boolean: "布尔值",
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            创建属性模板
          </DialogTitle>
          <DialogDescription>
            创建商品属性模板，用于标准化商品的属性定义
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            {/* 基本信息 */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>模板名称 *</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入模板名称" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>所属分类 *</FormLabel>
                      <FormControl>
                        <MasterCategorySelect
                          onChange={field.onChange}
                          placeholder="选择Master分类"
                          value={field.value}
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
                    <FormLabel>模板描述</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="请输入模板描述（可选）"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 属性列表 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-lg">属性定义</h3>
                <Button
                  onClick={addAttribute}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  添加属性
                </Button>
              </div>

              {fields.map((field, index) => (
                <Card key={field.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-medium text-sm">
                        属性 {index + 1}
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
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name={`attributes.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>属性名 *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="例如：颜色、尺寸"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`attributes.${index}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>属性类型 *</FormLabel>
                            <FormControl>
                              <select
                                className="w-full rounded-md border p-2"
                                {...field}
                              >
                                <option value="text">文本</option>
                                <option value="number">数字</option>
                                <option value="select">单选</option>
                                <option value="multiselect">多选</option>
                                <option value="boolean">布尔值</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <FormField
                        control={form.control}
                        name={`attributes.${index}.required`}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <input
                                checked={field.value}
                                className="rounded"
                                onChange={field.onChange}
                                type="checkbox"
                              />
                            </FormControl>
                            <FormLabel className="font-normal text-sm">
                              必填
                            </FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`attributes.${index}.sort`}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormLabel className="font-normal text-sm">
                              排序
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="w-20"
                                min={0}
                                type="number"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(e.target.valueAsNumber || 0)
                                }
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* 属性类型标签 */}
                    <div>
                      <Badge className="text-xs" variant="secondary">
                        {getAttributeTypeLabel(
                          form.watch(`attributes.${index}.type`)
                        )}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <DialogFooter>
              <Button
                disabled={createAttributeTemplate.isPending}
                onClick={() => onOpenChange(false)}
                type="button"
                variant="outline"
              >
                取消
              </Button>
              <Button
                disabled={createAttributeTemplate.isPending}
                type="submit"
              >
                {createAttributeTemplate.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    创建中...
                  </>
                ) : (
                  "创建模板"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
