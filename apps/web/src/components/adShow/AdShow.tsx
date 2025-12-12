"use client";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useCurrentAdsQuery } from "@/hooks/ads-hook";
import { useCurrentMediaQuery } from "@/hooks/meida-hook";

interface AdShowProps {
  /**
   * 自定义容器样式
   */
  className?: string;
  /**
   * 是否显示加载状态
   */
  showSkeleton?: boolean;
}

/**
 * 广告图片组件 - 独立处理图片加载
 */
const AdImage: React.FC<{
  imageId: string | null | undefined;
  alt: string;
  className?: string;
}> = ({ imageId, alt, className }) => {
  // 如果没有图片 ID，使用默认图片
  const defaultImage =
    "https://images.unsplash.com/photo-1596482343834-039c394c8617?q=80&w=2070&auto=format&fit=crop";

  // 始终调用 hook 以遵循 React Hooks 规则
  // 只有当 imageId 是有效数字时才真正查询，否则使用一个不会导致网络请求的默认值
  const shouldFetch = imageId !== null && imageId !== undefined;
  const { data: mediaResponse, isLoading } = useCurrentMediaQuery(
    shouldFetch ? String(imageId) : "0" // 确保传递的是字符串类型
  );

  // 如果没有有效的 imageId，则直接返回默认图像
  if (!shouldFetch) {
    return (
      <Image
        alt={alt}
        className={className}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        src={defaultImage}
      />
    );
  }

  // 加载中显示占位符
  if (isLoading) {
    return <div className="h-full w-full animate-pulse bg-gray-300" />;
  }

  // 获取实际的图片 URL
  const imageUrl = mediaResponse?.data || defaultImage;

  return (
    <Image
      alt={alt}
      className={className}
      fill
      sizes="(max-width: 768px) 100vw, 50vw"
      src={imageUrl}
    />
  );
};

/**
 * 动态广告展示组件
 * 从后端获取最多 4 条有效广告并展示
 * 基于 BrewingModes 组件样式
 */
const AdShowComponent: React.FC<AdShowProps> = ({
  className = "",
  showSkeleton = true,
}) => {
  const { data: response, isLoading, error } = useCurrentAdsQuery();

  // 加载状态 - 显示骨架屏
  if (isLoading && showSkeleton) {
    return (
      <section className={`w-full bg-white ${className}`}>
        <div className="grid h-auto grid-cols-1 md:h-[800px] md:grid-cols-2">
          {Array.from({ length: 2 }, (key) => (
            <div
              className="relative h-[400px] animate-pulse bg-gray-200 md:h-full"
              key={`skeleton-${key}`}
            />
          ))}
        </div>
      </section>
    );
  }

  // 错误或无数据
  if (error || !response) {
    return null;
  }

  // 提取实际的广告数据
  const ads = response.data;
  console.log("ads:", ads);

  // 根据位置决定背景色和文字颜色
  const getAdStyles = (index: number) => {
    const isEven = index % 2 === 0;
    return {
      bgColor: isEven ? "bg-[#e0e0e0]" : "bg-[#4a4a4a]",
      titleColor: isEven ? "text-black" : "text-white",
      subtitleColor: isEven ? "text-black" : "text-gray-200",
      buttonBg: isEven ? "bg-gray-600" : "bg-gray-300",
      buttonText: isEven ? "text-white" : "text-black",
      buttonHover: isEven ? "hover:bg-black" : "hover:bg-white",
      overlayText: "text-white",
    };
  };

  // 渲染单个广告卡片
  const renderAdCard = (ad: (typeof ads)[0], index: number) => {
    const styles = getAdStyles(index);

    return (
      <div
        className={`group relative overflow-hidden ${styles.bgColor}`}
        key={ad.id}
      >
        {/* Header Block */}
        <div className="absolute top-0 left-0 z-20 w-full p-8 md:p-12">
          <div className="flex items-start justify-between">
            <div>
              <h3
                className={`mb-2 font-serif text-3xl md:text-4xl ${styles.titleColor}`}
              >
                {ad.title}
              </h3>
              {ad.link && (
                <p
                  className={`text-xs uppercase tracking-widest ${styles.subtitleColor}`}
                >
                  点击探索更多
                </p>
              )}
            </div>
            {ad.link && (
              <Link href={ad.link}>
                <button
                  className={`px-6 py-2 font-bold text-[10px] uppercase tracking-[0.2em] transition-colors ${styles.buttonBg} ${styles.buttonText} ${styles.buttonHover}`}
                >
                  探索
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Image */}
        <div className="relative h-[400px] md:h-full">
          <AdImage
            alt={ad.title || "Advertisement"}
            className="mt-20 h-full w-full transform object-cover transition-transform duration-1000 group-hover:scale-105 md:mt-0"
            imageId={ad.image_id}
          />
        </div>

        {/* Bottom Overlay Text */}
        {ad.link && (
          <div className="absolute bottom-12 left-12 z-20">
            <h4
              className={`font-serif text-3xl tracking-wide drop-shadow-md md:text-4xl ${styles.overlayText}`}
            >
              {ad.title}
            </h4>
            <Link href={ad.link}>
              <button className="mt-6 bg-gray-600/80 px-8 py-3 font-bold text-[10px] text-white uppercase tracking-[0.2em] backdrop-blur-sm transition-colors hover:bg-black">
                立即查看
              </button>
            </Link>
          </div>
        )}
      </div>
    );
  };

  // 只显示前 4 条广告
  const displayAds = ads.slice(0, 4);

  // 根据广告数量调整布局
  if (displayAds.length === 1) {
    return (
      <section className={`w-full bg-white ${className}`}>
        <div className="grid h-auto md:h-[800px]">
          {renderAdCard(displayAds[0], 0)}
        </div>
      </section>
    );
  }

  if (displayAds.length === 2) {
    return (
      <section className={`w-full bg-white ${className}`}>
        <div className="grid h-auto grid-cols-1 md:h-[800px] md:grid-cols-2">
          {displayAds.map((ad, index) => renderAdCard(ad, index))}
        </div>
      </section>
    );
  }

  if (displayAds.length === 3) {
    return (
      <section className={`w-full bg-white ${className}`}>
        <div className="grid h-auto grid-cols-1 md:h-[1200px] md:grid-cols-2">
          {displayAds.slice(0, 2).map((ad, index) => renderAdCard(ad, index))}
        </div>
        <div className="grid h-auto md:h-[600px]">
          {renderAdCard(displayAds[2], 2)}
        </div>
      </section>
    );
  }

  // 4 条广告：2x2 网格布局
  return (
    <section className={`w-full bg-white ${className}`}>
      <div className="grid h-auto grid-cols-1 md:h-[800px] md:grid-cols-2">
        {displayAds.slice(0, 2).map((ad, index) => renderAdCard(ad, index))}
      </div>
      <div className="grid h-auto grid-cols-1 md:h-[800px] md:grid-cols-2">
        {displayAds.slice(2, 4).map((ad, index) => renderAdCard(ad, index + 2))}
      </div>
    </section>
  );
};

export const AdShow = AdShowComponent;
