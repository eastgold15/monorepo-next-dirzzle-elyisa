"use client";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CategoryGrid from "@/components/layout/CategoryGrid";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { useCategoryDescQuery } from "@/hooks/category-hook";
import { useProductListQuery } from "@/hooks/product-hook";

export default function CategoryPage() {
  const { slug } = useParams(); // 从 params.slug 获取 slug
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [isMounted, setIsMounted] = useState(false);

  // 确保组件已挂载，避免水合不匹配
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 添加调试信息
  console.log("CategoryPage Debug:", { slug, id, isMounted });

  const {
    data: descRes,
    error: err,
    isLoading: descLoading,
  } = useCategoryDescQuery(id, { enabled: isMounted && !!id });

  const {
    data: products,
    error: productError,
    isLoading: productLoading,
  } = useProductListQuery(
    {
      categoryId: id,
    },
    { enabled: isMounted && !!id }
  );

  // 添加调试信息
  console.log("Query Debug:", {
    descLoading,
    productLoading,
    descRes,
    products,
    err,
    productError,
  });

  // 如果还未挂载，显示加载状态或空内容（不返回null）
  if (!isMounted) {
    return (
      <div className="relative min-h-screen bg-white font-sans text-black selection:bg-black selection:text-white">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-32 w-32 animate-spin rounded-full border-black border-b-2" />
        </div>
        <Footer />
      </div>
    );
  }

  // 处理加载状态
  if (descLoading || productLoading) {
    return (
      <div className="relative min-h-screen bg-white font-sans text-black selection:bg-black selection:text-white">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-32 w-32 animate-spin rounded-full border-black border-b-2" />
        </div>
        <Footer />
      </div>
    );
  }

  // 处理错误状态
  if (err || !descRes || productError || !products) {
    return (
      <div className="relative min-h-screen bg-white font-sans text-black selection:bg-black selection:text-white">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="mb-4 font-bold text-2xl">Category Not Found</h1>
            <p className="text-gray-600">
              The category you're looking for doesn't exist or has no products.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Format title: "platforms" -> "PLATFORMS"
  const title = (slug as string).replace(/-/g, " ");

  return (
    <div className="relative min-h-screen bg-white font-sans text-black selection:bg-black selection:text-white">
      <Navbar />
      <CategoryGrid
        description={descRes.data.des}
        products={products.data}
        title={title}
      />
      <Footer />
    </div>
  );
}
