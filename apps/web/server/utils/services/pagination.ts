import { and, asc, desc, type SQL } from "drizzle-orm";
import type { PgSelectQueryBuilder } from "drizzle-orm/pg-core";
import { db } from "@/server/db/connection";
import type { PaginationOptionsType } from "../Res";
import { QueryScopeEnum } from "../soft-delete/types";
import { createSoftDeleteCondition } from "../soft-delete/utils";

/**
 * 执行分页查询（使用 $count() 方法的优化版本）
 * @param QueryBuild 数据查询构建器（必须是 .$dynamic() 模式）
 * @param options 分页选项
 * @returns 分页结果
 */
export async function paginate<QB extends PgSelectQueryBuilder, T>(
  QueryBuild: QB, // 动态查询构建器
  options: PaginationOptionsType
) {
  const {
    page = 1,
    limit = 100,
    orderBy,
    orderDirection = "asc",
    scope = QueryScopeEnum.ACTIVE,
    table,
  } = options;

  // 计算偏移量
  const offset = calculateOffset(page, limit);

  // 构建查询条件数组
  const conditions: (SQL | undefined)[] = [];

  // 添加软删除条件（如果提供了 table）
  if (table && "deletedAt" in table) {
    const softDeleteCondition = createSoftDeleteCondition(table, scope);
    if (softDeleteCondition) {
      conditions.push(softDeleteCondition);
    }
  }

  // 合并所有条件
  const whereCondition =
    conditions.length > 0 ? and(...conditions.filter(Boolean)) : undefined;

  // 🔧 修复：确保在动态模式下构建查询
  let baseQuery = QueryBuild;
  if (whereCondition) {
    baseQuery = baseQuery.where(whereCondition);
  }

  // 🔧 修复：构建数据查询（包含分页和排序）
  let dataQueryWithPagination = baseQuery.limit(limit).offset(offset);
  if (orderBy) {
    dataQueryWithPagination =
      orderDirection === "desc"
        ? dataQueryWithPagination.orderBy(desc(orderBy))
        : dataQueryWithPagination.orderBy(asc(orderBy));
  }

  // 并行执行数据查询和计数查询
  const [items, total] = await Promise.all([
    dataQueryWithPagination,
    db.$count(baseQuery),
  ]);
  return {
    items,
    total,
  };
}

/**
 * 计算分页偏移量
 * @param page 页码
 * @param limit 每页大小
 * @returns 偏移量
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * 计算总页数
 * @param total 总记录数
 * @param limit 每页大小
 * @returns 总页数
 */
export function calculateTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit);
}

/**
 * 构建分页元数据
 * @param total 总记录数
 * @param page 当前页码
 * @param limit 每页大小
 * @returns 分页元数据
 */
export function buildPageMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: calculateTotalPages(total, limit),
  };
}
