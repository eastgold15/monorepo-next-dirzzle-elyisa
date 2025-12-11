"use client";

import { Edit, MapPin, Plus, Trash2, User } from "lucide-react";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { INITIAL_FACTORIES } from "@/mockData";
import type { Factory } from "@/types";

export default function FactoryManager() {
  const [factories, setFactories] = useState<Factory[]>(INITIAL_FACTORIES);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [newName, setNewName] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newContact, setNewContact] = useState("");

  const handleAdd = () => {
    if (!newName) return;
    const newFactory: Factory = {
      id: `fac_${Date.now()}`,
      name: newName,
      location: newLocation,
      contactPerson: newContact,
    };
    setFactories([...factories, newFactory]);
    setIsAdding(false);
    setNewName("");
    setNewLocation("");
    setNewContact("");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-2xl text-slate-900">Factories</h1>
            <p className="mt-1 text-slate-500">
              Manage manufacturing partners.
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
            <span>{isAdding ? "Cancel" : "Add Factory"}</span>
          </button>
        </div>

        {isAdding && (
          <div className="slide-in-from-top-4 fade-in animate-in rounded-xl border border-slate-200 bg-white p-6 shadow-sm duration-200">
            <h3 className="mb-4 font-semibold text-lg">New Factory</h3>
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block font-medium text-slate-700 text-sm">
                  Factory Name
                </label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. BestStep Mfg"
                  type="text"
                  value={newName}
                />
              </div>
              <div>
                <label className="mb-1 block font-medium text-slate-700 text-sm">
                  Location
                </label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="City, Country"
                  type="text"
                  value={newLocation}
                />
              </div>
              <div>
                <label className="mb-1 block font-medium text-slate-700 text-sm">
                  Contact Person
                </label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => setNewContact(e.target.value)}
                  placeholder="Name"
                  type="text"
                  value={newContact}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                className="rounded-lg bg-indigo-600 px-6 py-2 font-medium text-white hover:bg-indigo-700"
                onClick={handleAdd}
              >
                Save Factory
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {factories.map((f) => (
            <div
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              key={f.id}
            >
              <div className="mb-4 flex items-start justify-between">
                <h3 className="font-bold text-lg text-slate-900">{f.name}</h3>
                <div className="flex gap-1">
                  <button className="rounded p-1.5 text-slate-400 hover:bg-slate-50 hover:text-indigo-600">
                    <Edit size={16} />
                  </button>
                  <button className="rounded p-1.5 text-slate-400 hover:bg-slate-50 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="space-y-3 text-slate-600 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="text-slate-400" size={16} />
                  <span>{f.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="text-slate-400" size={16} />
                  <span>{f.contactPerson}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
