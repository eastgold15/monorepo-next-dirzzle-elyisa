import { useCallback } from "react";
import { useSiteCategoryQuery } from "@/hooks/api/site-category-hook";

/**
 * 统一的分类导航数据和处理逻辑 Hook
 * 提供分类数据、加载状态、错误处理以及通用的导航处理函数
 */
export const useCategoryNavigation = () => {
  const { data, isLoading, error } = useSiteCategoryQuery();

  const categories = data || [];
  /**
   * 滚动到页面顶部
   */
  const handleScrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /**
   * 处理分类导航
   * @param slug - 分类的 slug
   * @param id - 分类的 id
   * @param onClose - 可选的关闭回调（用于移动端菜单）
   */
  const handleNavigate = useCallback(
    (slug: string, id: string, onClose?: () => void) => {
      // 关闭移动端菜单（如果有）
      onClose?.();
      // 滚动到顶部
      handleScrollToTop();
    },
    [handleScrollToTop]
  );

  /**
   * 处理带外部回调的导航
   * @param slug - 分类的 slug
   * @param id - 分类的 id
   * @param onNavigate - 外部导航回调
   * @param onClose - 可选的关闭回调
   */
  const handleNavigateWithCallback = useCallback(
    (
      slug: string,
      id: string,
      onNavigate?: (slug: string, id: string) => void,
      onClose?: () => void
    ) => {
      // 调用外部导航回调
      onNavigate?.(slug, id);
      // 关闭移动端菜单（如果有）
      onClose?.();
      // 滚动到顶部
      handleScrollToTop();
    },
    [handleScrollToTop]
  );

  return {
    // 数据
    categories: categories || [],
    isLoading,
    error,

    // 处理函数
    handleScrollToTop,
    handleNavigate,
    handleNavigateWithCallback,
  };
};
