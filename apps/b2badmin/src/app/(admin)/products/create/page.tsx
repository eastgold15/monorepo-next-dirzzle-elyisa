"use client";

import { ArrowLeft, ChevronRight, Package, Save, Upload } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminLayout } from "../../../../components/admin/AdminLayout";
import { MediaPicker } from "../../../../components/admin/MediaPicker";
import {
  INITIAL_CATEGORIES,
  INITIAL_FACTORIES,
  INITIAL_TEMPLATES,
} from "../../../../mockData";
import type { SkuVariant } from "../../../../types";

const steps = [
  "Select Template",
  "Product Details",
  "SKU Configuration",
  "Review",
];

export default function ProductCreator() {
  const [currentStep, setCurrentStep] = useState(0);

  // Form State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  // Basic Info State
  const [productName, setProductName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [factoryId, setFactoryId] = useState("");

  // Dynamic Template Data
  const [baseData, setBaseData] = useState<Record<string, any>>({});

  // SKU State
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string[]>>(
    {}
  );
  const [generatedSkus, setGeneratedSkus] = useState<SkuVariant[]>([]);

  // UI State
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [activeSkuIdForMedia, setActiveSkuIdForMedia] = useState<string | null>(
    null
  );

  const template = INITIAL_TEMPLATES.find((t) => t.id === selectedTemplateId);

  // --- Logic for Cartesian Product ---
  const generateSkus = () => {
    if (!template) return;

    // Get only fields that are SKU specs
    const specFields = template.fields.filter((f) => f.isSkuSpec);

    // Check if we have selections for all specs
    const specsToCombine = specFields
      .map((f) => ({
        code: f.code,
        values: selectedSpecs[f.code] || [],
      }))
      .filter((s) => s.values.length > 0);

    if (specsToCombine.length === 0) {
      setGeneratedSkus([]);
      return;
    }

    // Recursive function to generate cartesian product
    const cartesian = (argIndex: number): any[] => {
      const spec = specsToCombine[argIndex];
      if (argIndex === specsToCombine.length - 1) {
        return spec.values.map((val) => [{ [spec.code]: val }]);
      }

      const nextCombinations = cartesian(argIndex + 1);
      const results: any[] = [];

      spec.values.forEach((val) => {
        nextCombinations.forEach((combination) => {
          results.push([{ [spec.code]: val }, ...combination]);
        });
      });

      return results;
    };

    const rawCombinations = cartesian(0);

    // Format into SkuVariant objects
    const newSkus: SkuVariant[] = rawCombinations.map((combo, idx) => {
      // Flatten the array of objects into a single object: { color: 'Red', size: '40' }
      const specsObj = combo.reduce(
        (acc: any, curr: any) => ({ ...acc, ...curr }),
        {}
      );

      // Generate readable SKU code
      const skuCodeParts = Object.values(specsObj).map((v: any) =>
        String(v).toUpperCase().substring(0, 3)
      );
      const brandPrefix = baseData.brand
        ? baseData.brand.substring(0, 3).toUpperCase()
        : "GEN";
      const skuCode = `${brandPrefix}-${skuCodeParts.join("-")}-${idx + 1}`;

      return {
        id: `sku_${Date.now()}_${idx}`,
        skuCode,
        specs: specsObj,
        price: 0,
        stock: 0,
      };
    });

    setGeneratedSkus(newSkus);
  };

  // Run generation when moving to step 2 (SKU Config)
  useEffect(() => {
    if (currentStep === 2) {
      generateSkus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep === 0 && !selectedTemplateId)
      return alert("Select a template");
    if (currentStep === 1) {
      if (!productName) return alert("Product Name is required");
      if (!categoryId) return alert("Category is required");
      if (!factoryId) return alert("Factory is required");
      // Simple validation for required template fields could go here
    }
    setCurrentStep((prev) => prev + 1);
  };

  const updateSku = (id: string, field: keyof SkuVariant, value: any) => {
    setGeneratedSkus((prev) =>
      prev.map((sku) => (sku.id === id ? { ...sku, [field]: value } : sku))
    );
  };

  const handleMediaSelect = (url: string) => {
    if (activeSkuIdForMedia) {
      updateSku(activeSkuIdForMedia, "image", url);
      setActiveSkuIdForMedia(null);
    }
  };

  const handlePublish = () => {
    const productPayload = {
      name: productName,
      categoryId,
      factoryId,
      templateId: selectedTemplateId,
      baseData,
      skus: generatedSkus,
      status: "pending_review",
      createdAt: new Date().toISOString(),
    };

    console.log("Publishing Product:", productPayload);
    alert("Product Created Successfully! (Check console for payload)");
    window.location.href = "/admin/products";
  };

  return (
    <AdminLayout>
      <MediaPicker
        isOpen={isMediaModalOpen}
        onClose={() => {
          setIsMediaModalOpen(false);
          setActiveSkuIdForMedia(null);
        }}
        onSelect={handleMediaSelect}
      />

      {/* Header */}
      <div className="mb-8">
        <Link
          className="mb-2 flex items-center gap-2 text-slate-500 text-sm hover:text-slate-800"
          href="/admin/products"
        >
          <ArrowLeft size={16} /> Back to Products
        </Link>
        <h1 className="font-bold text-3xl text-slate-900">
          Create New Product
        </h1>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="relative flex items-center justify-between">
          <div className="-z-10 absolute top-1/2 right-0 left-0 h-0.5 bg-slate-200" />
          {steps.map((label, idx) => (
            <div
              className={`flex flex-col items-center gap-2 bg-slate-50 px-2 ${idx <= currentStep ? "text-indigo-600" : "text-slate-400"}`}
              key={label}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 font-bold text-sm ${
                  idx <= currentStep
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-slate-300 bg-white"
                }`}
              >
                {idx + 1}
              </div>
              <span className="font-semibold text-xs">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="min-h-[400px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
        {/* Step 1: Select Template */}
        {currentStep === 0 && (
          <div className="p-8">
            <h2 className="mb-6 font-bold text-xl">
              Choose a Product Template
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {INITIAL_TEMPLATES.map((t) => (
                <div
                  className={`cursor-pointer rounded-xl border-2 p-6 transition-all ${
                    selectedTemplateId === t.id
                      ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600"
                      : "border-slate-200 hover:border-indigo-300"
                  }`}
                  key={t.id}
                  onClick={() => setSelectedTemplateId(t.id)}
                >
                  <h3 className="font-bold text-lg text-slate-900">{t.name}</h3>
                  <p className="mt-2 text-slate-500 text-sm">{t.description}</p>
                  <div className="mt-4 flex gap-2 text-slate-400 text-xs">
                    <span>{t.fields.length} fields</span>
                    <span>•</span>
                    <span>
                      {t.fields.filter((f) => f.isSkuSpec).length} SKU specs
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Fill Details & Select Specs */}
        {currentStep === 1 && template && (
          <div className="space-y-8 p-8">
            {/* System Fields */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="mb-4 flex items-center gap-2 font-bold text-lg text-slate-900">
                <Package className="text-indigo-600" size={20} />
                Basic Information
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1 block font-medium text-slate-700 text-sm">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. 2025 Summer Running Shoe"
                    type="text"
                    value={productName}
                  />
                </div>
                <div>
                  <label className="mb-1 block font-medium text-slate-700 text-sm">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    onChange={(e) => setCategoryId(e.target.value)}
                    value={categoryId}
                  >
                    <option value="">Select Category</option>
                    {INITIAL_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-medium text-slate-700 text-sm">
                    Manufacturing Factory{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    onChange={(e) => setFactoryId(e.target.value)}
                    value={factoryId}
                  >
                    <option value="">Select Factory</option>
                    {INITIAL_FACTORIES.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Template Fields */}
            <div>
              <h2 className="mb-4 flex items-center gap-2 font-bold text-lg text-slate-900">
                Template Details: {template.name}
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Render Non-Spec Fields */}
                {template.fields
                  .filter((f) => !f.isSkuSpec)
                  .map((field) => (
                    <div
                      className={
                        field.type === "richtext" ? "md:col-span-2" : ""
                      }
                      key={field.id}
                    >
                      <label className="mb-1 block font-medium text-slate-700 text-sm">
                        {field.name}{" "}
                        {field.required && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      {field.type === "richtext" ? (
                        <textarea
                          className="h-24 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                          onChange={(e) =>
                            setBaseData({
                              ...baseData,
                              [field.code]: e.target.value,
                            })
                          }
                          value={baseData[field.code] || ""}
                        />
                      ) : (
                        <input
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                          onChange={(e) =>
                            setBaseData({
                              ...baseData,
                              [field.code]: e.target.value,
                            })
                          }
                          type={field.type === "number" ? "number" : "text"}
                          value={baseData[field.code] || ""}
                        />
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Specs Selection */}
            <div className="border-t pt-8">
              <h2 className="mb-4 font-bold text-lg text-slate-900">
                SKU Specifications
              </h2>
              <p className="mb-6 text-slate-500 text-sm">
                Select all the options available for this product. We will
                generate the SKU combinations for you.
              </p>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {template.fields
                  .filter((f) => f.isSkuSpec)
                  .map((field) => (
                    <div
                      className="rounded-lg border border-slate-100 bg-slate-50 p-4"
                      key={field.id}
                    >
                      <label className="mb-3 block font-bold text-slate-900 text-sm">
                        {field.name}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {field.options?.map((opt) => {
                          const isSelected =
                            selectedSpecs[field.code]?.includes(opt);
                          return (
                            <button
                              className={`rounded-full border px-3 py-1.5 font-medium text-sm transition-colors ${
                                isSelected
                                  ? "border-indigo-600 bg-indigo-600 text-white"
                                  : "border-slate-300 bg-white text-slate-600 hover:border-indigo-400"
                              }`}
                              key={opt}
                              onClick={() => {
                                const current = selectedSpecs[field.code] || [];
                                const updated = isSelected
                                  ? current.filter((c) => c !== opt)
                                  : [...current, opt];
                                setSelectedSpecs({
                                  ...selectedSpecs,
                                  [field.code]: updated,
                                });
                              }}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-2 text-slate-400 text-xs">
                        Selected:{" "}
                        {selectedSpecs[field.code]?.join(", ") || "None"}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: SKU Matrix */}
        {currentStep === 2 && (
          <div className="p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-bold text-xl">Configure SKU Matrix</h2>
              <span className="rounded-full bg-indigo-50 px-3 py-1 font-medium text-indigo-700 text-sm">
                {generatedSkus.length} Variants Generated
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-slate-50 font-semibold text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-3">Variant Specs</th>
                    <th className="px-4 py-3">SKU Code</th>
                    <th className="w-32 px-4 py-3">Price ($)</th>
                    <th className="w-32 px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Image</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {generatedSkus.map((sku) => (
                    <tr className="hover:bg-slate-50" key={sku.id}>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {Object.entries(sku.specs).map(([key, val]) => (
                            <span
                              className="inline-block rounded border bg-white px-2 py-0.5 text-slate-600 text-xs"
                              key={key}
                            >
                              {val}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          className="w-full border-transparent border-b bg-transparent font-mono text-slate-900 outline-none focus:border-indigo-500"
                          onChange={(e) =>
                            updateSku(sku.id, "skuCode", e.target.value)
                          }
                          type="text"
                          value={sku.skuCode}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          className="w-full rounded border border-slate-200 px-2 py-1 outline-none focus:border-indigo-500"
                          onChange={(e) =>
                            updateSku(sku.id, "price", Number(e.target.value))
                          }
                          type="number"
                          value={sku.price}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          className="w-full rounded border border-slate-200 px-2 py-1 outline-none focus:border-indigo-500"
                          onChange={(e) =>
                            updateSku(sku.id, "stock", Number(e.target.value))
                          }
                          type="number"
                          value={sku.stock}
                        />
                      </td>
                      <td className="px-4 py-3">
                        {sku.image ? (
                          <div
                            className="group relative h-10 w-10 cursor-pointer"
                            onClick={() => {
                              setActiveSkuIdForMedia(sku.id);
                              setIsMediaModalOpen(true);
                            }}
                          >
                            <img
                              alt="SKU"
                              className="h-full w-full rounded object-cover"
                              src={sku.image}
                            />
                            <div className="absolute inset-0 hidden items-center justify-center rounded bg-black/50 text-white text-xs group-hover:flex">
                              Edit
                            </div>
                          </div>
                        ) : (
                          <button
                            className="flex h-10 w-10 items-center justify-center rounded border border-slate-300 border-dashed text-slate-400 hover:border-indigo-300 hover:text-indigo-600"
                            onClick={() => {
                              setActiveSkuIdForMedia(sku.id);
                              setIsMediaModalOpen(true);
                            }}
                          >
                            <Upload size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 3 && (
          <div className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Package size={40} />
            </div>
            <h2 className="mb-2 font-bold text-2xl text-slate-900">
              Ready to Publish?
            </h2>
            <p className="mx-auto mb-8 max-w-md text-slate-500">
              You are about to create <strong>{generatedSkus.length}</strong>{" "}
              SKUs for the product <strong>{productName}</strong>.
            </p>
            <div className="mx-auto max-w-lg space-y-3 rounded-lg bg-slate-50 p-6 text-left text-slate-600 text-sm">
              <p className="flex justify-between border-b pb-2">
                <strong>Category:</strong>{" "}
                <span>
                  {INITIAL_CATEGORIES.find((c) => c.id === categoryId)?.name}
                </span>
              </p>
              <p className="flex justify-between border-b pb-2">
                <strong>Factory:</strong>{" "}
                <span>
                  {INITIAL_FACTORIES.find((f) => f.id === factoryId)?.name}
                </span>
              </p>
              <p className="flex justify-between border-b pb-2">
                <strong>Template:</strong> <span>{template?.name}</span>
              </p>
              <p className="flex justify-between pt-2">
                <strong>Total Stock:</strong>{" "}
                <span>
                  {generatedSkus.reduce((acc, s) => acc + s.stock, 0)} units
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t bg-slate-50 p-6">
          <button
            className="px-6 py-2 font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50"
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          >
            Back
          </button>

          {currentStep < 3 ? (
            <button
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2 font-bold text-white shadow-indigo-200 shadow-lg hover:bg-indigo-700"
              onClick={handleNext}
            >
              Next Step <ChevronRight size={18} />
            </button>
          ) : (
            <button
              className="flex items-center gap-2 rounded-lg bg-green-600 px-8 py-2 font-bold text-white shadow-green-200 shadow-lg hover:bg-green-700"
              onClick={handlePublish}
            >
              <Save size={18} /> Publish Product
            </button>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
