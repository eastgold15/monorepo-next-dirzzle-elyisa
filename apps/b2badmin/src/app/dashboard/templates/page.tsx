"use client";

import { Edit2, List, Plus, Save, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { MasterCategorySelect } from "@/components/ui/master-category-select";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useMasterCategories } from "@/hooks/api/master-category";
import {
  useCreateTemplate,
  useDeleteTemplates,
  useTemplate,
  useTemplates,
  useUpdateTemplate,
} from "@/hooks/api/template-api";
import type { FieldType, TemplateField } from "@/types";

export default function TemplateManager() {
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);

  // 获取模板列表
  const { data: templatesData, isLoading, refetch } = useTemplates();

  const templates = templatesData?.data?.items || [];

  // 获取主分类列表
  const { data: categories = [] } = useMasterCategories();

  // 创建模板
  const createTemplateMutation = useCreateTemplate();
  const updateTemplateMutation = useUpdateTemplate();
  const deleteTemplateMutation = useDeleteTemplates();

  // 获取编辑的模板
  const { data: editingTemplate } = useTemplate(editingId || "");

  // Builder State
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateDesc, setNewTemplateDesc] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [newFields, setNewFields] = useState<TemplateField[]>([]);

  // 初始化编辑数据
  React.useEffect(() => {
    if (view === "edit" && editingTemplate) {
      setNewTemplateName(editingTemplate?.data?.name || "");
      setNewTemplateDesc(editingTemplate?.data?.description || "");
      setSelectedCategoryId(editingTemplate?.data?.categoryId || "");
      setNewFields(editingTemplate?.data?.fields || []);
    }
  }, [view, editingTemplate]);

  const addField = () => {
    const id = Date.now().toString();
    setNewFields([
      ...newFields,
      {
        id,
        name: "New Field",
        code: `field_${id}`,
        type: "text",
        isSkuSpec: false,
        required: true,
        options: [],
      },
    ]);
  };

  const updateField = (id: string, updates: Partial<TemplateField>) => {
    setNewFields(
      newFields.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const removeField = (id: string) => {
    setNewFields(newFields.filter((f) => f.id !== id));
  };

  const saveTemplate = async () => {
    if (!newTemplateName) return alert("请输入模板名称");
    if (!selectedCategoryId) return alert("请选择分类");

    try {
      if (view === "create") {
        await createTemplateMutation.mutateAsync({
          name: newTemplateName,
          description: newTemplateDesc,
          categoryId: selectedCategoryId,
          fields: newFields,
        });
      } else if (view === "edit" && editingId) {
        await updateTemplateMutation.mutateAsync({
          id: editingId,
          data: {
            name: newTemplateName,
            description: newTemplateDesc,
            categoryId: selectedCategoryId,
            fields: newFields,
          },
        });
      }

      // 重置状态
      setView("list");
      setEditingId(null);
      setNewTemplateName("");
      setNewTemplateDesc("");
      setSelectedCategoryId("");
      setNewFields([]);
      refetch();
    } catch (error: any) {
      alert(error.message || "保存失败");
    }
  };

  const handleEdit = (template: any) => {
    setEditingId(template.id);
    setNewTemplateName(template.name);
    setNewTemplateDesc(template.description || "");
    setSelectedCategoryId(template.categoryId);
    setNewFields(template.fields);
    setView("edit");
  };

  const handleDelete = async (ids: string[]) => {
    if (!confirm("确定要删除选中的模板吗？")) return;

    try {
      await deleteTemplateMutation.mutateAsync(ids);
      refetch();
    } catch (error: any) {
      alert(error.message || "删除失败");
    }
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex h-96 items-center justify-center">
            <div className="text-lg">加载中...</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator className="mr-2 h-4" orientation="vertical" />
            <nav className="font-medium text-sm">
              {view === "list"
                ? "Product Templates"
                : view === "create"
                  ? "Create New Template"
                  : "Edit Template"}
            </nav>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-bold text-2xl text-slate-900">
                  {view === "list"
                    ? "Product Templates"
                    : view === "create"
                      ? "Create New Template"
                      : "Edit Template"}
                </h1>
                <p className="mt-1 text-slate-500">
                  Define data structures for different product categories.
                </p>
              </div>
              {view === "list" && (
                <button
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-indigo-700"
                  onClick={() => setView("create")}
                >
                  <Plus size={18} />
                  <span>New Template</span>
                </button>
              )}
              {(view === "create" || view === "edit") && (
                <button
                  className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
                  onClick={() => {
                    setView("list");
                    setEditingId(null);
                  }}
                >
                  <List size={18} />
                  <span>Back to List</span>
                </button>
              )}
            </div>

            {view === "list" ? (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left">
                  <thead className="border-slate-200 border-b bg-slate-50 font-semibold text-slate-500 text-xs uppercase">
                    <tr>
                      <th className="px-6 py-4">Template Name</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Fields</th>
                      <th className="px-6 py-4">Created</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {templates.map((t: any) => (
                      <tr className="hover:bg-slate-50" key={t.id}>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">
                            {t.name}
                          </div>
                          <div className="text-slate-500 text-sm">
                            {t.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-sm">
                          {t.categoryName}
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-sm">
                          {t.fields.length} fields (
                          {t.fields.filter((f: any) => f.isSkuSpec).length}{" "}
                          specs)
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-sm">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            className="mr-3 font-medium text-indigo-600 text-sm hover:text-indigo-800"
                            onClick={() => handleEdit(t)}
                          >
                            <Edit2 className="inline" size={16} /> Edit
                          </button>
                          <button
                            className="font-medium text-red-500 text-sm hover:text-red-700"
                            onClick={() => handleDelete([t.id])}
                          >
                            <Trash2 className="inline" size={16} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                  <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="border-b pb-2 font-semibold text-lg">
                      Basic Info
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block font-medium text-slate-700 text-sm">
                          Template Name
                        </label>
                        <input
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                          onChange={(e) => setNewTemplateName(e.target.value)}
                          placeholder="e.g., Men's Running Shoes"
                          type="text"
                          value={newTemplateName}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block font-medium text-slate-700 text-sm">
                          {" "}
                          主分类{" "}
                        </label>{" "}
                        <MasterCategorySelect
                          onChange={setSelectedCategoryId}
                          placeholder="选择主分类"
                          value={selectedCategoryId}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h3 className="font-semibold text-lg">
                        Field Definitions
                      </h3>
                      <button
                        className="flex items-center gap-1 rounded-lg px-3 py-1.5 font-medium text-indigo-600 text-sm transition-colors hover:bg-indigo-50"
                        onClick={addField}
                      >
                        <Plus size={16} /> Add Field
                      </button>
                    </div>

                    {newFields.length === 0 && (
                      <div className="rounded-lg border-2 border-slate-200 border-dashed py-8 text-center text-slate-400">
                        No fields defined. Add a field to start.
                      </div>
                    )}

                    <div className="space-y-4">
                      {newFields.map((field, index) => (
                        <div
                          className="group relative rounded-lg border border-slate-200 bg-slate-50 p-4 transition-all hover:border-indigo-200 hover:shadow-md"
                          key={field.id}
                        >
                          <button
                            className="absolute top-2 right-2 rounded-md p-1.5 text-slate-400 opacity-0 transition-colors hover:bg-white hover:text-red-500 group-hover:opacity-100"
                            onClick={() => removeField(field.id)}
                          >
                            <Trash2 size={16} />
                          </button>

                          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-12">
                            <div className="flex items-center justify-center pt-3 font-mono text-slate-400 text-sm md:col-span-1">
                              #{index + 1}
                            </div>

                            <div className="space-y-3 md:col-span-4">
                              <div>
                                <label className="font-semibold text-slate-500 text-xs uppercase">
                                  Field Name
                                </label>
                                <input
                                  className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
                                  onChange={(e) =>
                                    updateField(field.id, {
                                      name: e.target.value,
                                      code: e.target.value
                                        .toLowerCase()
                                        .replace(/\s+/g, "_"),
                                    })
                                  }
                                  type="text"
                                  value={field.name}
                                />
                              </div>
                              <div>
                                <label className="font-semibold text-slate-500 text-xs uppercase">
                                  Field Code (API)
                                </label>
                                <input
                                  className="mt-1 w-full rounded border border-slate-200 bg-slate-100 px-3 py-2 font-mono text-slate-500 text-sm"
                                  readOnly
                                  type="text"
                                  value={field.code}
                                />
                              </div>
                            </div>

                            <div className="space-y-3 md:col-span-3">
                              <div>
                                <label className="font-semibold text-slate-500 text-xs uppercase">
                                  Input Type
                                </label>
                                <select
                                  className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
                                  onChange={(e) =>
                                    updateField(field.id, {
                                      type: e.target.value as FieldType,
                                    })
                                  }
                                  value={field.type}
                                >
                                  <option value="text">Text Input</option>
                                  <option value="number">Number</option>
                                  <option value="select">
                                    Dropdown (Select)
                                  </option>
                                  <option value="multiselect">
                                    Multi-Select
                                  </option>
                                </select>
                              </div>
                              <div className="space-y-2 pt-6">
                                <div className="flex items-center gap-2">
                                  <input
                                    checked={field.isSkuSpec}
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    id={`sku-${field.id}`}
                                    onChange={(e) =>
                                      updateField(field.id, {
                                        isSkuSpec: e.target.checked,
                                      })
                                    }
                                    type="checkbox"
                                  />
                                  <label
                                    className="font-medium text-slate-700 text-sm"
                                    htmlFor={`sku-${field.id}`}
                                  >
                                    Is SKU Spec?
                                  </label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    checked={field.required ?? true}
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    defaultChecked={true}
                                    id={`required-${field.id}`}
                                    onChange={(e) =>
                                      updateField(field.id, {
                                        required: e.target.checked,
                                      })
                                    }
                                    type="checkbox"
                                  />
                                  <label
                                    className="font-medium text-slate-700 text-sm"
                                    htmlFor={`required-${field.id}`}
                                  >
                                    Required
                                  </label>
                                </div>
                              </div>
                            </div>

                            <div className="md:col-span-4">
                              {(field.type === "select" ||
                                field.type === "multiselect") && (
                                <div>
                                  <label className="font-semibold text-slate-500 text-xs uppercase">
                                    Options (Comma separated)
                                  </label>
                                  <textarea
                                    className="mt-1 h-24 w-full resize-none rounded border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
                                    onChange={(e) =>
                                      updateField(field.id, {
                                        options: e.target.value
                                          .split(",")
                                          .map((s) => s.trim())
                                          .filter(Boolean),
                                      })
                                    }
                                    placeholder="e.g. Red, Blue, Green"
                                    value={field.options?.join(", ")}
                                  />
                                </div>
                              )}
                              {/* Text field preview */}{" "}
                              {field.type === "text" && (
                                <div>
                                  {" "}
                                  <label className="font-semibold text-slate-500 text-xs uppercase">
                                    {" "}
                                    Default Value{" "}
                                  </label>{" "}
                                  <input
                                    className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
                                    onChange={(e) =>
                                      updateField(field.id, {
                                        defaultValue: e.target.value,
                                      })
                                    }
                                    placeholder="Enter default text value"
                                    type="text"
                                    value={field.defaultValue || ""}
                                  />{" "}
                                </div>
                              )}{" "}
                              {/* Number field preview */}{" "}
                              {field.type === "number" && (
                                <div>
                                  {" "}
                                  <label className="font-semibold text-slate-500 text-xs uppercase">
                                    {" "}
                                    Default Value{" "}
                                  </label>{" "}
                                  <input
                                    className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
                                    onChange={(e) =>
                                      updateField(field.id, {
                                        defaultValue: e.target.value,
                                      })
                                    }
                                    placeholder="Enter default number value"
                                    type="number"
                                    value={field.defaultValue || ""}
                                  />{" "}
                                </div>
                              )}
                              {/* Multi-select without options warning */}
                              {field.type === "multiselect" &&
                                (!field.options ||
                                  field.options.length === 0) && (
                                  <div className="mt-2 rounded border border-amber-100 bg-amber-50 p-2 text-amber-600 text-xs">
                                    Please add options for multi-select field
                                  </div>
                                )}
                              {field.isSkuSpec && (
                                <div className="mt-2 rounded border border-amber-100 bg-amber-50 p-2 text-amber-600 text-xs">
                                  This field will be used to generate SKU
                                  variants.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="sticky top-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 font-semibold text-lg">Summary</h3>
                    <ul className="mb-6 space-y-3 text-slate-600 text-sm">
                      <li className="flex justify-between">
                        <span>Name:</span>{" "}
                        <span className="font-medium text-slate-900">
                          {newTemplateName || "-"}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span>Category:</span>{" "}
                        <span className="font-medium text-slate-900">
                          {" "}
                          {(() => {
                            if (!selectedCategoryId) return "-";
                            // 从分类数据中查找选中的分类名称
                            const categoryName =
                              categories.find(
                                (cat) => cat.id === selectedCategoryId
                              )?.name || "已选择主分类";
                            return categoryName;
                          })()}{" "}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span>Total Fields:</span>{" "}
                        <span className="font-medium text-slate-900">
                          {newFields.length}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span>SKU Specs:</span>{" "}
                        <span className="font-medium text-indigo-600">
                          {newFields.filter((f) => f.isSkuSpec).length}
                        </span>
                      </li>
                    </ul>
                    <button
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 font-bold text-white shadow-indigo-200 shadow-lg transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none"
                      disabled={
                        newFields.length === 0 ||
                        !newTemplateName ||
                        !selectedCategoryId
                      }
                      onClick={saveTemplate}
                    >
                      <Save size={18} /> Save Template
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
