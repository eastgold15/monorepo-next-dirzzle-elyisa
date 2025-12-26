"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CategoryGrid from "@/components/layout/CategoryGrid";
import { useProductListQuery } from "@/hooks/api/product-hook";
import { useCategoryDetailQuery } from "@/hooks/api/site-category-hook";

export default function CategoryClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 查询分类详情
  const {
    data: categoryData,
    isLoading: isCategoryLoading,
    error: categoryError,
  } = useCategoryDetailQuery(id || "", { enabled: isMounted && !!id });

  // 查询分类下的产品列表
  const {
    data: productListRes,
    isLoading: isProductLoading,
    error: productError,
  } = useProductListQuery(
    { categoryId: id || "" },
    { enabled: isMounted && !!id }
  );

  // loading 状态聚合
  const isLoading = !isMounted || isCategoryLoading || isProductLoading;

  // error 状态聚合
  const isError = categoryError || productError || !(isLoading || categoryData);

  if (isLoading) {
    // 这里的加载状态已经在主页面的 Suspense fallback 中处理
    return null;
  }

  if (isError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 font-serif text-3xl italic">
            Category Not Found
          </h1>
          <p className="text-gray-500">
            The category you are looking for does not exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const title = categoryData?.name || "Collection";

  return (
    <CategoryGrid
      description={categoryData?.description || ""}
      productListRes={
        productListRes || {
          items: [],
          meta: { total: 0, page: 1, limit: 12, totalPages: 0 },
        }
      }
      title={title}
    />
  );
}
