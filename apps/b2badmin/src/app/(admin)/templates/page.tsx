"use client";

import { List, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { INITIAL_TEMPLATES } from "@/mockData";
import type { FieldType, ProductTemplate, TemplateField } from "../../../types";

export default function TemplateManager() {
  const [view, setView] = useState<"list" | "create">("list");
  const [templates, setTemplates] =
    useState<ProductTemplate[]>(INITIAL_TEMPLATES);

  // Builder State
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateDesc, setNewTemplateDesc] = useState("");
  const [newFields, setNewFields] = useState<TemplateField[]>([]);

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

  const saveTemplate = () => {
    if (!newTemplateName) return alert("Please enter a template name");
    const template: ProductTemplate = {
      id: Date.now().toString(),
      name: newTemplateName,
      description: newTemplateDesc,
      fields: newFields,
      createdAt: new Date().toISOString(),
    };
    setTemplates([...templates, template]);
    setView("list");
    setNewTemplateName("");
    setNewTemplateDesc("");
    setNewFields([]);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-2xl text-slate-900">
              {view === "list" ? "Product Templates" : "Create New Template"}
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
          {view === "create" && (
            <button
              className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
              onClick={() => setView("list")}
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
                  <th className="px-6 py-4">Fields</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {templates.map((t) => (
                  <tr className="hover:bg-slate-50" key={t.id}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{t.name}</div>
                      <div className="text-slate-500 text-sm">
                        {t.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {t.fields.length} fields (
                      {t.fields.filter((f) => f.isSkuSpec).length} specs)
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="mr-3 font-medium text-indigo-600 text-sm hover:text-indigo-800">
                        Edit
                      </button>
                      <button className="font-medium text-red-500 text-sm hover:text-red-700">
                        Delete
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
                      Description
                    </label>
                    <input
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                      onChange={(e) => setNewTemplateDesc(e.target.value)}
                      placeholder="Brief description"
                      type="text"
                      value={newTemplateDesc}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-semibold text-lg">Field Definitions</h3>
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
                              <option value="select">Dropdown (Select)</option>
                              <option value="multiselect">Multi-Select</option>
                              <option value="richtext">Rich Text</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2 pt-6">
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
                          {field.isSkuSpec && (
                            <div className="mt-2 rounded border border-amber-100 bg-amber-50 p-2 text-amber-600 text-xs">
                              This field will be used to generate SKU variants.
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
                  disabled={newFields.length === 0 || !newTemplateName}
                  onClick={saveTemplate}
                >
                  <Save size={18} /> Save Template
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
