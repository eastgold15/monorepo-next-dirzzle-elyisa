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
import { useMemo, useState } from "react";
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
  useListTemplates,
  useUpdateTemplate, // 确保你有这个 hook
} from "@/hooks/api/attributetemplate";
import { useMasterCategories } from "@/hooks/api/master-categories";
import { useSiteCategories } from "@/hooks/api/site-category";
import type { TemplateField } from "@/types";
import { useTemplateForm } from "./useTemplateForm";

// 辅助函数
const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_|_$/g, "");

export default function TemplateManager() {
  const [view, setView] = useState<"list" | "create" | "edit">("list");

  // 1. 定义状态
  const [editingId, setEditingId] = useState<string | null>(null);

  // API 层
  const {
    data: templatesData,
    isLoading,
    refetch,
  } = useListTemplates({ page: 1, limit: 100 });
  const { data: categories = [] } = useMasterCategories({
    page: 1,
    limit: 100,
  });
  const { data: siteCategories = [] } = useSiteCategories({
    page: 1,
    limit: 100,
  });

  const createMutation = useCreateTemplate();
  const updateMutation = useUpdateTemplate();
  const deleteMutation = useDeleteTemplates();

  const templates = useMemo(() => templatesData || [], [templatesData]);

  // 逻辑层
  const {
    form,
    setForm,
    addField,
    updateField,
    moveField,
    resetForm,
    isValid,
  } = useTemplateForm();

  // 2. 从全量列表中查找（不再使用 useTemplate 钩子）
  const editingTemplate = useMemo(() => {
    if (!(editingId && templates)) return null;
    // 从当前的 templates 数组中找到匹配的那一项
    return templates.find((t: any) => t.id === editingId);
  }, [editingId, templates]);

  const handleSave = async () => {
    if (!isValid)
      return alert(
        "Please fill in all required information and add at least one field."
      );
    try {
      if (view === "create") {
        await createMutation.mutateAsync(form);
      } else {
        await updateMutation.mutateAsync({ id: editingId!, data: form });
      }
      setView("list");
      refetch();
    } catch (error: any) {
      alert(error.message || "Action failed");
    }
  };

  // 渲染逻辑
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header
          onBack={() => {
            setView("list");
            setEditingId(null);
          }}
          view={view}
        />

        <main className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
                <p className="mt-4 text-slate-500">加载中...</p>
              </div>
            </div>
          ) : view === "list" ? (
            <TemplateListView
              onCreate={() => {
                resetForm();
                setView("create");
              }}
              onDelete={(id: string) =>
                deleteMutation.mutateAsync(id).then(() => refetch())
              }
              onEdit={(t: TemplateField) => {
                // 这里的 t 就是列表中的一行完整数据
                setEditingId(t.id);
                setView("edit");
                // 如果你想更直接一点，也可以在这里直接 resetForm(t)
                resetForm(t);
              }}
              templates={templates}
            />
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <BasicConfigCard form={form} setForm={setForm} />
                <FieldBuilderCard
                  fields={form.fields}
                  onAdd={addField}
                  onMove={moveField}
                  onRemove={(id) =>
                    setForm((p) => ({
                      ...p,
                      fields: p.fields.filter((f) => f.id !== id),
                    }))
                  }
                  onUpdate={updateField}
                />
              </div>
              <div className="lg:col-span-1">
                <DraftSummaryCard
                  categories={categories}
                  disabled={!isValid}
                  form={form}
                  onSave={handleSave}
                  siteCategories={siteCategories}
                  view={view}
                />
              </div>
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

// --- 子组件: BasicConfigCard ---
function BasicConfigCard({ form, setForm }: any) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 border-b pb-2 font-semibold text-lg text-slate-800">
        Basic Configuration
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="font-medium text-slate-700 text-sm">
            Template Name
          </label>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm outline-indigo-500"
            onChange={(e) =>
              setForm((p: any) => ({ ...p, name: e.target.value }))
            }
            placeholder="e.g. Electronics Standard Template"
            value={form.name}
          />
        </div>
        <div>
          <label className="font-medium text-slate-700 text-sm">
            Master Category
          </label>
          <MasterCategorySelect
            onChange={(val) =>
              setForm((p: any) => ({ ...p, masterCategoryId: val }))
            }
            value={form.masterCategoryId}
          />
        </div>
        <div>
          <label className="font-medium text-slate-700 text-sm">
            Site Category (Optional)
          </label>
          <SiteCategoryTreeSelect
            onChange={(val) =>
              setForm((p: any) => ({ ...p, siteCategoryId: val }))
            }
            value={form.siteCategoryId}
          />
        </div>
      </div>
    </section>
  );
}

