"use client";
import Link from "next/link";
import type React from "react";
import { useCurrentHeroCardsQuery } from "@/hooks/hero-cards-hook";
// 假设 IDImage 和 Shop 组件已经被导入
import IDImage from "../common/IDImage";
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
    <div className="relative h-[500px] w-full overflow-hidden md:h-[600px]">
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
  const { data: response, isLoading, error } = useCurrentHeroCardsQuery();

  // 加载状态
  if (isLoading) {
    return (
      <section className="w-full bg-white py-12">
        <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              className="h-[500px] animate-pulse bg-gray-200"
              key={`skeleton-${
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                i
              }`}
            />
          ))}
        </div>
      </section>
    );
  }

  // 错误或无数据
  if (error || !response?.data) {
    return null;
  }

  const heroCards = response.data.slice(0, 3);

  //   const getCardStyles = (index: number) => {
  //     const isEven = index % 2 === 1;
  //     return {
  //       bgColor: isEven ? "bg-[#e0e0e0]" : "bg-[#4a4a4a]",
  //       titleColor: isEven ? "text-black" : "text-white",
  //       subtitleColor: isEven ? "text-black" : "text-gray-200",
  //       buttonBg: isEven ? "bg-gray-600" : "bg-gray-300",
  //       buttonText: isEven ? "text-white" : "text-black",
  //       buttonHover: isEven ? "hover:bg-black" : "hover:bg-white",
  //     };
  //   };

  // 根据位置决定背景色和文字颜色，实现1221的颜色模式
  const getCardStyles = (index: number) => {
    const colorSets = [
      {
        bgColor: "bg-[#e0e0e0]",
        titleColor: "text-black",
        subtitleColor: "text-black",
        buttonBg: "bg-gray-600",
        buttonText: "text-white",
        buttonHover: "hover:bg-black",
      }, // 1
      {
        bgColor: "bg-[#4a4a4a]",
        titleColor: "text-white",
        subtitleColor: "text-gray-200",
        buttonBg: "bg-gray-300",
        buttonText: "text-black",
        buttonHover: "hover:bg-white",
      }, // 2
    ];
    const setIndex = index === 0 || index === 3 ? 0 : 1; // 实现1221模式
    return colorSets[setIndex];
  };

  return (
    <section className="w-full bg-white py-12">
      <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
        {/* 第一个位置：Shop 组件 */}
        <ContentBlock
          {...getCardStyles(0)}
          description="探索最新系列"
          title="新品上市"
        >
          <Shop />
        </ContentBlock>

        {/* 其他三个位置：Hero Cards */}
        {heroCards.map((card, index) => (
          <ContentBlock
            {...getCardStyles(index + 1)}
            buttonTextContent={card.buttonText || "EXPLORE"}
            buttonUrl={card.buttonUrl || ""}
            description={card.description}
            key={card.id}
            title={card.title}
          >
            <IDImage
              alt={card.title || "Hero Card"}
              className="h-full w-full transform object-cover transition-transform duration-700 group-hover:scale-105"
              imageId={card.imageId}
            />
          </ContentBlock>
        ))}
      </div>
    </section>
  );
};

export const HeroShow = HeroShowComponent;
