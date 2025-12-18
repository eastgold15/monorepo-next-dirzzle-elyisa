import { cors } from "@elysiajs/cors";

import { Elysia } from "elysia";
import { httpProblemJsonPlugin } from "elysia-http-problem-json";
import { adminAuthPlugin } from "~/plugins/admin-auth.plugin";
import { localeMiddleware } from "~/plugins/locale";
import { loggerPlugin } from "~/plugins/logger";
import { errorPlugin } from "~/utils/err/err.plugin";
import { dbPlugin } from "./db/connection";
import { auth } from "./lib/auth";

import { AdsController } from "./modules/advertisement/advertisement";
import { factoryRoute } from "./modules/factory/factory";
import { HeroCardsController } from "./modules/hero-cards/hero-cards";
import { masterCategoryRoute } from "./modules/master-category/master-category";
import { mediaRoute } from "./modules/media/media";
import { attributeRoute } from "./modules/product/attribute";
import { attributeValueRoute } from "./modules/product/attribute-value";
import { productRoute } from "./modules/product/product";
import { templateRoute } from "./modules/product/template";
import { siteRoute } from "./modules/site/site";
import { siteProductsRoute } from "./modules/site/site-products";
import { siteCategoryRoute } from "./modules/site/siteCategory";
import { userRoute } from "./modules/user/user";
import { userManagementController } from "./modules/user/user-management";

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
  .use(adminAuthPlugin)


  // 1. 日志插件 (注入 ctx.log 和自动记录 HTTP 响应)
  .use(loggerPlugin)
  // 2. 核心错误处理插件 (拦截所有错误，进行转换和手动日志记录)
  .use(errorPlugin)
  // 3. Problem JSON 插件 (将最终的 HttpError 转换为 RFC 7807 响应)
  .use(httpProblemJsonPlugin())
  .use(dbPlugin)
  .use(mediaRoute) // 新的统一媒体控制器，替代upload和image控制器
  // .use(categoriesController)
  .use(AdsController)
  .use(HeroCardsController) // 添加首页展示卡片控制器
  // .use(siteConfigsController)
  // .use(product2Route)
  // .use(productTemplateRoute)
  // .use(skuRoute)
  // .use(translateRoute)
  .use(masterCategoryRoute)
  .use(siteRoute)
  .use(siteCategoryRoute)
  .use(productRoute)
  .use(userRoute)
  .use(userManagementController)
  .use(factoryRoute)
  // .use(product)
  // .use(sku)
  // .use(productMedia)
  .use(siteProductsRoute)
  .use(attributeRoute)
  .use(attributeValueRoute)
  .use(templateRoute);
