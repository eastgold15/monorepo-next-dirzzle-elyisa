// ===== 重载签名 =====

/**
 * 模式 1：不传 mapping → 返回剔除 null/undefined 的原对象子集
 */
export function pickNonNullable<T extends Record<string, any>>(
  obj: T
): { [K in keyof T as T[K] extends null | undefined ? never : K]: T[K] };

/**
 * 模式 2：传 mapping → 只取 mapping 中的字段，重命名，并剔除 null/undefined
 */
export function pickNonNullable<
  T extends Record<string, any>,
  M extends Partial<Record<keyof T, string>>,
>(
  obj: T,
  mapping: M
): {
  [K in keyof M as M[K] extends string
    ? T[Extract<keyof T, K>] extends null | undefined
      ? never
      : M[K]
    : never]: T[Extract<keyof T, K>];
};

// ===== 实现 =====
export function pickNonNullable<
  T extends Record<string, any>,
  M extends Partial<Record<keyof T, string>>,
>(obj: T, mapping?: M): Record<string, any> {
  const result: Record<string, any> = {};

  if (mapping) {
    // 模式 2：只处理 mapping 中的字段
    for (const sourceKey in mapping) {
      if (Object.hasOwn(obj, sourceKey) && obj[sourceKey] !== null) {
        const targetKey = mapping[sourceKey];
        if (targetKey) {
          result[targetKey] = obj[sourceKey]; // ✅ 安全访问且类型正确
        }
      }
    }
  } else {
    // 模式 1：处理所有字段
    for (const key in obj) {
      if (obj[key] !== null) {
        result[key] = obj[key];
      }
    }
  }

  return result;
}
