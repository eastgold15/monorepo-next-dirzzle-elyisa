// API 工具函数

/**
 * 创建查询键
 */
export function createQueryKey(resource: string, params?: Record<string, any>) {
  return params ? [resource, params] : [resource];
}

/**
 * 创建带参数的查询键
 */
export function createQueryKeyWithPagination(
  resource: string,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    [key: string]: any;
  }
) {
  const { page = 1, limit = 20, search = "", ...otherParams } = params || {};

  return [
    resource,
    {
      page,
      limit,
      search: search.trim(),
      ...otherParams,
    },
  ];
}

/**
 * 格式化 API 错误
 */
export function formatApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "未知错误";
}

/**
 * 检查是否为网络错误
 */
export function isNetworkError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes("fetch") ||
      error.message.includes("Network") ||
      error.message.includes("ECONNREFUSED"))
  );
}

/**
 * 重试配置
 */
export const retryConfig = {
  retry: (failureCount: number, error: unknown) => {
    // 网络错误重试，最多3次
    if (isNetworkError(error) && failureCount < 3) {
      return true;
    }

    // 4xx 错误不重试
    if (error instanceof Error && error.message.includes("400")) {
      return false;
    }

    return false;
  },
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30_000),
};
// 通用提取工具
export type MyInferQuery<T> = T extends (args: { query: infer Q }) => any
  ? Q
  : any;
