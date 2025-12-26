import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Play,
  Plus,
  Share2,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useInquiryMutation } from "@/hooks/api/inquiry-hook";
import {
  type ProductDetailRes,
  useProductListQuery,
} from "@/hooks/api/product-hook";
import { cn } from "@/lib/utils";
import { InquiryForm, type InquiryFormValues } from "./InquiryForm"; // 导入上面的组件
import { SimpleProductImage } from "./SimpleProductImage";
import { SuccessView } from "./SuccessView";

interface ProductDetailProps {
  product: ProductDetailRes;
}

type MediaList = {
  id: string;
  url: string;
  mimeType: string;
  skuId: string | null;
};

const PAYMENT_METHODS = [
  "Cash on Delivery",
  "30% Deposit, Balance against B/L",
  "L/C at 30 days sight",
];

const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  const [activeMedia, setActiveMedia] = useState(0);
  const [activeTab, setActiveTab] = useState<"description" | "details">(
    "description"
  );

  // 1. 数据获取：猜你喜欢 (Related Products)
  // 逻辑：获取当前产品的第一个分类ID
  const categoryId = product.siteCategory?.[0]?.categoryId;

  const { data: relatedData } = useProductListQuery(
    {
      categoryId,
      limit: 4, // 取4个，如果是自己就排除
    },
    { enabled: !!categoryId }
  );

  // 过滤掉当前产品本身，取前3个
  const relatedProducts = useMemo(
    () =>
      relatedData?.items
        ?.filter((item) => item.id !== product.id)
        .slice(0, 3) || [],
    [relatedData, product.id]
  );

  // 2. 逻辑优化：Media 处理
  const allMedia = useMemo(() => {
    const list: MediaList[] = [];

    // 通用图
    product.productMedia?.forEach((item) => {
      list.push({ ...item.media, skuId: null });
    });

    // SKU图
    product.skus?.forEach((sku) => {
      if (sku.media) {
        // 有些后端可能返回数组，有些返回单个对象，做个兼容
        const medias = Array.isArray(sku.media) ? sku.media : [sku.media];
        medias.forEach((m) => list.push({ ...m, skuId: sku.id }));
      }
    });

    // 排序：图片在前，视频在后 (或者你可以根据 sortOrder 排序)
    return list.sort((a, b) => {
      const aIsVideo = a.mimeType.startsWith("video");
      const bIsVideo = b.mimeType.startsWith("video");
      if (aIsVideo === bIsVideo) return 0;
      return aIsVideo ? 1 : -1;
    });
  }, [product]);

  // SKU & Specs Logic
  const skus = product.skus || [];
  const specOptions = useMemo(() => {
    const options: Record<string, Set<string>> = {};
    skus.forEach((sku) => {
      const specJson = (sku.specJson as Record<string, string>) || {};
      Object.entries(specJson).forEach(([key, value]) => {
        if (!options[key]) options[key] = new Set();
        options[key].add(value);
      });
    });
    return Object.fromEntries(
      Object.entries(options).map(([key, values]) => [key, Array.from(values)])
    );
  }, [skus]);

  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string>>(
    {}
  );

  const selectedSku = useMemo(() => {
    if (Object.keys(selectedSpecs).length === 0) return null;
    return skus.find((sku) => {
      const specJson = (sku.specJson as Record<string, string>) || {};
      return Object.entries(selectedSpecs).every(
        ([key, value]) => specJson[key] === value
      );
    });
  }, [skus, selectedSpecs]);

  // 价格计算优化
  const displayPrice = useMemo(() => {
    if (selectedSku) return Number(selectedSku.price);
    if (skus.length === 0) return 0;
    // 找出最低价
    return Math.min(...skus.map((s) => Number(s.price)));
  }, [selectedSku, skus]);

  // Media 联动：选中 SKU 时自动切换到该 SKU 的第一张图
  useEffect(() => {
    if (selectedSku) {
      // 查找属于该 SKU 的第一张图
      const index = allMedia.findIndex((m) => m.skuId === selectedSku.id);
      if (index !== -1) setActiveMedia(index);
    }
  }, [selectedSku, allMedia]);

  // Form State
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[1]);

  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const inquiryMutation = useInquiryMutation();

  // 真正的提交逻辑
  const handleInquirySubmit = async (values: InquiryFormValues) => {
    try {
      // 保存用户信息到本地 (不含备注)
      const { remarks, ...contactInfo } = values;
      localStorage.setItem("gina_user_info", JSON.stringify(contactInfo));

      await inquiryMutation.mutateAsync({
        productId: product.id,
        skuId: selectedSku!.id!,
        productName: product.name,
        productDesc: product.description || "",
        paymentMethod,
        customerRemarks: remarks || "",
        quantity,
        customerCompany: values.company,
        customerEmail: values.email || "",
        customerPhone: values.phone || "",
        customerWhatsapp: values.whatsapp || "",
      });

      setSubmitSuccess(true);
      // 3秒后关闭
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowInquiryForm(false);
      }, 3000);
    } catch (error) {
      console.error(error);
      // 你甚至可以使用 form.setError 设置 API 返回的错误
    }
  };

  // 获取初始值
  const getSavedValues = () => {
    if (typeof window === "undefined") return {};
    const saved = localStorage.getItem("gina_user_info");
    return saved ? JSON.parse(saved) : {};
  };

  const handleOpenInquiry = () => {
    const missing = Object.keys(specOptions).filter((k) => !selectedSpecs[k]);
    if (missing.length > 0)
      return alert(`Please select: ${missing.join(", ")}`);
    // 如果产品有SKU但没有选到匹配的，提示
    if (skus.length > 0 && !selectedSku)
      return alert("Invalid combination selected");
    setShowInquiryForm(true);
  };

  const mediaItem = allMedia[activeMedia];

  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="mx-auto max-w-[1300px] px-6">
        <div className="mb-24 grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* --- LEFT: GALLERY --- */}
          <div className="flex flex-col items-center lg:col-span-7">
            {/* Main Image Area */}
            <div className="group relative mb-8 aspect-4/3 w-full border border-transparent bg-gray-50 transition-colors hover:border-gray-100">
              {/* Navigation Arrows */}
              {allMedia.length > 1 && (
                <>
                  <button
                    className="absolute top-1/2 left-0 z-10 -translate-y-1/2 p-4 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() =>
                      setActiveMedia(
                        (p) => (p - 1 + allMedia.length) % allMedia.length
                      )
                    }
                  >
                    <ChevronLeft className="h-8 w-8 text-gray-400 hover:text-black" />
                  </button>
                  <button
                    className="absolute top-1/2 right-0 z-10 -translate-y-1/2 p-4 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() =>
                      setActiveMedia((p) => (p + 1) % allMedia.length)
                    }
                  >
                    <ChevronRight className="h-8 w-8 text-gray-400 hover:text-black" />
                  </button>
                </>
              )}

              {mediaItem ? (
                mediaItem.mimeType.startsWith("video") ? (
                  <video
                    autoPlay
                    className="h-full w-full object-contain mix-blend-multiply"
                    controls
                    key={mediaItem.id}
                    loop
                    muted
                    playsInline
                  >
                    <source src={mediaItem.url} />
                  </video>
                ) : (
                  <Image
                    alt={product.name || "Product Image"}
                    className="object-contain mix-blend-multiply"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    src={mediaItem.url}
                  />
                )
              ) : (
                <div className="flex h-full items-center justify-center text-gray-300">
                  No Media
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="no-scrollbar flex max-w-full space-x-4 overflow-x-auto pb-2">
              {allMedia.map((m, idx) => (
                <button
                  className={cn(
                    "relative h-20 w-20 flex-shrink-0 border transition-all",
                    activeMedia === idx
                      ? "border-black ring-1 ring-black"
                      : "border-gray-100 hover:border-gray-300"
                  )}
                  key={m.id}
                  onClick={() => {
                    setActiveMedia(idx);
                    // 点击 SKU 图片自动选中对应规格 (优化体验)
                    if (m.skuId) {
                      const sku = skus.find((s) => s.id === m.skuId);
                      if (sku?.specJson) setSelectedSpecs(sku.specJson as any);
                    }
                  }}
                >
                  {m.mimeType.startsWith("video") ? (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100">
                      <Play className="h-6 w-6 text-gray-400" />
                    </div>
                  ) : (
                    <Image alt="" className="object-cover" fill src={m.url} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* --- RIGHT: INFO --- */}
          <div className="pt-8 pl-4 lg:col-span-5">
            <h1 className="mb-2 font-serif text-5xl text-black italic leading-tight">
              {product.name}
            </h1>
            <p className="mb-6 font-serif text-gray-500 text-xl italic">
              {product.spuCode}
            </p>

            <div className="mb-8 font-light text-lg">
              Ref Price:{" "}
              <span className="font-medium text-black">
                {displayPrice > 0
                  ? `USD ${displayPrice.toFixed(2)}`
                  : "Contact for price"}
                {/* 如果没有选中SKU且有多个SKU，显示“起” */}
                {!selectedSku && skus.length > 1 && (
                  <span className="ml-1 text-gray-400 text-sm">起</span>
                )}
              </span>
            </div>

            {/* SKU Selectors */}
            {Object.entries(specOptions).map(([key, values]) => (
              <div className="mb-6" key={key}>
                <span className="mb-2 block font-bold text-[10px] text-gray-500 uppercase tracking-widest">
                  {key}
                </span>
                <div className="flex flex-wrap gap-2">
                  {values.map((val) => (
                    <button
                      className={cn(
                        "border px-4 py-2 font-bold text-xs transition-colors",
                        selectedSpecs[key] === val
                          ? "border-black bg-black text-white"
                          : "border-gray-200 text-black hover:border-black"
                      )}
                      key={val}
                      onClick={() =>
                        setSelectedSpecs((prev) => ({ ...prev, [key]: val }))
                      }
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity & Payment */}
            <div className="mb-8 space-y-6">
              <div>
                <span className="mb-2 block font-bold text-[10px] text-gray-500 uppercase tracking-widest">
                  Quantity
                </span>
                <div className="flex w-32 items-center border border-gray-200">
                  <button
                    className="flex h-10 w-10 items-center justify-center hover:bg-gray-50"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <div className="flex-1 text-center font-medium text-sm">
                    {quantity}
                  </div>
                  <button
                    className="flex h-10 w-10 items-center justify-center hover:bg-gray-50"
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div>
                <span className="mb-2 block font-bold text-[10px] text-gray-500 uppercase tracking-widest">
                  Payment Terms
                </span>
                <div className="relative">
                  <select
                    className="w-full cursor-pointer appearance-none border border-gray-200 bg-white px-4 py-3 pr-10 font-serif text-sm italic focus:border-black focus:outline-none"
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    value={paymentMethod}
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mb-8 flex items-center space-x-4">
              <button
                className="flex-1 transform bg-black py-4 font-bold text-[11px] text-white uppercase tracking-[0.2em] transition-colors hover:bg-gray-800 active:scale-[0.98]"
                onClick={handleOpenInquiry}
              >
                Request Availability
              </button>
              <button className="border border-gray-200 p-3 transition-colors hover:border-black">
                <Share2 className="h-4 w-4" />
              </button>
              <button className="border border-gray-200 p-3 transition-colors hover:border-black">
                <Heart className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-gray-200 border-t pt-6">
              <div className="mb-6 flex space-x-8 border-gray-100 border-b pb-px">
                {(["description", "details"] as const).map((tab) => (
                  <button
                    className={cn(
                      "pb-2 font-bold text-xs uppercase tracking-widest transition-colors",
                      activeTab === tab
                        ? "border-black border-b-2 text-black"
                        : "text-gray-400 hover:text-gray-600"
                    )}
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="min-h-[100px] font-serif text-gray-600 text-sm leading-relaxed">
                {activeTab === "description" ? (
                  <div style={{ whiteSpace: "pre-line" }}>
                    {product.description ||
                      `Discover ${product.name}, a premium product.`}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <strong className="mb-1 block font-sans text-xs uppercase">
                        Code
                      </strong>{" "}
                      {product.spuCode}
                    </div>
                    {/* 兼容 productCategories 和 siteCategory 两种结构 */}
                    <div>
                      <strong className="mb-1 block font-sans text-xs uppercase">
                        Categories
                      </strong>{" "}
                      {product.siteCategory
                        ?.map((c) => c.category.name)
                        .join(", ") ||
                        product.siteCategory
                          ?.map((c) => c.categoryId)
                          .join(", ")}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- RELATED PRODUCTS (已实现) --- */}
        {relatedProducts.length > 0 && (
          <div className="border-gray-100 border-t pt-16">
            <h3 className="mb-12 text-center font-serif text-2xl italic">
              You may also like
            </h3>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
              {relatedProducts.map((p) => (
                <Link
                  className="group cursor-pointer"
                  href={`/product/${p.id}`}
                  key={p.id}
                >
                  <div className="relative mb-4 aspect-4/3 w-full overflow-hidden bg-gray-50">
                    {/* 使用复用组件处理图片加载 */}
                    <SimpleProductImage alt={p.name} src={p.mainImageUrl} />
                  </div>
                  <div className="text-center">
                    <h4 className="font-serif text-lg italic transition-colors group-hover:text-gray-600">
                      {p.name}
                    </h4>
                    <p className="mt-1 text-gray-400 text-xs uppercase tracking-wider">
                      {p.price && Number(p.price) > 0
                        ? `$${Number(p.price).toFixed(2)}`
                        : "Inquire"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- INQUIRY MODAL (精简版) --- */}
      {showInquiryForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="no-scrollbar relative max-h-[90vh] w-full max-w-md overflow-y-auto bg-white p-8 shadow-2xl">
            <button
              className="absolute top-4 right-4 text-gray-400 transition-colors hover:text-black"
              onClick={() => setShowInquiryForm(false)}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 text-center">
              <h3 className="mb-2 font-serif text-3xl italic">Request Quote</h3>
              <p className="text-gray-500 text-xs">
                {product.name} ({product.spuCode})
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {Object.entries(selectedSpecs).map(([k, v]) => (
                  <span
                    className="border border-gray-200 bg-gray-100 px-2 py-1 font-bold text-[10px] text-gray-600 uppercase"
                    key={k}
                  >
                    {k}: {v}
                  </span>
                ))}
              </div>
            </div>

            {submitSuccess ? (
              <SuccessView />
            ) : (
              // ✨ 核心变化：直接调用新组件
              <InquiryForm
                defaultValues={getSavedValues()}
                onSubmit={handleInquirySubmit}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
