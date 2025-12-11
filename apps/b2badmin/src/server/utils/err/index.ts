// src/errors/index.ts
// 重新导出 elysia-http-problem-json 的 HttpError 类，方便使用
export { HttpError } from "elysia-http-problem-json";

// 工具函数
export { mapDatabaseError } from "./database-error-mapper";
export { isDatabaseError } from "./guards";
