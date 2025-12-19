import { Elysia } from "elysia";
import { httpProblemJsonPlugin } from "elysia-http-problem-json";
import { validateEmailConfig } from "./modules/email/startup-check";
import { adsRoute } from "./modules/ads";
import { categoryRoute } from "./modules/category";
import { heroCardsRoute } from "./modules/hero-cards";
import { inquiryRoute } from "./modules/inquiry";
import { mediaRoute } from "./modules/meida";
import { productRoute } from "./modules/product";
import { dbPlugin } from "./db/connection";
import * as controllers from "./controllers";

/**
 * 在模块加载时验证邮件配置
 * 这是应用启动时的初始化检查
 */
let emailCheckPromise: Promise<void> | null = null;

// 使用立即执行的异步函数来避免阻塞模块加载
(() => {
  try {
    // 延迟执行，避免阻塞应用启动
    emailCheckPromise = new Promise((resolve) => {
      setTimeout(async () => {
        await validateEmailConfig();
        resolve();
      }, 1000); // 延迟1秒执行
    });
  } catch (error) {
    console.error("邮件配置验证初始化失败:", error);
  }
})();

/**
 * Main API router
 * Combines all routes under the '/api' prefix
 */
export const server = new Elysia({ name: "server" })
  .decorate("myProperty", "myValue")
  .state({
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  })
  .use(dbPlugin)
  .use(httpProblemJsonPlugin())
  // 自动挂载所有生成的控制器
  .group("/v1", (app) => {
    Object.values(controllers).forEach(controller => app.use(controller));
    return app;
  })
  // 使用现有的模块路由
  .use(categoryRoute)
  .use(productRoute)
  .use(adsRoute)
  .use(heroCardsRoute)
  .use(mediaRoute)
  .use(inquiryRoute);

/**
 * Export the app type for use with RPC clients (e.g., edenTreaty)
 */
export type App = typeof server;