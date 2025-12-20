import { fromTypes, openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { OpenAPI } from "~/lib/auth-openapi";
import { server } from "../../../../server/server";

export const dynamic = "force-dynamic";

/**
 * Main API router
 * Combines auth and user routes under the '/api' prefix
 */
const app = new Elysia({ prefix: "/api" })
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
  .use(server);

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
