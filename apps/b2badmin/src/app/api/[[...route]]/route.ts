import { cors } from "@elysiajs/cors";
import { fromTypes, openapi } from "@elysiajs/openapi";
import { Elysia, redirect } from "elysia";
import { HttpError, httpProblemJsonPlugin } from "elysia-http-problem-json";
import { z } from "zod/v4";
import { dbPlugin } from "@/server/db/connection";
import { auth } from "@/server/lib/auth";
import { OpenAPI } from "@/server/lib/auth-openapi";
import { userRoute } from "@/server/modules/01auth/user";
import { AdsController } from "@/server/modules/ads/ads";
import { betterAuthPlugin } from "@/server/modules/auth/auth.plugin";
import { categoriesController } from "@/server/modules/category/category";
import { HeroCardsController } from "@/server/modules/hero-cards/hero-cards";
import { mediaRoute } from "@/server/modules/media/media";
import { v2AttributeRoute } from "@/server/modules/product/attribute";
import { product2Route } from "@/server/modules/product/product";
import { skuRoute } from "@/server/modules/product/sku";
import { siteConfigsController } from "@/server/modules/site-config/site-config";
import { translateRoute } from "@/server/modules/translations/translate";
import { localeMiddleware } from "@/server/plugins/locale";
import { logPlugin } from "@/server/plugins/logger";
import { errorPlugin } from "@/server/utils/err/err.plugin";
export const dynamic = "force-dynamic";

/**
 * 在模块加载时验证邮件配置
 * 这是应用启动时的初始化检查
 */
const emailCheckPromise: Promise<void> | null = null;

/**
 * Main API router
 * Combines auth and user routes under the '/api' prefix
 */
const app = new Elysia({ prefix: "/api" })
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
      ],
      credentials: true,
    })
  )
  .mount("/api", auth.handler) // 使用 Better Auth 认证中间件
  .get("/", redirect("/openapi"), {
    detail: {
      hide: true,
    },
  })
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
          { name: "Media", description: "媒体文件管理" }, // 新的媒体管理标签，替代Images和Upload
          { name: "Partners", description: "合作伙伴管理" },
          { name: "Advertisements", description: "广告管理" },
          { name: "Hero Cards", description: "首页展示卡片管理" },
          { name: "Site Config", description: "站点配置" },
        ],
      },
      mapJsonSchema: {
        zod: z.toJSONSchema,
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

  .use(logPlugin)
  .use(errorPlugin)
  // 添加 HTTP Problem JSON 插件 会直接return  所以后面是接受不到错误
  .use(httpProblemJsonPlugin())
  .get("/favicon", () => {
    throw new HttpError.NotFound("favicon.ico");
    // if (locale === "zh-CN") {
    //   throw new HttpError.BadRequest("sssss");
    // }
  })

  .use(dbPlugin)
  .use(betterAuthPlugin)
  .use(mediaRoute) // 新的统一媒体控制器，替代upload和image控制器
  .use(categoriesController)
  .use(AdsController)
  .use(HeroCardsController) // 添加首页展示卡片控制器
  .use(siteConfigsController)
  .use(v2AttributeRoute)
  .use(product2Route)
  .use(skuRoute)
  .use(translateRoute)
  .use(userRoute);

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
