/**
 * TypeBox 查询类型定义 - 参数分离与组合
 *
 * 设计理念：
 * 1. 契约层组合：BusinessQuery + PaginationParams + SortParams = CompleteQuery
 * 2. 前端分离：组件内部可以方便地将完整查询拆分为各部分使用
 * 3. 类型安全：全程 TypeScript 类型推导，零运行时错误
 * 4. TypeBox 集成：与 Elysia 框架完全兼容的验证系统
 */

import type { Static } from "@sinclair/typebox";
import { t } from "elysia";

// ==================== 基础系统参数 ====================

// 1. 排序参数（通用，可复用）
export const SortParams = t.Object({
  sort: t.Optional(t.String()),
  sortOrder: t.Optional(t.UnionEnum(["asc", "desc"])),
});
export type SortParams = Static<typeof SortParams>;

// 2. 分页参数（仅用于分页场景）
export const PaginationParams = t.Object({
  page: t.Partial(t.Number()),
  limit: t.Partial(t.Number()),
});
export type PaginationParams = Static<typeof PaginationParams>;

// 3. 基础查询参数（搜索、字段选择等）
export const BaseQueryParams = t.Object({
  search: t.Optional(t.String()),
  fields: t.Optional(t.String()),
});
export type BaseQueryParams = Static<typeof BaseQueryParams>;

// ==================== 类型工具函数 ====================

// 提取业务查询参数的类型（排除系统参数）
export type ExtractBusinessQuery<T> = Omit<
  T,
  keyof PaginationParams | keyof SortParams | keyof BaseQueryParams
>;

// 提取分页参数的类型
export type ExtractPaginationParams<T> = Pick<
  T,
  keyof T & keyof PaginationParams
>;

// 提取排序参数的类型
export type ExtractSortParams<T> = Pick<T, keyof T & keyof SortParams>;

// 提取基础查询参数的类型
export type ExtractBaseQueryParams<T> = Pick<
  T,
  keyof T & keyof BaseQueryParams
>;

// ==================== 运行时工具函数 ====================

/**
 * 将完整的查询对象拆分为各个部分
 * @param query 完整的查询对象
 * @returns 拆分后的各部分对象
 */
export function splitListQuery<T extends Record<string, any>>(query: T) {
  // 提取分页参数
  const pagination = PaginationParams.parse(query);

  // 提取排序参数
  const sort = SortParams.parse(query);

  // 其余的作为业务查询参数
  const {
    page: _page,
    limit: _limit,
    sort: _sort,
    sortOrder: _sortOrder,
    ...business
  } = query;

  return {
    business: business as ExtractBusinessQuery<T>,
    pagination: pagination as PaginationParams,
    sort: sort as SortParams,
  };
}

export function splitListQueryNoPage<T extends Record<string, any>>(query: T) {
  // 提取排序参数
  const sort = SortParams.parse(query);

  // 其余的作为业务查询参数
  const { sort: _sort, sortOrder: _sortOrder, ...business } = query;

  return {
    business: business as ExtractBusinessQuery<T>,
    sort: sort as SortParams,
  };
}