// --- 子组件: FieldBuilderCard ---
function FieldBuilderCard({
  fields,
  onAdd,
  onUpdate,
  onMove,
  onRemove,
}: {
  fields: TemplateField[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<TemplateField>) => void;
  onMove: (index: number, direction: "up" | "down") => void;
  onRemove: (id: string) => void;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-lg text-slate-800">
          Field Definitions
        </h3>
        <button
          className="flex items-center gap-1 font-bold text-indigo-600 text-sm hover:text-indigo-700"
          onClick={onAdd}
        >
          <Plus size={16} /> Add Field
        </button>
      </div>
      <div className="space-y-4">
        {fields.map((field: any, idx: number) => (
          <FieldItem
            field={field}
            index={idx}
            isFirst={idx === 0}
            isLast={idx === fields.length - 1}
            key={field.id}
            onMove={onMove}
            onRemove={() => onRemove(field.id)}
            onUpdate={onUpdate}
          />
        ))}
        {fields.length === 0 && (
          <div className="rounded-xl border-2 border-slate-100 border-dashed py-10 text-center text-slate-400 text-sm">
            No fields added yet. Click "Add Field" to start.
          </div>
        )}
      </div>
    </section>
  );
}

// --- 子组件: DraftSummaryCard ---
function DraftSummaryCard({
  form,
  categories,
  siteCategories,
  onSave,
  view,
  disabled,
}: any) {
  const summary = useMemo(() => {
    const master =
      categories.find((c: any) => c.id === form.masterCategoryId)?.name || "-";
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
  }, [categories, siteCategories, form.masterCategoryId, form.siteCategoryId]);

  return (
    <div className="sticky top-6 rounded-xl border border-indigo-100 bg-indigo-50/30 p-6">
      <h3 className="mb-4 font-bold text-slate-900 italic">Draft Summary</h3>
      <div className="space-y-3">
        <SummaryItem label="Template Name" value={form.name || "Untitled"} />
        <SummaryItem label="Master Category" value={summary.master} />
        <SummaryItem
          label="Total Fields"
          value={form.fields.length.toString()}
        />
        <SummaryItem
          color="text-indigo-600"
          label="SKU Specs"
          value={form.fields.filter((f: any) => f.isSkuSpec).length.toString()}
        />
      </div>
      <button
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 font-bold text-white shadow-indigo-200 shadow-lg transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        disabled={disabled}
        onClick={onSave}
      >
        <Save size={18} />
        {view === "create" ? "Create Template" : "Update Changes"}
      </button>
    </div>
  );
}

// --- 基础组件: Header, FieldItem, SummaryItem, TemplateListView ---
function Header({ view, onBack }: { view: string; onBack: () => void }) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Separator className="mx-2 h-4" orientation="vertical" />
        <h1 className="font-bold text-lg text-slate-800">
          {view === "list"
            ? "Product Templates"
            : view === "create"
              ? "New Template"
              : "Edit Template"}
        </h1>
      </div>
      {view !== "list" && (
        <button
          className="flex items-center gap-2 font-medium text-slate-500 text-sm hover:text-indigo-600"
          onClick={onBack}
        >
          <List size={16} /> Back to List
        </button>
      )}
    </header>
  );
}

