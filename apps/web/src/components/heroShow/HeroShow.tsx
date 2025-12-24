"use client";
import Link from "next/link";
import type React from "react";
import {
  type HeroCardRes,
  useCurrentHeroCardsQuery,
} from "@/hooks/api/hero-cards-hook";
import { MyImage } from "../MyImage";
import { Skeleton } from "../ui/skeleton";
import Shop from "./Shop";

interface ContentBlockProps {
  bgColor: string;
  titleColor: string;
  subtitleColor: string;
  buttonBg: string;
  buttonText: string;
  buttonHover: string;
  children: React.ReactNode;
  title?: string;
  description?: string;
  buttonUrl?: string;
  buttonTextContent?: string;
}

const ContentBlock: React.FC<ContentBlockProps> = ({
  bgColor,
  titleColor,
  subtitleColor,
  buttonBg,
  buttonText,
  buttonHover,
  children,
  title,
  description,
  buttonUrl,
  buttonTextContent,
}) => (
  <div className={`group flex flex-col overflow-hidden ${bgColor}`}>
    {/* 上部：根据传入的children渲染 */}
    <div className="relative aspect-[4/5] w-full overflow-hidden md:aspect-square">
      {children}
    </div>

    {/* 下部：文字内容 - 固定高度 */}
    {title || description || buttonUrl ? (
      <div className="flex h-[200px] flex-col justify-center p-8 md:h-[250px] md:p-12">
        <div className="mb-6">
          {title && (
            <h3
              className={`mb-2 font-serif text-2xl italic md:text-3xl ${titleColor}`}
            >
              {title}
            </h3>
          )}
          {description && (
            <p className={`text-sm tracking-wide ${subtitleColor}`}>
              {description}
            </p>
          )}
        </div>
        {buttonUrl && (
          <Link href={buttonUrl}>
            <button
              className={`px-8 py-3 font-bold text-[10px] uppercase tracking-[0.2em] transition-colors ${buttonBg} ${buttonText} ${buttonHover}`}
              type="button"
            >
              {buttonTextContent || "EXPLORE"}
            </button>
          </Link>
        )}
      </div>
    ) : null}
  </div>
);

/**
 * HeroShow 组件
 * 使用 ContentBlock 来简化结构
 */
const HeroShowComponent: React.FC = () => {
  const { data: heroCards, isLoading, error } = useCurrentHeroCardsQuery();
  // 使用封装的 Skeleton
  if (isLoading) {
    return (
      <section className="w-full bg-white py-12">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* 这里高度应该与 ContentBlock 的 [500+200]px 对应 */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="flex flex-col" key={i}>
              <Skeleton
                className="h-[500px] md:h-[600px]"
                variant="rectangle"
              />
              <div className="flex h-[200px] flex-col justify-center space-y-4 p-8 md:h-[250px]">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }
  // 错误或无数据
  if (error || !heroCards) return null;

  // 1221 颜色配置表，解耦样式逻辑
  const colorConfigs = [
    {
      bgColor: "bg-[#e0e0e0]",
      titleColor: "text-black",
      subtitleColor: "text-black",
      buttonBg: "bg-gray-600",
      buttonText: "text-white",
      buttonHover: "hover:bg-black",
    },
    {
      bgColor: "bg-[#4a4a4a]",
      titleColor: "text-white",
      subtitleColor: "text-gray-200",
      buttonBg: "bg-gray-300",
      buttonText: "text-black",
      buttonHover: "hover:bg-white",
    },
  ];

  return (
    <section className="w-full bg-white py-12">
      <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
        {/* 将所有卡片组合（Shop + HeroCards）统一处理 */}
        {[{ type: "shop" }, ...heroCards.slice(0, 3)].map((item, index) => {
          // 核心逻辑：index 0和3用配置0，1和2用配置1 (即 1-2-2-1 模式)
          const config = colorConfigs[index === 0 || index === 3 ? 0 : 1];

          if ("type" in item && item.type === "shop") {
            return (
              <ContentBlock
                key="shop-block"
                {...config}
                description="探索最新系列"
                title="新品上市"
              >
                <Shop />
              </ContentBlock>
            );
          }

          const card = item as HeroCardRes;
          return (
            <ContentBlock
              key={card.id}
              {...config}
              buttonTextContent={card.buttonText}
              buttonUrl={card.buttonUrl}
              description={card.description}
              title={card.title}
            >
              <MyImage
                alt={card.title}
                className="h-full w-full transform object-cover transition-transform duration-700 group-hover:scale-105" // 统一字段名建议：mediaId
                imageId={card.mediaId}
              />
            </ContentBlock>
          );
        })}
      </div>
    </section>
  );
};

export const HeroShow = HeroShowComponent;
