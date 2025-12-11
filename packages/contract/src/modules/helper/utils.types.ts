// 通用工具类型定义

// 查询选项
export type QueryOptions = {
  filters?: QueryFilter[];
  sort?: SortOption[];
};

export type TreeNodeRaw = {
  id: string | number;
  parentId?: string | number | null;
  [key: string]: any; // 其它业务字段
};

export type TreeNode<T = any> = T & {
  children?: TreeNode<T>[];
};

// 查询过滤器 - 用于构建数据库查询的过滤条件
export type QueryFilter = {
  field: string; // 要过滤的字段名
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "like" | "in" | "nin"; // 操作符：等于、不等于、大于、大于等于、小于、小于等于、模糊匹配、在数组内、不在数组内
  value: any; // 过滤值
};

// 排序选项 - 用于指定查询结果的排序方式
export type SortOption = {
  field: string; // 要排序的字段名
  direction: "asc" | "desc"; // 排序方向：升序或降序
};

// 创建选项
export type CreateOptions = {
  validate?: boolean;
  transaction?: any;
};

// 更新选项
export type UpdateOptions = {
  validate?: boolean;
  transaction?: any;
};

// 删除选项
export type DeleteOptions = {
  transaction?: any;
  force?: boolean;
};

// 查询构建器选项
export type QueryBuilderOptions = {
  table: string;
  selects?: string[];
  joins?: Array<{
    table: string;
    on: string;
    type: "left" | "right" | "inner";
  }>;
  where?: Record<string, any>;
  orderBy?: Array<{
    column: string;
    direction: "asc" | "desc";
  }>;
  groupBy?: string[];
  having?: Record<string, any>;
};

// 事务选项
export type TransactionOptions = {
  isolationLevel?:
    | "read_uncommitted"
    | "read_committed"
    | "repeatable_read"
    | "serializable";
  timeout?: number;
};

// 批量操作选项
export type BatchOptions = {
  batchSize?: number;
  delay?: number;
  retryCount?: number;
  onError?: "continue" | "stop";
};

// 缓存选项
export type CacheOptions = {
  key: string;
  ttl?: number;
  tags?: string[];
};
