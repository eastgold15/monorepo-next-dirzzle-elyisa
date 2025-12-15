import { cors } from "@elysiajs/cors";
import { fromTypes, openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { HttpError, httpProblemJsonPlugin } from "elysia-http-problem-json";
import { dbPlugin } from "@/server/db/connection";
import { auth } from "@/server/lib/auth";
import { OpenAPI } from "@/server/lib/auth-openapi";
import { betterAuthPlugin } from "@/server/plugins/auth.plugin";
import { localeMiddleware } from "@/server/plugins/locale";
import { loggerPlugin } from "./plugins/logger";
import { errorPlugin } from "./utils/err/err.plugin";

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
  .use(betterAuthPlugin)
  .use(
    openapi({
      documentation: {
        components: await OpenAPI.components,
        paths: await OpenAPI.getPaths(),
        info: {
          title: "Gina Shopping API",
          version: "1.0.71",
          description: "基于 Elysia + Drizzle + TypeScript 的电商后端 API",
        },
        tags: [
          { name: "Product V2", description: "商品管理 V2" },
          { name: "Categories", description: "分类管理" },
          { name: "Factory", description: "工厂管理" },
          { name: "Media", description: "媒体文件管理" }, // 新的媒体管理标签
          { name: "Partners", description: "合作伙伴管理" },
          { name: "Advertisements", description: "广告管理" },
          { name: "Hero Cards", description: "首页展示卡片管理" },
          { name: "Site Config", description: "站点配置" },
        ],
      },
      references: fromTypes(
        process.env.NODE_ENV === "production"
          ? "dist/index.d.ts"
          : "src/server.ts",
        {
          // debug: process.env.NODE_ENV !== "production",
        }
      ),
    })
  )

  // 1. 日志插件 (注入 ctx.log 和自动记录 HTTP 响应)
  .use(loggerPlugin)
  // 2. 核心错误处理插件 (拦截所有错误，进行转换和手动日志记录)
  .use(errorPlugin)
  // 3. Problem JSON 插件 (将最终的 HttpError 转换为 RFC 7807 响应)
  .use(httpProblemJsonPlugin())
  .get("/favicon", () => {
    throw new HttpError.NotFound("favicon.ico");
    // if (locale === "zh-CN") {
    //   throw new HttpError.BadRequest("sssss");
    // }
  })

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
// .use(userRoute)
// .use(factoryRoute);