function FieldItem({
  field,
  index,
  onUpdate,
  onRemove,
  onMove,
  isFirst,
  isLast,
}: {
  field: TemplateField;
  index: number;
  onUpdate: (id: string, updates: Partial<TemplateField>) => void;
  onRemove: (id: string) => void;
  onMove: (index: number, direction: "up" | "down") => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 transition-all hover:border-indigo-200 hover:bg-white">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-black text-[10px] text-slate-400 uppercase tracking-widest">
          Field #{index + 1}
        </span>
        <div className="flex items-center gap-1">
          <button
            className="p-1 hover:text-indigo-600 disabled:opacity-20"
            disabled={isFirst}
            onClick={() => onMove(index, "up")}
          >
            <ArrowUp size={14} />
          </button>
          <button
            className="p-1 hover:text-indigo-600 disabled:opacity-20"
            disabled={isLast}
            onClick={() => onMove(index, "down")}
          >
            <ArrowDown size={14} />
          </button>
          <button
            className="ml-2 p-1 text-slate-400 hover:text-red-500"
            onClick={() => onRemove(field.id)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-4">
          <label className="font-bold text-[10px] text-slate-500 uppercase">
            Display Name
          </label>
          <input
            className="mt-1 w-full rounded border border-slate-300 bg-white p-1.5 text-sm outline-indigo-500"
            onChange={(e) =>
              onUpdate(field.id, {
                key: e.target.value,
                code: slugify(e.target.value),
              })
            }
            value={field.key}
          />
        </div>
        <div className="col-span-4">
          <label className="font-bold text-[10px] text-slate-500 uppercase">
            API Code
          </label>
          <div className="mt-1 flex h-[34px] items-center rounded border border-slate-200 bg-slate-100 px-2 font-mono text-[11px] text-slate-500">
            {field.code}
          </div>
        </div>
        <div className="col-span-4">
          <label className="font-bold text-[10px] text-slate-500 uppercase">
            Type
          </label>
          <select
            className="mt-1 w-full rounded border border-slate-300 bg-white p-1.5 text-sm"
            onChange={(e) =>
              onUpdate(field.id, { inputType: e.target.value as any })
            }
            value={field.inputType!}
          >
            <option value="text">Text Input</option>
            <option value="number">Number</option>
            <option value="select">Dropdown</option>
            <option value="multiselect">Multi-Select</option>
          </select>
        </div>

        <div className="col-span-12">
          {field.inputType === "text" || field.inputType === "number" ? (
            <div>
              <label className="font-bold text-[10px] text-slate-500 uppercase">
                Placeholder Content
              </label>
              <input
                className="mt-1 w-full rounded border border-slate-300 bg-white p-1.5 text-sm"
                onChange={(e) => onUpdate(field.id, { value: e.target.value })}
                placeholder="e.g. Enter product dimensions"
                value={field.value || ""}
              />
            </div>
          ) : (
            <div>
              <label className="font-bold text-[10px] text-slate-500 uppercase">
                Options (Comma separated)
              </label>
              <textarea
                className="mt-1 w-full rounded border border-slate-300 bg-white p-2 text-sm"
                onChange={(e) =>
                  onUpdate(field.id, {
                    options: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="Small, Medium, Large"
                rows={2}
                value={field.options?.join(", ")}
              />
            </div>
          )}
        </div>

        <div className="col-span-12 flex items-center gap-6 border-slate-100 border-t pt-2">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              checked={field.isRequired!}
              onChange={(e) =>
                onUpdate(field.id, { isRequired: e.target.checked! })
              }
              type="checkbox"
            />
            <span className="text-slate-600 text-xs">Required</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              checked={field.isSkuSpec!}
              onChange={(e) =>
                onUpdate(field.id, { isSkuSpec: e.target.checked! })
              }
              type="checkbox"
            />
            <span className="font-medium text-indigo-600 text-xs">
              Use as SKU Spec
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  color = "text-slate-900",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex justify-between border-indigo-100/50 border-b pb-2">
      <span className="text-slate-500 text-xs">{label}:</span>
      <span className={`font-semibold text-xs ${color} max-w-[150px] truncate`}>
        {value}
      </span>
    </div>
  );
}

function TemplateListView({ templates, onEdit, onDelete, onCreate }: any) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-bold text-sm text-white shadow-md transition-all hover:bg-indigo-700 active:scale-95"
          onClick={onCreate}
        >
          <Plus size={16} /> Create New Template
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 font-bold text-[11px] text-slate-500 uppercase">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Structure</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {templates.map((t: any) => (
              <tr className="transition-colors hover:bg-slate-50/50" key={t.id}>
                <td className="px-6 py-4 font-semibold text-slate-900">
                  {t.name}
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {t.categoryName || "Unassigned"}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-[11px] text-indigo-600">
                    {t.fields?.length || 0} Fields
                  </span>
                </td>
                <td className="space-x-1 px-6 py-4 text-right">
                  <button
                    className="rounded-md p-2 text-indigo-600 transition-colors hover:bg-indigo-50"
                    onClick={() => onEdit(t)}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="rounded-md p-2 text-red-500 transition-colors hover:bg-red-50"
                    onClick={() =>
                      confirm("Delete this template?") && onDelete(t.id)
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
