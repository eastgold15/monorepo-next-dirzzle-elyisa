import { fromTypes, openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { appRouter } from "./controllers/app-router";
import { db, dbPlugin } from "./db/connection";
import { validateEmailConfig } from "./lib/email/startup-check";
import { loggerPlugin } from "./middleware/logger";
import { siteMiddleware } from "./middleware/site";
import { checkDatabase } from "./modules/_health/checkers/db";
import { errorSuite } from "./utils/err/errorSuite.plugin";

validateEmailConfig();
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
  .use(dbPlugin)
  .onStart(async () => {
    console.log("🚀 正在执行系统自检...");
    const dbStatus = await checkDatabase(db);

    if (dbStatus.status === "FAIL") {
      console.error("❌ 数据库自检失败!");
      console.error(`原因: ${dbStatus.message}`);
      console.error(`建议: ${dbStatus.suggestion}`);
      // 开发环境下可以不退出，但给予醒目提示
    } else {
      console.log("✅ 数据库连接正常");
    }
  })
  .decorate("myProperty", "myValue")
  .state({
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
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
        process.env.NODE_ENV === "production"
          ? "dist/index.d.ts"
          : "server/server.ts",
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
  .use(errorSuite)
  // 4. 站点中间件
  .use(siteMiddleware)
  // 自动挂载所有控制器（包括自定义和生成的）
  .group("/v1", (app) => app.use(appRouter));

/**
 * Export the app type for use with RPC clients (e.g., edenTreaty)
 */
export type App = typeof server;
