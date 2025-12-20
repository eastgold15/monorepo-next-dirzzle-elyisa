import { Elysia } from "elysia";
import { httpProblemJsonPlugin } from "elysia-http-problem-json";
import * as controllers from "./controllers";
import { dbPlugin } from "./db/connection";
import { siteMiddleware } from "./middleware/site";

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
  .use(siteMiddleware)
  .use(httpProblemJsonPlugin())
  // 自动挂载所有控制器（包括自定义和生成的）
  .group("/v1", (app) => {
    Object.values(controllers).forEach((controller) => app.use(controller));
    return app;
  });

/**
 * Export the app type for use with RPC clients (e.g., edenTreaty)
 */
export type App = typeof server;
