/**
 * 查询类型定义 - 参数分离与组合
 *
 * 设计理念：
 * 1. 契约层组合：BusinessQuery + PaginationParams + SortParams = CompleteQuery
 * 2. 前端分离：组件内部可以方便地将完整查询拆分为各部分使用
 * 3. 类型安全：全程 TypeScript 类型推导，零运行时错误
 */

import { t } from "elysia";

// ==================== 基础系统参数 ====================

// 1. 排序参数（通用，可复用）
export const SortParams = t.Object({
  sort: t.Optional(t.String()),
  sortOrder: t.UnionEnum(["asc", "desc"]),
});

// 2. 分页参数（仅用于分页场景）
export const PaginationParams = t.Object({
  page: t.Number({ default: 1 }),
  limit: t.Number({ minimum: 1, maximum: 1000, default: 10 }),
});

// 3. 基础查询参数（搜索、字段选择等）
export const BaseQueryParams = t.Object({
  search: t.Optional(t.String()),
  fields: t.Optional(t.String()),
});

// ==================== 类型工具函数 ====================

// ==================== 运行时工具函数 ====================
