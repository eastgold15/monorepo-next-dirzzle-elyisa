import { useCallback, useState } from "react";
import type { TemplateField } from "@/types";

// hooks/use-template-form.ts
export function useTemplateForm(initialData?: {
  name: string;
  masterCategoryId: string;
  siteCategoryId?: string;
  fields?: TemplateField[];
}) {
  // --- 表单状态 ---
  const [form, setForm] = useState({
    name: initialData?.name || "",
    masterCategoryId: initialData?.masterCategoryId || "",
    siteCategoryId: initialData?.siteCategoryId || "",
    fields: initialData?.fields || [],
  });

  // --- 字段操作逻辑 ---
  const addField = useCallback(() => {
    const id = Date.now().toString();
    setForm((prev) => ({
      ...prev,
      fields: [
        ...prev.fields,
        {
          id,
          key: "",
          code: `field_${id.slice(-4)}`,
          inputType: "text",
          isRequired: false,
          isSkuSpec: false,
          templateId: id,
          sortOrder: prev.fields.length,
          value: "", // 确保初始化 value
        },
      ],
    }));
  }, []);

  const updateField = (id: string, updates: Partial<TemplateField>) => {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
  };

  const moveField = (index: number, direction: "up" | "down") => {
    const newFields = [...form.fields];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFields.length) return;
    [newFields[index], newFields[targetIndex]] = [
      newFields[targetIndex],
      newFields[index],
    ];
    setForm((prev) => ({ ...prev, fields: newFields }));
  };

  // 初始化/重置表单
  const resetForm = useCallback((data?: any) => {
    setForm({
      name: data?.name || "",
      masterCategoryId: data?.masterCategoryId || "",
      siteCategoryId: data?.siteCategoryId || "",
      fields: data?.fields || [],
    });
  }, []);

  // 复杂的校验逻辑也可以放在这里
  const isValid = form.name && form.fields.length > 0;

  return {
    form,
    setForm,
    addField,
    updateField,
    isValid,
    resetForm,
    moveField,
  };
}
