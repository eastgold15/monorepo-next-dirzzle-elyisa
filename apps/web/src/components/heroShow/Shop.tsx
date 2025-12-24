"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { useProductListQuery } from "@/hooks/api/product-hook";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

interface ShopProps {
  onProductSelect?: (productId: string) => void;
}

const ShopSkeleton = () => (
  <div className="grid w-full max-w-2xl grid-cols-2 gap-x-8 gap-y-16">
    {Array.from({ length: 4 }).map((_, i) => (
      <div className="flex flex-col items-center" key={i}>
        {/* 匹配图片的 aspect-[4/3] */}
        <Skeleton className="mb-6 aspect-[4/3] w-full" />
        {/* 匹配标题文字 */}
        <Skeleton className="h-6 w-24" />
      </div>
    ))}
  </div>
);

/**
 * Product 图片组件 - 独立处理图片加载
 */
const ProductImage: React.FC<{
  imageUrl: string | null | undefined;
  alt: string;
}> = ({ imageUrl, alt }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const defaultImage =
    "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=2080&auto=format&fit=crop";

  return (
    <div className="relative h-full w-full bg-gray-50">
      {/* 图片未完成加载时显示一个淡色的 Skeleton */}
      {!isLoaded && <Skeleton className="absolute inset-0 z-10" />}

      <Image
        alt={alt}
        className={cn(
          "object-contain mix-blend-multiply transition-opacity duration-500",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        fill
        onLoad={() => setIsLoaded(true)}
        sizes="(max-width: 768px) 50vw, 25vw"
        src={imageUrl || defaultImage}
      />
    </div>
  );
};

const Shop: React.FC<ShopProps> = ({ onProductSelect }) => {
  const router = useRouter();
  const { data, isLoading, error } = useProductListQuery({ limit: 4 });

  // 1. 优先处理加载
  if (isLoading) return <ShopSkeleton />;

  // 2. 错误处理 (建议不渲染任何内容或渲染一个简单的提示)
  if (error || !data) return null;

  const products = data.items || [];
  const handleProductClick = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  return (
    <div className="flex h-full w-full items-center justify-center bg-white py-8">
      <div className="grid h-full w-full max-w-2xl grid-cols-2 gap-x-8 gap-y-16">
        {products.slice(0, 4).map((product) => (
          <div
            className="group flex cursor-pointer flex-col items-center"
            key={product.id}
            onClick={() => router.push(`/product/${product.id}`)}
          >
            <div className="relative mb-6 aspect-[4/3] w-full overflow-hidden">
              <ProductImage
                alt={product.name}
                imageUrl={product.mainImageUrl} // 修正：接口定义里是 mainImageUrl
              />
            </div>
            <div className="text-center">
              <h3 className="mb-1 font-serif text-black text-lg italic transition-colors group-hover:text-gray-600 md:text-xl">
                {product.name}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shop;
