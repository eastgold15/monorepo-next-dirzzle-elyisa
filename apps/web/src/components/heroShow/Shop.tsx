"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type React from "react";
import { useProductListQuery } from "@/hooks/product-hook";

interface ShopProps {
  onProductSelect?: (productId: string) => void;
}

/**
 * Product 图片组件 - 独立处理图片加载
 */
const ProductImage: React.FC<{
  imageUrl: string | null | undefined;
  alt: string;
}> = ({ imageUrl, alt }) => {
  const defaultImage =
    "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=2080&auto=format&fit=crop";

  if (!imageUrl) {
    return (
      <Image
        alt={alt}
        className="h-full w-full object-contain mix-blend-multiply"
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        src={defaultImage}
      />
    );
  }

  return (
    <Image
      alt={alt}
      className="h-full w-full object-contain mix-blend-multiply"
      fill
      sizes="(max-width: 768px) 50vw, 25vw"
      src={imageUrl}
    />
  );
};

const Shop: React.FC<ShopProps> = ({ onProductSelect }) => {
  const router = useRouter();
  const {
    data: response,
    isLoading,
    error,
  } = useProductListQuery({ limit: 4 });

  if (error || !response) {
    console.error("Error fetching products:", error);
    return null;
  }

  const handleProductClick = (productId: number) => {
    router.push(`/product/${productId}`);
  };

  // 加载状态
  if (isLoading) {
    return (
      <div className="grid w-full max-w-2xl grid-cols-2 gap-x-8 gap-y-16">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            className="h-[200px] animate-pulse bg-gray-200"
            key={`skeleton-${
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              i
            }`}
          />
        ))}
      </div>
    );
  }

  console.log("response:", response);
  const products = response.data?.items || [];

  return (
    <div className="flex h-full w-full items-center justify-center bg-white object-cover">
      <div className="grid h-full w-full max-w-2xl grid-cols-2 gap-x-8 gap-y-16">
        {products.slice(0, 4).map((product) => {
          // 获取第一张图片ID
          const firstImageId = product?.imageUrl;

          return (
            <div
              className="flex transform cursor-pointer flex-col items-center transition-transform duration-700 hover:scale-105"
              key={product.id}
              onClick={() => handleProductClick(product.id)}
            >
              <div className="relative mb-6 aspect-[4/3] w-full overflow-hidden">
                <ProductImage
                  alt={product.name || "Product"}
                  imageUrl={firstImageId}
                />
              </div>
              <div className="text-center">
                <h3 className="mb-1 font-serif text-black text-lg italic md:text-xl">
                  {product.name}
                </h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Shop;
