import { Elysia } from "elysia";
import { httpProblemJsonPlugin } from "elysia-http-problem-json";
import { env } from "@/env";
import * as controllers from "./controllers/index";
import { dbPlugin } from "./db/connection";
import { siteMiddleware } from "./middleware/site";
import { loggerPlugin } from "./middleware/logger";
import { errorPlugin } from "./utils/err/err.plugin";
import { openapi, fromTypes } from "@elysiajs/openapi";

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
export const server = new Elysia({ name: "server", prefix: "/api" })
  .decorate("myProperty", "myValue")
  .state({
    version: "1.0.0",
    environment: env.NODE_ENV || "development",
  })
  .use(
    openapi({
      documentation: {
        info: {
          title: "Gina Shopping API",
          version: "1.0.71",
          description: "基于 Elysia + Drizzle + TypeScript 的电商 API",
        },
        tags: [],
      },
      references: fromTypes(
        env.NODE_ENV === "production" ? "dist/index.d.ts" : "server/server.ts",
        {
          // 关键：指定项目根目录，以便编译器能找到 tsconfig.json 和其他文件
          // 这里使用 import.meta.dir (Bun) 或 process.cwd()
          projectRoot: process.cwd(),
          // 如果你的 tsconfig 在根目录
          tsconfigPath: "tsconfig.json",
          debug: process.env.NODE_ENV !== "production",
        }
      ),
    })
  )
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
    Object.values(controllers).forEach((controller) => {
      // console.log('controller:', controller)
      return app.use(controller)
    });
    return app;
  })


console.log("env.NODE_ENV", env.NODE_ENV);
/**
 * Export the app type for use with RPC clients (e.g., edenTreaty)
 */
export type App = typeof server;
