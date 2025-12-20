import { Elysia } from "elysia";
import { server } from "~/server";
export type App = typeof server;

import { fromTypes, openapi } from "@elysiajs/openapi";
import { env } from "@/env";

/**
 * 使用 server.ts 中定义的服务器实例
 * 设置 /api 前缀以匹配路由路径
 */
const app = new Elysia()
  .use(server);
/**
 * Export handlers for different HTTP methods
 * These are used by Next.js API routes [[...route]].ts
 */
export const GET = app.handle;
export const POST = app.handle;
export const PUT = app.handle;
export const DELETE = app.handle;
export const PATCH = app.handle;
