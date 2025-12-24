"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCurrentAdsQuery } from "@/hooks/api/ads-hook";
import { cn } from "@/lib/utils";
import IDImage from "../common/IDImage";
import { Skeleton } from "../ui/skeleton";

const Ad: React.FC = () => {
  const router = useRouter();
  // 拿到的是处理好的纯数组，不需要再判断 .data
  const { data: ads, isLoading } = useCurrentAdsQuery();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false); // 新增：鼠标悬停暂停

  // 自动轮播逻辑
  useEffect(() => {
    if (!ads || ads.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [ads, isPaused]);

  // 加载中显示大骨架屏
  if (isLoading) {
    return (
      <section className="relative mt-[104px] w-full overflow-hidden md:mt-[136px]">
        <Skeleton className="h-[60vh] w-full md:h-[85vh]" variant="rectangle" />
      </section>
    );
  }

  if (!ads || ads.length === 0) return null;

  const handleClick = (link?: string) => {
    if (link) router.push(link);
  };

  return (
    <section
      className="relative mt-[104px] w-full overflow-hidden md:mt-[136px]"
      onMouseEnter={() => setIsPaused(true)} // 悬停暂停
      onMouseLeave={() => setIsPaused(false)} // 移开恢复
    >
      <div className="relative h-[60vh] w-full md:h-[85vh]">
        {/* 核心优化：渲染所有 Slide，通过 opacity 切换 */}
        {ads.map((ad, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              className={cn(
                "absolute inset-0 h-full w-full cursor-pointer transition-opacity duration-1000 ease-in-out",
                isActive
                  ? "z-10 opacity-100"
                  : "pointer-events-none z-0 opacity-0"
              )}
              key={ad.id}
              onClick={() => handleClick(ad.link)}
            >
              <IDImage
                alt={ad.title || "Advertisement"}
                className="h-full w-full object-cover object-center md:object-[center_30%]" // 确保这里字段名对应 Hook 里的定义
                imageId={ad.mediaId}
                // 优化：只有第一张图需要 priority (LCP优化)，其他懒加载
                priority={index === 0}
              />
            </div>
          );
        })}

        {/* 指示器 (Dots) */}
        {ads.length > 1 && (
          <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-3">
            {ads.map((_, index) => (
              <button
                aria-label={`Go to slide ${index + 1}`}
                className={cn(
                  "h-1.5 rounded-full shadow-sm transition-all duration-300",
                  index === currentIndex
                    ? "w-8 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/80"
                )}
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
