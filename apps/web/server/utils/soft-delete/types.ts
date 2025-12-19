// 软删除相关类型定义
import type { SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

/**
 * 查询范围枚举
 */
export const QueryScopeEnum = {
  ACTIVE: "active", // 只查询未删除的记录
  DELETED: "deleted", // 只查询已删除的记录
  ALL: "all", // 查询所有记录
} as const;
// 自动生成类型
export type QueryScopeEnum =
  (typeof QueryScopeEnum)[keyof typeof QueryScopeEnum];
/**
 * 软删除表接口
 */
export type SoftDeletableTable = {
  deletedAt: PgColumn | SQL.Aliased;
};

/**
 * 软删除选项
 */
export type SoftDeleteOptions = {
  scope?: QueryScopeEnum;
  deletedAtColumn?: string;
};
