"use client";

import {
  ArrowDown,
  ArrowUp,
  Edit2,
  List,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { MasterCategorySelect } from "@/components/ui/master-category-select";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SiteCategoryTreeSelect } from "@/components/ui/site-category-tree-select";
import {
  useCreateTemplate,
  useDeleteTemplates,
  useTemplate,
  useTemplates,
} from "@/hooks/api/attributetemplate";
import { useMasterCategories } from "@/hooks/api/mastercategory";
import { useSiteCategories } from "@/hooks/api/site-category";
import type { TemplateField } from "@/types";

// --- 辅助函数：自动生成合规的 API Code ---
const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_|_$/g, "");

export default function TemplateManager() {
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- API 数据层 ---
  const {
    data: templatesData,
    isLoading,
    refetch,
  } = useTemplates({ page: 1, limit: 100 });
  const templates = useMemo(() => templatesData || [], [templatesData]);

  const { data: categories = [] } = useMasterCategories({
    page: 1,
    limit: 100,
  });
  const { data: siteCategories = [] } = useSiteCategories({
    page: 1,
    limit: 100,
  });

  const createMutation = useCreateTemplate();
  const deleteMutation = useDeleteTemplates();
  const { data: editingTemplate } = useTemplate(editingId || "");

  // --- 表单状态 ---
  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryId: "",
    siteCategoryId: "",
    fields: [] as TemplateField[],
  });

  // 初始化/重置表单
  const resetForm = useCallback((data?: any) => {
    setForm({
      name: data?.name || "",
      description: data?.description || "",
      categoryId: data?.categoryId || "",
      siteCategoryId: data?.siteCategoryId || "",
      fields: data?.fields || [],
    });
  }, []);

  // 监听编辑对象变化
  React.useEffect(() => {
    if (view === "edit" && editingTemplate) {
      resetForm(editingTemplate);
    }
  }, [view, editingTemplate, resetForm]);

  // --- 字段操作逻辑 ---
  const addField = () => {
    const id = Date.now().toString();
    setForm((prev) => ({
      ...prev,
      fields: [
        ...prev.fields,
        {
          id,
          name: "New Field",
          code: `new_field_${id.slice(-4)}`,
          type: "text",
          isSkuSpec: false,
          required: true,
          options: [],
        },
      ],
    }));
  };

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

  // --- 计算属性 (useMemo) ---
  const summaryNames = useMemo(() => {
    const master =
      categories.find((c) => c.id === form.categoryId)?.name || "-";

    const findInTree = (nodes: any[], id: string): string | null => {
      for (const n of nodes) {
        if (n.id === id) return n.name;
        if (n.children) {
          const res = findInTree(n.children, id);
          if (res) return res;
        }
      }
      return null;
    };
    const site = findInTree(siteCategories, form.siteCategoryId) || "-";

    return { master, site };
  }, [categories, siteCategories, form.categoryId, form.siteCategoryId]);

  // --- 提交逻辑 ---
  const handleSave = async () => {
    if (!(form.name && form.categoryId)) return alert("请填写必要信息");

    try {
      if (view === "create") {
        await createMutation.mutateAsync(form);
      } else {
        await updateMutation.mutateAsync({ id: editingId!, data: form });
      }
      setView("list");
      refetch();
    } catch (error: any) {
      alert(error.message || "操作失败");
    }
  };

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header
          onBack={() => {
            setView("list");
            setEditingId(null);
          }}
          setView={setView}
          view={view}
        />

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {view === "list" ? (
            <TemplateListView
              onDelete={(id) =>
                deleteMutation.mutateAsync([id]).then(() => refetch())
              }
              onEdit={(t) => {
                setEditingId(t.id);
                setView("edit");
              }}
              templates={templates}
            />
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* 左侧：表单详情 */}
              <div className="space-y-6 lg:col-span-2">
                {/* 基础信息卡片 */}
                <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 border-b pb-2 font-semibold text-lg">
                    Basic Configuration
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="font-medium text-slate-700 text-sm">
                        Template Name
                      </label>
                      <input
                        className="mt-1 w-full rounded-md border border-slate-300 p-2 outline-indigo-500"
                        onChange={(e) =>
                          setForm((p) => ({ ...p, name: e.target.value }))
                        }
                        value={form.name}
                      />
                    </div>
                    <div>
                      <label className="font-medium text-slate-700 text-sm">
                        Master Category
                      </label>
                      <MasterCategorySelect
                        onChange={(val) =>
                          setForm((p) => ({ ...p, categoryId: val }))
                        }
                        value={form.categoryId}
                      />
                    </div>
                    <div>
                      <label className="font-medium text-slate-700 text-sm">
                        Site Category
                      </label>
                      <SiteCategoryTreeSelect
                        onChange={(val) =>
                          setForm((p) => ({ ...p, siteCategoryId: val }))
                        }
                        value={form.siteCategoryId}
                      />
                    </div>
                  </div>
                </section>

                {/* 字段构建器卡片 */}
                <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Field Definitions</h3>
                    <button
                      className="flex items-center gap-1 font-medium text-indigo-600 text-sm hover:underline"
                      onClick={addField}
                    >
                      <Plus size={16} /> Add Field
                    </button>
                  </div>

                  <div className="space-y-4">
                    {form.fields.map((field, idx) => (
                      <FieldItem
                        field={field}
                        index={idx}
                        isFirst={idx === 0}
                        isLast={idx === form.fields.length - 1}
                        key={field.id}
                        onMove={(dir) => moveField(idx, dir)}
                        onRemove={() =>
                          setForm((p) => ({
                            ...p,
                            fields: p.fields.filter((f) => f.id !== field.id),
                          }))
                        }
                        onUpdate={(upd) => updateField(field.id, upd)}
                      />
                    ))}
                  </div>
                </section>
              </div>

              {/* 右侧：固定汇总栏 */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 rounded-xl border border-indigo-100 bg-indigo-50/30 p-6">
                  <h3 className="mb-4 font-bold text-slate-900">
                    Draft Summary
                  </h3>
                  <dl className="space-y-3 text-sm">
                    <SummaryItem label="Master" value={summaryNames.master} />
                    <SummaryItem label="Site" value={summaryNames.site} />
                    <SummaryItem
                      label="Fields"
                      value={form.fields.length.toString()}
                    />
                    <SummaryItem
                      color="text-indigo-600"
                      label="SKUs"
                      value={form.fields
                        .filter((f) => f.isSkuSpec)
                        .length.toString()}
                    />
                  </dl>
                  <button
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 font-bold text-white transition-all hover:bg-indigo-700 disabled:bg-slate-300"
                    disabled={!form.name || form.fields.length === 0}
                    onClick={handleSave}
                  >
                    <Save size={18} />{" "}
                    {view === "create" ? "Create Template" : "Update Changes"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// --- 子组件：头部 ---
interface HeaderProps {
  view: "list" | "create" | "edit";
  setView: (view: "list" | "create" | "edit") => void;
  onBack: () => void;
}

function Header({ view, onBack }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Separator className="mx-2 h-4" orientation="vertical" />
        <h1 className="font-bold text-lg">
          {view === "list"
            ? "Product Templates"
            : view === "create"
              ? "New Template"
              : "Edit Template"}
        </h1>
      </div>
      {view !== "list" && (
        <button
          className="flex items-center gap-2 text-slate-500 text-sm hover:text-slate-800"
          onClick={onBack}
        >
          <List size={16} /> Back to List
        </button>
      )}
    </header>
  );
}

// --- 子组件：字段项 (优化后的交互) ---
interface FieldItemProps {
  field: TemplateField;
  index: number;
  onUpdate: (updates: Partial<TemplateField>) => void;
  onRemove: () => void;
  onMove: (direction: "up" | "down") => void;
  isFirst: boolean;
  isLast: boolean;
}

function FieldItem({
  field,
  index,
  onUpdate,
  onRemove,
  onMove,
  isFirst,
  isLast,
}: FieldItemProps) {
  return (
    <div className="group relative rounded-lg border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-indigo-300">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-bold text-slate-400 text-xs uppercase tracking-wider">
          Field #{index + 1}
        </span>
        <div className="flex items-center gap-2">
          <button
            className="p-1 disabled:opacity-30"
            disabled={isFirst}
            onClick={() => !isFirst && onMove("up")}
          >
            <ArrowUp size={14} />
          </button>
          <button
            className="p-1 disabled:opacity-30"
            disabled={isLast}
            onClick={() => !isLast && onMove("down")}
          >
            <ArrowDown size={14} />
          </button>
          <button
            className="ml-2 text-slate-400 hover:text-red-500"
            onClick={onRemove}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-4">
          <label className="font-bold text-[10px] text-slate-500 uppercase">
            Display Name
          </label>
          <input
            className="mt-1 w-full rounded border border-slate-300 bg-white p-1.5 text-sm"
            onChange={(e) =>
              onUpdate({ name: e.target.value, code: slugify(e.target.value) })
            }
            value={field.name}
          />
        </div>
        <div className="col-span-4">
          <label className="font-bold text-[10px] text-slate-500 uppercase">
            API Code (Auto)
          </label>
          <div className="mt-1 flex items-center gap-2 rounded border border-slate-200 bg-slate-100 px-2 py-1.5 font-mono text-slate-500 text-xs">
            {field.code}
          </div>
        </div>
        <div className="col-span-4">
          <label className="font-bold text-[10px] text-slate-500 uppercase">
            Type
          </label>
          <select
            className="mt-1 w-full rounded border border-slate-300 bg-white p-1.5 text-sm"
            onChange={(e) => onUpdate({ type: e.target.value as FieldType })}
            value={field.type}
          >
            <option value="text">Text Input</option>
            <option value="number">Number</option>
            <option value="select">Dropdown</option>
            <option value="multiselect">Multi-Select</option>
          </select>
        </div>

        {(field.type === "select" || field.type === "multiselect") && (
          <div className="col-span-12">
            <label className="font-bold text-[10px] text-slate-500 uppercase">
              Options (Split by comma)
            </label>
            <textarea
              className="mt-1 w-full rounded border border-slate-300 bg-white p-2 text-sm"
              onChange={(e) =>
                onUpdate({
                  options: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder="Red, Blue, Green..."
              rows={2}
              value={field.options?.join(", ")}
            />
          </div>
        )}

        <div className="col-span-12 flex items-center gap-6 border-slate-200 border-t pt-2">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              checked={field.required}
              onChange={(e) => onUpdate({ required: e.target.checked })}
              type="checkbox"
            />
            <span className="text-slate-600 text-xs">Required Field</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              checked={field.isSkuSpec}
              onChange={(e) => onUpdate({ isSkuSpec: e.target.checked })}
              type="checkbox"
            />
            <span className="font-medium text-indigo-600 text-xs">
              Use as SKU Specification
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

// --- 纯 UI 辅助组件 ---
interface SummaryItemProps {
  label: string;
  value: string;
  color?: string;
}

function SummaryItem({
  label,
  value,
  color = "text-slate-900",
}: SummaryItemProps) {
  return (
    <div className="flex justify-between border-indigo-100/50 border-b pb-2">
      <span className="text-slate-500">{label}:</span>
      <span className={`font-semibold ${color} max-w-37.5 truncate`}>
        {value}
      </span>
    </div>
  );
}

interface TemplateListViewProps {
  templates: any[];
  onEdit: (t: any) => void;
  onDelete: (id: string) => void;
}

function TemplateListView({
  templates,
  onEdit,
  onDelete,
}: TemplateListViewProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 font-semibold text-[11px] text-slate-500 uppercase">
          <tr>
            <th className="px-6 py-4">Name</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4">Structure</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {templates.map((t: any) => (
            <tr className="transition-colors hover:bg-slate-50" key={t.id}>
              <td className="px-6 py-4 font-medium text-slate-900">{t.name}</td>
              <td className="px-6 py-4 text-slate-500">{t.categoryName}</td>
              <td className="px-6 py-4">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs">
                  {t.fields?.length || 0} Fields
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  className="rounded-md p-2 text-indigo-600 transition-colors hover:bg-indigo-50"
                  onClick={() => onEdit(t)}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  className="rounded-md p-2 text-red-500 transition-colors hover:bg-red-50"
                  onClick={() => confirm("Delete?") && onDelete(t.id)}
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
