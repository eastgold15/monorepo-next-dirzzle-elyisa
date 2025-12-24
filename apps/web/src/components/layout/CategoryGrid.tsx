import type React from "react";
import type { ProductListRes } from "@/hooks/api/product-hook";
import ProductCard from "../product/productCard";

interface CategoryGridProps {
  title: string;
  productListRes: ProductListRes;
  description?: string;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({
  title,
  productListRes,
  description,
}) => {
  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      {/* Header */}
      <div className="mt-12 mb-12 px-6 text-center">
        <h1 className="mb-4 font-serif text-4xl uppercase tracking-widest md:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mx-auto max-w-2xl font-serif text-gray-500 italic">
            {description}
          </p>
        )}
      </div>

      {/* Product Grid */}
      <div className="mx-auto max-w-[1600px] px-6">
        {productListRes.items.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-16 md:grid-cols-3 lg:grid-cols-4">
            {productListRes.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
            <h3 className="mb-2 font-serif text-2xl italic">
              No products found
            </h3>
            <p className="text-gray-500 text-sm">
              This collection is currently being curated.
            </p>
          </div>
        )}

        {/* Load More (Visual) */}
        {productListRes.items.length > 0 && (
          <div className="mt-20 flex justify-center">
            <button className="border-black border-b pb-1 font-bold text-xs uppercase tracking-[0.2em] transition-colors hover:border-gray-500 hover:text-gray-500">
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryGrid;
