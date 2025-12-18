import type { TypeCompiler } from "@sinclair/typebox/compiler";
import type { Static, TSchema } from "@sinclair/typebox/type";

export declare class EdenFetchError<
  Status extends number = number,
  Value = unknown,
> extends Error {
  status: Status;
  value: Value;
  constructor(status: Status, value: Value);
}

/**
 * Helper to handle Eden.js API responses for use with TanStack Query.
 * Takes an Eden response object and either:
 * - Returns the data if successful
 * - Throws the error if unsuccessful
 *
 * @param response The Eden response object containing data or error
 * @returns The response data of type T
 * @throws EdenFetchError if the response contains an error
 */
// export function handleEden<T, E = unknown>(
//   response: (
//     | {
//         data: T;
//         error: null;
//       }
//     | {
//         data: null;
//         error: EdenFetchError<number, E>;
//       }
//   ) & {
//     status: number;
//     response: Record<number, unknown>;
//     headers: Record<string, string>;
//   }
// ): T {
//   if (response.error) throw response.error;
//   return response.data;
// }

/**
 * 专门处理 Elysia Eden RPC 返回结果的工具函数
 */
export async function handleEden<T, E>(
  promise: Promise<{ data: T; error: E }>
): Promise<NonNullable<T>> {
  const { data, error } = await promise;

  if (error) {
    // 1. 打印原始错误方便开发调试
    console.error("[RPC Error]:", error);

    // 2. 按照你提供的结构深度提取 message
    // 这里的 error 类型对应你给出的 { status, value }
    const val = (error as any).value;
    const errorMessage =
      val?.message ||        // 对应 403 和 422 的 message
      val?.summary ||        // 对应 422 可能存在的 summary
      (error as any).status || // 兜底显示状态码
      "请求失败";

    // 3. 抛出统一的 Error 对象，供外部 try-catch 或全局错误处理捕获
    throw new Error(errorMessage);
  }

  if (data === null || data === undefined) {
    throw new Error("返回数据为空");
  }
  // 4. 只有成功且 data 存在时才返回
  return data as NonNullable<T>;
}



/**
 * Safe parsing utility for TypeBox schemas that returns a discriminated union result
 * rather than throwing errors. Similar to Zod's safeParse pattern.
 *
 * @param checker A compiled TypeBox schema checker
 * @param value The value to validate
 * @returns An object with either:
 * - {success: true, data: validatedValue} if validation succeeds
 * - {success: false, errors: [{message: string}]} if validation fails
 */
export function safeParse<T extends TSchema>(
  checker: ReturnType<typeof TypeCompiler.Compile<T>>,
  value: Partial<Static<T>>
):
  | { success: true; data: Static<T> }
  | { success: false; errors: { message: string }[] } {
  const isValid = checker.Check(value);

  if (isValid) {
    return {
      success: true,
      data: value as Static<T>,
    };
  }

  return {
    success: false,
    errors: Array.from(checker.Errors(value)).map((error) => ({
      message: error.message,
    })),
  };
}
