// src/errors/guards.ts

// PostgreSQL 错误代码是 5 位字符（SQLSTATE）
const POSTGRES_ERROR_CODE_REGEX = /^[0-9A-Z]{5}$/;

/**
 * 判断是否为 PostgreSQL/Drizzle 风格的数据库错误
 */
export function isDatabaseError(
  error: unknown
): error is { code: string; detail?: string; message?: string } {
  if (
    error === null ||
    typeof error !== "object" ||
    !("code" in error) ||
    typeof (error as any).code !== "string"
  ) {
    return false;
  }

  const code = (error as any).code;

  // 使用正则表达式校验是否为标准的 PostgreSQL 错误码
  return POSTGRES_ERROR_CODE_REGEX.test(code);
}
