import { Elysia } from "elysia";
import { paginate } from "./pagination";
/**
 * ElysiaJS 分页插件
 * 提供分页相关的装饰器和工具函数
 */
export const PaginationPlugin = new Elysia({ name: "pagination-plugin" })
  .decorate("paginate", paginate)
  .as("global");
