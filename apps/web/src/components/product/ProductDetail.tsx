import type { InquiryTModel } from "@repo/contract";
import {
  ArrowRight,
  Check,
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
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useInquiryMutation } from "@/hooks/inquiry-hook";
import type { BackendProduct } from "@/hooks/product-hook";

interface ProductDetailProps {
  product: BackendProduct;
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
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const allMedia = useMemo(() => {
    const mediaList: MediaList[] = [];

    // 1. 添加通用 productMedia（不属于任何 SKU）
    if (product.productMedia) {
      product.productMedia.forEach((item) => {
        mediaList.push({
          id: item.media.id,
          url: item.media.url,
          mimeType: item.media.mimeType,
          skuId: null, // 通用图
        });
      });
    }

    // 2. 添加每个 SKU 的专属图
    if (product.skus) {
      product.skus.forEach((sku) => {
        if (sku.media) {
          mediaList.push({
            id: sku.media.id,
            url: sku.media.url,
            mimeType: sku.media.mimeType,
            skuId: sku.id,
          });
        }
      });
    }

    // 3. 【可选】确保视频放最后（根据 mimeType 判断）
    const images = mediaList.filter((m) => m.mimeType.startsWith("image/"));
    const videos = mediaList.filter(
      (m) =>
        m.mimeType.startsWith("video/") ||
        m.mimeType === "application/octet-stream"
    );

    images.forEach((item, index) => {
      item.mimeType = "image";
    });
    videos.forEach((item, index) => {
      item.mimeType = "video";
    });
    return [...images, ...videos];
  }, [product]);

  // 直接使用产品数据中的 SKU 列表
  const skus = product.skus || [];

  // 从 SKU 中提取规格选项
  const specOptions = useMemo(() => {
    const options: Record<string, Set<string>> = {};

    skus.forEach((sku: any) => {
      const specJson = sku.specJson || {};
      Object.entries(specJson).forEach(([key, value]) => {
        if (!options[key]) {
          options[key] = new Set();
        }
        options[key].add(value as string);
      });
    });

    // 转换为数组格式
    return Object.fromEntries(
      Object.entries(options).map(([key, values]) => [key, Array.from(values)])
    );
  }, [skus]);

  // SKU Selection State - 使用动态规格
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string>>(
    {}
  );

  const selectedSku = useMemo(
    () =>
      skus.find((sku: any) => {
        const specJson = sku.specJson || {};
        return Object.entries(selectedSpecs).every(
          ([key, value]) => specJson[key] === value
        );
      }),
    [skus, selectedSpecs]
  );

  useEffect(() => {
    if (selectedSku?.media) {
      // 找到该 media 在 allMedia 中的索引
      const index = allMedia.findIndex((m) => {
        if (!selectedSku.media) return;
        return m.id === selectedSku.media.id;
      });
      if (index !== -1) {
        setActiveMedia(index);
      }
    }
  }, [selectedSku, allMedia]);

  // 获取价格 - 从选中的SKU或最低价格
  const price = useMemo(() => {
    if (selectedSku) {
      return Number.parseFloat(selectedSku.price);
    }
    if (skus.length > 0) {
      // 返回最低价格
      return Math.min(...skus.map((sku: any) => Number.parseFloat(sku.price)));
    }
    return 0;
  }, [selectedSku, skus]);

  // Order Details State
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<string>(
    PAYMENT_METHODS[1]
  );

