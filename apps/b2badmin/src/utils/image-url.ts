// 处理图片 URL 的工具函数

/**
 * 将完整的图片 URL 转换为适合 Next.js Image 组件使用的格式
 * @param url 原始 URL
 * @returns 处理后的 URL
 */
export function normalizeImageUrl(url: string): string {
  if (!url) return url;

  // 如果是 localhost:9010 的 URL，转换为相对路径
  if (url.includes("localhost:9010")) {
    const urlObj = new URL(url);
    return urlObj.pathname + urlObj.search;
  }

  // 如果是其他外部域名，直接返回
  return url;
}

/**
 * 获取图片的优化 URL
 * @param url 原始 URL
 * @param options 选项
 * @returns 优化后的 URL
 */
export function getOptimizedImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {}
): string {
  const normalizedUrl = normalizeImageUrl(url);

  // 如果是本地图片且需要优化参数
  if (normalizedUrl.startsWith("/")) {
    const params = new URLSearchParams();

    if (options.width) params.set("w", options.width.toString());
    if (options.height) params.set("h", options.height.toString());
    if (options.quality) params.set("q", options.quality.toString());

    const paramString = params.toString();
    return paramString ? `${normalizedUrl}?${paramString}` : normalizedUrl;
  }

  return normalizedUrl;
}
