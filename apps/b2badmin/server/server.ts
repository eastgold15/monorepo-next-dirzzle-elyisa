import { cors } from "@elysiajs/cors";

import { Elysia } from "elysia";

import { localeMiddleware } from "~/middleware/locale";
import { loggerPlugin } from "~/middleware/logger";

import { appRouter } from "./controllers/app-router";
import { dbPlugin } from "./db/connection";
import { auth } from "./lib/auth";
import { authGuardMid } from "./middleware/auth";
import { errorSuite } from "./utils/err/errorSuite.plugin";

/**
 * Main API router
 * Combines auth and user routes under the '/api' prefix
 */
export const server = new Elysia({ name: "server" })
  .decorate("myProperty", "myValue")
  .use(localeMiddleware) // 在全局级别添加语言中间件
  .state({
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  })
  .use(
    cors({
      origin: [
        "http://localhost:9012", // 前端开发服务器
        "http://localhost:9013", // Vite 默认端口
        "http://localhost:4000",
      ],
      credentials: true,
    })
  )
  .mount("/", auth.handler) // 使用 Better Auth 认证中间件
  .use(authGuardMid)
  .group("/v1", (app) => app.use(appRouter))

  // 1. 日志插件 (注入 ctx.log 和自动记录 HTTP 响应)
  .use(loggerPlugin)
  // 2. 核心错误处理插件 (拦截所有错误，进行转换和手动日志记录)
  .use(errorSuite)
  .use(dbPlugin);
// .use(mediaRoute) // 新的统一媒体控制器，替代upload和image控制器
// .use(categoriesController)
// .use(AdsController)
// .use(HeroCardsController) // 添加首页展示卡片控制器
// .use(siteConfigsController)
// .use(product2Route)
// .use(productTemplateRoute)
// .use(skuRoute)
// .use(translateRoute)
// .use(masterCategoryRoute)
// .use(siteRoute)
// .use(siteCategoryRoute)
// .use(productRoute)
// .use(userRoute)
// .use(userManagementController)
// .use(factoryRoute)
// .use(product)
// .use(sku)
// .use(productMedia)
// .use(siteProductsRoute)
// .use(attributeRoute)
// .use(attributeValueRoute)
// .use(templateRoute);
