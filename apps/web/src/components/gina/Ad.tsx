"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCurrentAdsQuery } from "@/hooks/ads-hook";
import IDImage from "../common/IDImage";

/**
 * 广告轮播组件
 * 满屏显示，5秒自动切换
 */
const Ad: React.FC = () => {
  const router = useRouter();
  const { data: response, isLoading } = useCurrentAdsQuery();
  const [currentIndex, setCurrentIndex] = useState(0);

  // 5秒自动切换
  useEffect(() => {
    if (!response?.data || response.data.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % response.data.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [response?.data]);

  // 加载状态
  if (isLoading) {
    return (
      <section className="relative mt-[104px] w-full overflow-hidden md:mt-[136px]">
        <div className="relative h-[60vh] w-full animate-pulse bg-gray-300 md:h-[85vh]" />
      </section>
    );
  }

  // 无数据或错误
  if (!response?.data || response.data.length === 0) {
    return null;
  }

  const ads = response.data;
  const currentAd = ads[currentIndex];

  const handleClick = () => {
    if (currentAd.link) {
      router.push(currentAd.link);
    }
  };

  return (
    <section className="relative mt-[104px] w-full overflow-hidden md:mt-[136px]">
      <div
        className="relative h-[60vh] w-full cursor-pointer md:h-[85vh]"
        onClick={handleClick}
      >
        <IDImage
          alt={currentAd.title || "Advertisement"}
          imageId={currentAd.image_id}
        />

        {/* 指示器 */}
        {ads.length > 1 && (
          <div className="-translate-x-1/2 absolute bottom-8 left-1/2 z-10 flex gap-2">
            {ads.map((_, index) => (
              <button
                className={`h-2 w-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-8 bg-white"
                    : "bg-white/50 hover:bg-white/75"
                }`}
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                type="button"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Ad;
