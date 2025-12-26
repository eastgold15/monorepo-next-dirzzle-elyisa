import { cors } from "@elysiajs/cors";
import { fromTypes, openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { OpenAPI } from "~/lib/auth-openapi";
import { localeMiddleware } from "~/middleware/locale";
import { appRouter } from "./controllers/app-router";
import { dbPlugin } from "./db/connection";
import { auth } from "./lib/auth";
import { authGuardMid } from "./middleware/auth";
import { loggerPlugin } from "./middleware/logger";
import { errorSuite } from "./utils/err/errorSuite.plugin";
/**
 * Main API router
 * Combines auth and user routes under the '/api' prefix
 */
export const server = new Elysia({ name: "server" })
  .use(
    openapi({
      documentation: {
        components: await OpenAPI.components,
        paths: await OpenAPI.getPaths(),
        info: {
          title: "Gin Shopping API",
          version: "1.0.71",
          description: "基于 Elysia + Drizzle + TypeScript 的电商后端 API",
        },
        tags: [
          { name: "Product V2", description: "商品管理 V2" },
          { name: "商品管理", description: "工厂级商品管理" },
          { name: "SKU管理", description: "商品SKU管理" },
          { name: "商品图片管理", description: "商品图片关联管理" },
          { name: "站点商品管理", description: "出口商站点产品聚合管理" },
          { name: "站点分类管理", description: "站点分类管理" },
          { name: "主分类管理", description: "主分类管理" },
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
        "http://localhost:9001", // Vite 默认端口
        "http://localhost:4000",
      ],
      credentials: true,
    })
  )
  // 1. 日志插件 (注入 ctx.log 和自动记录 HTTP 响应)
  .use(loggerPlugin)
  // 2. 核心错误处理插件 (拦截所有错误，进行转换和手动日志记录)
  .use(errorSuite)
  .use(dbPlugin)
  .mount("/", auth.handler) // 使用 Better Auth 认证中间件
  .group("/v1", (app) => app.use(authGuardMid).use(appRouter));
