import { Elysia } from "elysia";
import { httpProblemJsonPlugin } from "elysia-http-problem-json";
import { env } from "@/env";
import * as controllers from "./controllers";
import { dbPlugin } from "./db/connection";
import { siteMiddleware } from "./middleware/site";
import { loggerPlugin } from "./plugins/logger";
import { errorPlugin } from "./utils/err/err.plugin";

/**
 * Main API router
 * Combines all routes under the '/api' prefix
 *
 * Plugin 加载顺序很重要：
 * 1. loggerPlugin - 先记录请求信息
 * 2. errorPlugin - 拦截和转换错误
 * 3. httpProblemJsonPlugin - 格式化最终错误响应
 * 4. dbPlugin - 提供数据库连接
 */
export const server = new Elysia({ name: "server" })
  .decorate("myProperty", "myValue")
  .state({
    version: "1.0.0",
    environment: env.NODE_ENV || "development",
  })
  // 1. 日志插件 - 记录所有请求
  .use(loggerPlugin)
  // 2. 错误处理插件 - 统一错误处理
  .use(errorPlugin)
  // 3. Problem JSON 插件 - 标准化错误响应
  .use(httpProblemJsonPlugin())
  // 4. 数据库插件
  .use(dbPlugin)
  // 5. 站点中间件
  .use(siteMiddleware)
  // 自动挂载所有控制器（包括自定义和生成的）
  .group("/v1", (app) => {
    Object.values(controllers).forEach((controller) => app.use(controller));
    return app;
  });


console.log("env.NODE_ENV", env.NODE_ENV);
/**
 * Export the app type for use with RPC clients (e.g., edenTreaty)
 */
export type App = typeof server;