  const [formData, setFormData] = useState<InquiryTModel["ClientSubmitForm"]>({
    company: "",
    phone: "",
    email: "",
    whatsapp: "",
    remarks: "",
  });
  const [errors, setErrors] = useState<
    Partial<InquiryTModel["ClientSubmitForm"]>
  >({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // 在组件顶层定义 mutation
  const inquiryMutation = useInquiryMutation();

  // Related products - 暂时留空，后续从同分类中获取
  const relatedProducts: any[] = [];

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem("gina_user_info");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // We only load contact info, remarks should be fresh
        setFormData((prev) => ({
          ...prev,
          company: parsed.company || "",
          phone: parsed.phone || "",
          email: parsed.email || "",
          whatsapp: parsed.whatsapp || "",
        }));
      } catch (e) {
        console.error("Failed to parse saved user info", e);
      }
    }
  }, []);

  // Update selection if product changes
  useEffect(() => {
    setSelectedSpecs({});
    setQuantity(1);
    setActiveMedia(0);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof InquiryTModel["ClientSubmitForm"]]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<InquiryTModel["ClientSubmitForm"]> = {};
    let isValid = true;

    if (!formData.company.trim()) {
      newErrors.company = "Company name is required";
      isValid = false;
    }

    const hasContact =
      formData.phone.trim() ||
      formData.email.trim() ||
      formData.whatsapp.trim();
    if (!hasContact) {
      const msg = "Please provide at least one contact method";
      newErrors.phone = msg;
      newErrors.email = msg;
      newErrors.whatsapp = msg;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (validateForm()) {
      setIsSubmitting(true);

      // Save to localStorage ONLY contact info, excluding remarks
      const { remarks, ...contactInfo } = formData;
      localStorage.setItem("gina_user_info", JSON.stringify(contactInfo));

      // 准备发送到后端的数据
      const inquiryData: InquiryTModel["InquriryOrder"] = {
        productDesc: product.description || "",
        productId: product.id,
        productName: product.name || "",
        unit: "Pairs",
        sku: selectedSku!, // 使用非空断言操作符，因为我们已经在 handleOpenInquiry 中检查了规格选择
        specs: JSON.stringify(selectedSpecs),
        quantity,
        paymentMethod,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        remarks: formData.remarks,
      };

      // 调用后端 API
      try {
        await inquiryMutation.mutateAsync(inquiryData);

        setSubmitSuccess(true);
        setTimeout(() => {
          setSubmitSuccess(false);
          setShowInquiryForm(false);
          // Clear remarks after success
          setFormData((prev) => ({ ...prev, remarks: "" }));
        }, 3000);
      } catch (error) {
        console.error("提交询价单失败:", error);
        setSubmitError("提交失败，请稍后重试");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleOpenInquiry = () => {
    // 检查是否选择了所有必需的规格
    const requiredSpecs = Object.keys(specOptions);
    const missingSpecs = requiredSpecs.filter((spec) => !selectedSpecs[spec]);

    if (missingSpecs.length > 0) {
      alert(`Please select: ${missingSpecs.join(", ")}`);
      return;
    }

    // 确保有匹配的SKU
    if (!selectedSku) {
      alert("Please select a valid combination of specifications");
      return;
    }

    setShowInquiryForm(true);
  };

  const next = () => setActiveMedia((prev) => (prev + 1) % allMedia.length);
  const prevImage = () =>
    setActiveMedia((prev) => (prev - 1 + allMedia.length) % allMedia.length);

  const incrementQty = () => setQuantity((prev) => prev + 1);
  const decrementQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  function handleThumbnailClick(index: number): void {
    setActiveMedia(index);
    const clickedMedia = allMedia[index];

    // 如果这张图关联了某个 SKU
    if (clickedMedia.skuId !== undefined) {
      const matchedSku = product.skus.find(
        (sku) => sku.id === clickedMedia.skuId
      );
      if (matchedSku?.specJson) {
        // 自动选中该 SKU 的规格
        setSelectedSpecs(matchedSku.specJson as Record<string, string>);
      }
    }
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="mx-auto max-w-[1300px] px-6">
        {/* Main Product Layout */}
        <div className="mb-24 grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left: Image Gallery */}
          <div className="flex flex-col items-center lg:col-span-7">
            {/* Main Image with Nav */}
            <div className="group relative mb-8 aspect-4/3 w-full">
              <button
                className="absolute top-1/2 left-0 z-10 -translate-y-1/2 p-2 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={prevImage}
              >
                <ChevronLeft className="h-6 w-6 text-gray-400" />
              </button>

              {/* 展示图片、视频h*/}
              {allMedia[activeMedia].mimeType === "video" ? (
                <video
                  autoPlay
                  className="h-full w-full object-contain mix-blend-multiply"
                  controls
                  loop
                  muted
                  playsInline
                >
                  <source src={allMedia[activeMedia].url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <Image
                  alt={product.name}
                  className="h-full w-full object-contain mix-blend-multiply"
                  fill
                  loading="eager"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 70vw, 50vw"
                  src={allMedia[activeMedia].url}
                />
              )}

              <button
                className="absolute top-1/2 right-0 z-10 -translate-y-1/2 p-2 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={next}
              >
                <ChevronRight className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="flex space-x-4">
              {allMedia.map((media, idx) => (
                <div
                  className={`relative h-20 w-20 cursor-pointer border p-1 transition-colors ${activeMedia === idx ? "border-black" : "border-transparent"}`}
                  key={media.id}
                  onClick={() => handleThumbnailClick(idx)}
                >
                  {media.mimeType === "image" ? (
                    <Image
                      alt=""
                      className="object-cover"
                      fill
                      sizes="80px"
                      src={media.url}
                    />
                  ) : (
                    <div className="flex h-full w-full cursor-pointer items-center justify-center bg-gray-200">
                      <Play className="h-8 w-8 fill-current text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="pt-8 pl-4 lg:col-span-5">
            {/* Typography */}
            <div className="mb-6">
              <h1 className="mb-2 font-serif text-5xl text-black italic">
                {product.name}
              </h1>
              <p className="mb-6 font-serif text-gray-500 text-xl italic">
                {product.spuCode}
              </p>
              <div className="font-light text-lg">
                Ref Price:{" "}
                <span className="font-medium text-black">
                  {price > 0 ? (
                    <>
                      USD{" "}
                      {price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      {!selectedSku && skus.length > 1 && (
                        <span className="ml-1 text-gray-400 text-sm">起</span>
                      )}
                    </>
                  ) : (
                    "Contact for price"
                  )}
                </span>
              </div>
            </div>

            {/* SKU Selection - 动态规格选择 */}
            {Object.entries(specOptions).map(([specKey, specValues]) => (
              <div className="mb-6" key={specKey}>
                <span className="mb-2 block font-bold text-[10px] text-gray-500 uppercase tracking-widest">
                  {specKey}: {selectedSpecs[specKey] || ""}
                </span>
                <div className="flex flex-wrap gap-2">
                  {specValues.map((value) => (
                    <button
                      className={`border px-4 py-2 font-bold text-xs transition-colors ${
                        selectedSpecs[specKey] === value
                          ? "border-black bg-black text-white"
                          : "border-gray-200 text-black hover:border-black"
                      }`}
                      key={value}
                      onClick={() =>
                        setSelectedSpecs((prev) => ({
                          ...prev,
                          [specKey]: value,
                        }))
                      }
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity and Payment Terms */}
            <div className="mb-8 space-y-6">
              {/* Quantity */}
              <div>
                <span className="mb-2 block font-bold text-[10px] text-gray-500 uppercase tracking-widest">
                  Quantity
                </span>
                <div className="flex w-32 items-center border border-gray-200">
                  <button
                    className="flex h-10 w-10 items-center justify-center transition-colors hover:bg-gray-50"
                    onClick={decrementQty}
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <div className="flex-1 text-center font-medium text-sm">
                    {quantity}
                  </div>
                  <button
                    className="flex h-10 w-10 items-center justify-center transition-colors hover:bg-gray-50"
                    onClick={incrementQty}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Payment Method */}
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
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mb-8 flex items-center space-x-4">
              <button
                className="flex-1 bg-black py-4 font-bold text-[11px] text-white uppercase tracking-[0.2em] transition-colors hover:bg-gray-800"
                onClick={handleOpenInquiry}
              >
                Request Availability
              </button>
              <button className="border border-gray-200 p-3 transition-colors hover:border-black">
                <Share2 className="h-4 w-4 text-black" />
              </button>
              <button className="border border-gray-200 p-3 transition-colors hover:border-black">
                <Heart className="h-4 w-4 text-black" />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-gray-200 border-t pt-6">
              <div className="mb-6 flex space-x-8 border-gray-100 border-b pb-px">
                <button
                  className={`pb-2 font-bold text-xs uppercase tracking-widest ${activeTab === "description" ? "border-gold border-b-2 text-black" : "text-gray-400"}`}
                  onClick={() => setActiveTab("description")}
                >
                  Description
                </button>
                <button
                  className={`pb-2 font-bold text-xs uppercase tracking-widest ${activeTab === "details" ? "border-gold border-b-2 text-black" : "text-gray-400"}`}
                  onClick={() => setActiveTab("details")}
                >
                  Details
                </button>
              </div>

              <div className="min-h-[150px]">
                {activeTab === "description" ? (
                  <p className="font-serif text-gray-600 text-sm leading-relaxed">
                    {product.description ||
                      `Discover ${product.name}, a premium product crafted with attention to detail.`}
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="mb-1 font-bold text-xs uppercase">
                        Product Code
                      </h4>
                      <p className="font-serif text-gray-600 text-sm">
                        {product.spuCode}
                      </p>
                    </div>
                    <div>
                      <h4 className="mb-1 font-bold text-xs uppercase">
                        Categories
                      </h4>
                      <p className="font-serif text-gray-600 text-sm">
                        {product.productCategories
                          ?.map((pc) => pc.category.name)
                          .join(", ") || "N/A"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="group mt-4 flex cursor-pointer items-center justify-between border-gray-100 border-t border-b py-4">
                <span className="text-gray-500 text-xs">
                  Delivery and Returns
                </span>
              </div>

              <p className="mt-6 text-center font-bold text-[10px] text-gray-400 uppercase tracking-widest">
                Free Delivery Worldwide
              </p>
            </div>
          </div>
        </div>

        {/* You May Also Like Section - 暂时隐藏 */}
        {relatedProducts.length > 0 && (
          <div className="border-gray-100 border-t pt-16">
            <h3 className="mb-12 text-center font-serif text-2xl italic">
              You may also like
            </h3>

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
              {/* Related products will be here */}
            </div>
          </div>
        )}
      </div>

      {/* Inquiry Modal */}
      {showInquiryForm && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="no-scrollbar relative max-h-[90vh] w-full max-w-md animate-fade-in-up overflow-y-auto border border-gray-100 bg-white p-10 shadow-2xl">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-black"
              onClick={() => setShowInquiryForm(false)}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-8 text-center">
              <span className="mb-2 block font-bold text-[10px] text-gray-400 uppercase tracking-widest">
                Concierge Service
              </span>
              <h3 className="mb-2 font-serif text-3xl text-black italic">
                Request Quote
              </h3>
              <p className="mb-1 font-light text-gray-500 text-xs">
                {product.name} - {product.spuCode}
              </p>
              {selectedSku && (
                <div className="mt-2 space-y-1">
                  {Object.entries(selectedSpecs).map(([key, value]) => (
                    <div
                      className="mr-2 inline-block bg-gray-100 px-2 py-1 font-bold text-[10px] text-black uppercase tracking-wider"
                      key={key}
                    >
                      {key}: {value}
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-1 inline-block bg-gray-100 px-2 py-1 font-bold text-[10px] text-black uppercase tracking-wider">
                Qty: {quantity}
              </div>
              <div className="mt-1 font-bold text-[10px] text-black uppercase tracking-wider">
                Term: {paymentMethod}
              </div>
            </div>

            {submitSuccess ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-black">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <h4 className="mb-2 font-serif text-black text-xl italic">
                  Inquiry Received
                </h4>
                <p className="font-light text-gray-500 text-sm">
                  We will be in touch shortly.
                </p>
              </div>
            ) : (
              <>
                {submitError && (
                  <div className="mb-4 rounded-lg bg-red-50 p-4 text-center">
                    <p className="text-red-600 text-sm">{submitError}</p>
                  </div>
                )}
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <input
                      className={`w-full border-b bg-white text-black ${errors.company ? "border-red-500" : "border-gray-200"} py-2 text-sm placeholder-gray-400 transition-colors focus:border-black focus:outline-none`}
                      name="company"
                      onChange={handleInputChange}
                      placeholder="Company Name *"
                      type="text"
                      value={formData.company}
                    />
                    {errors.company && (
                      <p className="mt-1 text-[10px] text-red-500">
                        {errors.company}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4 pt-2">
                    <p className="mb-2 font-bold text-[10px] text-gray-400 uppercase tracking-wider">
                      Contact Method (Select 1)
                    </p>

                    <input
                      className={`w-full border-b bg-white text-black ${errors.phone ? "border-red-500" : "border-gray-200"} py-2 text-sm placeholder-gray-400 transition-colors focus:border-black focus:outline-none`}
                      name="phone"
                      onChange={handleInputChange}
                      placeholder="Phone"
                      type="tel"
                      value={formData.phone}
                    />

                    <input
                      className={`w-full border-b bg-white text-black ${errors.email ? "border-red-500" : "border-gray-200"} py-2 text-sm placeholder-gray-400 transition-colors focus:border-black focus:outline-none`}
                      name="email"
                      onChange={handleInputChange}
                      placeholder="Email Address"
                      type="email"
                      value={formData.email}
                    />

                    <input
                      className={`w-full border-b bg-white text-black ${errors.whatsapp ? "border-red-500" : "border-gray-200"} py-2 text-sm placeholder-gray-400 transition-colors focus:border-black focus:outline-none`}
                      name="whatsapp"
                      onChange={handleInputChange}
                      placeholder="WhatsApp"
                      type="tel"
                      value={formData.whatsapp}
                    />

                    {(errors.phone || errors.email || errors.whatsapp) && (
                      <p className="text-[10px] text-red-500">
                        Please provide at least one contact method.
                      </p>
                    )}
                  </div>

                  <div className="pt-4">
                    <p className="mb-2 font-bold text-[10px] text-gray-400 uppercase tracking-wider">
                      Additional Notes
                    </p>
                    <textarea
                      className="h-24 w-full resize-none border border-gray-200 bg-white p-3 text-black text-sm placeholder-gray-400 transition-colors focus:border-black focus:outline-none"
                      name="remarks"
                      onChange={handleInputChange}
                      placeholder="Enter any special requests or questions..."
                      value={formData.remarks}
                    />
                  </div>

                  <button
                    className="group mt-6 flex w-full items-center justify-center bg-black py-3 font-bold text-[10px] text-white uppercase tracking-[0.2em] transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isSubmitting}
                    type="submit"
                  >
                    {isSubmitting ? (
                      <span>Submitting...</span>
                    ) : (
                      <>
                        <span>Submit Request</span>
                        <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
