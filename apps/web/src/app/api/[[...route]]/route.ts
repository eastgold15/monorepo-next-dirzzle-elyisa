import { Elysia } from "elysia";
import { httpProblemJsonPlugin } from "elysia-http-problem-json";
import { adsRoute } from "@/server/modules/ads";
import { categoryRoute } from "@/server/modules/category";
import { validateEmailConfig } from "@/server/modules/email/startup-check";
import { heroCardsRoute } from "@/server/modules/hero-cards";
import { inquiryRoute } from "@/server/modules/inquiry";
import { mediaRoute } from "@/server/modules/meida";
import { productRoute } from "@/server/modules/product";

export const dynamic = "force-dynamic";

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
 * Combines auth and user routes under the '/api' prefix
 */
const app = new Elysia({ prefix: "/api" })

  .use(httpProblemJsonPlugin())
  .use(categoryRoute)
  .use(productRoute)
  .use(adsRoute)
  .use(heroCardsRoute)
  .use(mediaRoute)
  .use(inquiryRoute);
/**
 * Export the app type for use with RPC clients (e.g., edenTreaty)
 */
export type App = typeof app;

/**
 * Export handlers for different HTTP methods
 * These are used by Next.js API routes [[...route]].ts
 */
export const GET = app.handle;
export const POST = app.handle;
export const PUT = app.handle;
export const DELETE = app.handle;
export const PATCH = app.handle;
