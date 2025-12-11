"use client";

import { useParams } from "next/navigation";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import ProductDetail from "@/components/product/ProductDetail";
import { useProductQuery } from "@/hooks/product-hook";

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const { id } = useParams();
  const { data, isLoading, error } = useProductQuery(id);

  // 调试信息
  console.log("Error:", error);
  console.log("Data:", data);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
            <p className="text-gray-500">Loading product...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !data?.data) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <h1 className="mb-4 font-serif text-4xl italic">
              Product not found
            </h1>
            <p className="text-gray-500">
              The product you're looking for doesn't exist.
            </p>
            {error && (
              <div className="mt-4 text-red-500 text-sm">
                <p>
                  错误信息:{" "}
                  {error instanceof Error ? error.message : String(error)}
                </p>
              </div>
            )}
            <div className="mt-4 text-gray-400 text-sm">
              <p>Product ID: {id}</p>
              <p>Data: {JSON.stringify(data)}</p>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <ProductDetail product={data.data} />
      <Footer />
    </main>
  );
}
