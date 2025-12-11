import Image from "next/image";
import { useCurrentMediaQuery } from "@/hooks/meida-hook";

/**
 * 广告图片组件 - 独立处理图片加载
 */
const IDImage: React.FC<{
  imageId: string | null | undefined;
  alt: string;
  className?: string;
}> = ({ imageId, alt, className }) => {
  const defaultImage =
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2012&auto=format&fit=crop";

  // 将 hook 调用移到顶层，避免条件性调用
  const { data: mediaResponse, isLoading } = useCurrentMediaQuery(
    imageId ?? null
  );

  if (!imageId) {
    return (
      <Image
        alt={alt}
        className={
          className ??
          "absolute inset-0 h-full w-full object-cover object-center md:object-[center_30%]"
        }
        fill
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
        src={defaultImage}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="absolute inset-0 h-full w-full animate-pulse bg-gray-300" />
    );
  }

  const imageUrl = mediaResponse?.data || defaultImage;

  return (
    <Image
      alt={alt}
      className={
        className ??
        "absolute inset-0 h-full w-full object-cover object-center md:object-[center_30%]"
      }
      fill
      priority
      sizes="(max-width: 768px) 100vw, 50vw"
      src={imageUrl}
    />
  );
};

export default IDImage;
