"use client";
import { useEffect, useState } from "react";
import Ad from "@/components/gina/Ad";
import SubscribeModal from "@/components/gina/SubscribeModal";
import { HeroShow } from "@/components/heroShow";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/Navbar/Navbar";

const page: React.FC = () => {
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen bg-white font-sans text-black selection:bg-black selection:text-white">
      <Navbar />

      <main>
        <Ad />
        {/* HeroShow: Shop + 3个 Hero Cards */}
        <HeroShow />
      </main>

      <Footer />

      {isMounted && (
        <button
          className="fixed bottom-8 left-8 z-40 hidden items-center border border-black bg-white px-6 py-4 text-black shadow-xl transition-all duration-300 hover:bg-black hover:text-white md:flex"
          onClick={() => setIsSubscribeOpen(true)}
        >
          <span className="font-bold text-xs uppercase tracking-widest">
            Subscribe
          </span>
        </button>
      )}

      {isMounted && (
        <SubscribeModal
          isOpen={isSubscribeOpen}
          onClose={() => setIsSubscribeOpen(false)}
        />
      )}
    </div>
  );
};
export default page;
