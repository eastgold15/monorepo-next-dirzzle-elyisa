"use client";

import { Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { INITIAL_CATEGORIES } from "../../../mockData";
import type { Category } from "../../../types";

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const handleAdd = () => {
    if (!newName) return;
    const newCategory: Category = {
      id: `c_${Date.now()}`,
      name: newName,
      slug: newName.toLowerCase().replace(/\s+/g, "-"),
      description: newDesc,
    };
    setCategories([...categories, newCategory]);
    setIsAdding(false);
    setNewName("");
    setNewDesc("");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-2xl text-slate-900">Categories</h1>
            <p className="mt-1 text-slate-500">
              Organize products into classifications.
            </p>
          </div>
          <button
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-white shadow-sm transition-colors ${isAdding ? "bg-slate-500 hover:bg-slate-600" : "bg-indigo-600 hover:bg-indigo-700"}`}
            onClick={() => setIsAdding(!isAdding)}
          >
            <Plus
              className={
                isAdding
                  ? "rotate-45 transition-transform"
                  : "transition-transform"
              }
              size={18}
            />
            <span>{isAdding ? "Cancel" : "Add Category"}</span>
          </button>
        </div>

        {isAdding && (
          <div className="slide-in-from-top-4 fade-in animate-in rounded-xl border border-slate-200 bg-white p-6 shadow-sm duration-200">
            <h3 className="mb-4 font-semibold text-lg">New Category</h3>
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block font-medium text-slate-700 text-sm">
                  Name
                </label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Hiking Boots"
                  type="text"
                  value={newName}
                />
              </div>
              <div>
                <label className="mb-1 block font-medium text-slate-700 text-sm">
                  Description
                </label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Optional description"
                  type="text"
                  value={newDesc}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                className="rounded-lg bg-indigo-600 px-6 py-2 font-medium text-white hover:bg-indigo-700"
                onClick={handleAdd}
              >
                Save Category
              </button>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left">
            <thead className="border-slate-200 border-b bg-slate-50 font-semibold text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((c) => (
                <tr className="hover:bg-slate-50" key={c.id}>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {c.name}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-500 text-sm">
                    {c.slug}
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">
                    {c.description || "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="mr-3 text-slate-400 transition-colors hover:text-indigo-600">
                      <Edit size={18} />
                    </button>
                    <button className="text-slate-400 transition-colors hover:text-red-600">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
