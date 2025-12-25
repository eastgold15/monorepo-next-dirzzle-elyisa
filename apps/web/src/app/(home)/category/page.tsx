"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CategoryGrid from "@/components/layout/CategoryGrid";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/Navbar/Navbar"; // 确认你的 Navbar 路径
import { Skeleton } from "@/components/ui/skeleton"; // 导入我们封装的骨架屏
import { useCategoryDetailQuery } from "@/hooks/api/category-hook";
import { useProductListQuery } from "@/hooks/api/product-hook";

export default function CategoryPage() {
  // 1. 不再需要 useParams，只保留 searchParams 获取 ID
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 2. 查询分类详情 (获取描述和名称)
  const {
    data: categoryData,
    isLoading: isCategoryLoading,
    error: categoryError,
  } = useCategoryDetailQuery(id || "", { enabled: isMounted && !!id });

  // 3. 查询分类下的产品列表
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

  // --- 渲染部分 ---

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-white font-sans text-black selection:bg-black selection:text-white">
        <Navbar />
        {/* 使用骨架屏替代 loading 转圈 */}
        <div className="mx-auto max-w-[1920px] px-4 pt-32 md:px-8 lg:px-12">
          <div className="mb-12 text-center">
            {/* 标题骨架 */}
            <Skeleton className="mx-auto mb-4 h-10 w-48 bg-gray-100" />
            {/* 描述骨架 */}
            <Skeleton className="mx-auto h-4 w-96 bg-gray-100" />
          </div>
          {/* 产品网格骨架 */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div className="space-y-4" key={i}>
                <Skeleton className="aspect-[3/4] w-full bg-gray-100" />
                <Skeleton className="mx-auto h-4 w-2/3 bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="relative min-h-screen bg-white font-sans text-black selection:bg-black selection:text-white">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <h1 className="mb-4 font-serif text-3xl italic">
              Category Not Found
            </h1>
            <p className="text-gray-500">
              The category you are looking for does not exist or has been
              removed.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // 3. 获取标题：优先使用接口返回的名称，不再从 URL 获取
  // 假设 categoryData 返回结构里有 name 字段
  const title = categoryData?.name || "Collection";

  return (
    <div className="relative min-h-screen bg-white font-sans text-black selection:bg-black selection:text-white">
      <Navbar />
      <CategoryGrid
        description={categoryData?.description || ""} // 兼容不同字段名
        productListRes={
          productListRes || {
            items: [],
            meta: { total: 0, page: 1, limit: 12, totalPages: 0 },
          }
        }
        title={title}
      />
      <Footer />
    </div>
  );
}
