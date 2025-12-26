// src/plugins/error-logger.plugin.ts
import chalk from "chalk";
import { Elysia } from "elysia";
import { HttpError, httpProblemJsonPlugin } from "elysia-http-problem-json";
import { mapDatabaseError } from "./database-error-mapper";
import {
  filterStack,
  getValidationSummary,
  log,
} from "./errorSuite.plugin.utils";
import { isDatabaseError } from "./guards";

// 核心思路是，转化错误，然后打印日志，最后由elysia-http-problem-json抛出错误

/**
 * Error Logger Plugin   这个可以给只是elysia的后端用，next用不了，他是把源代码变无数个chunks，堆栈找不到源代码位置
 * 职责：拦截 -> 转换 (DB to HTTP) -> 打印日志 -> 重新抛出给响应插件
 */
// export const errorLoggerPlugin = new Elysia({ name: "error-logger-plugin" })
//   .onError({ as: "global" }, ({ code, error, path, request }) => {
//     const method = request?.method || "UNKNOWN";
//     const url = request?.url || path;

//     // 最终要抛出的错误对象
//     let processedError: any = error;
//     // 错误分类标签
//     let errorSource: "database" | "http" | "validation" | "unknown" = "unknown";

//     // ========== 第一步：错误识别与转换 ==========

//     // 1. 识别数据库错误并映射为 HttpError
//     if (isDatabaseError(error)) {
//       errorSource = "database";
//       processedError = mapDatabaseError(error as any);
//     }
//     // 2. 识别验证错误 (Elysia 内置)
//     else if (code === 'VALIDATION') {
//       errorSource = "validation";
//       // 保持原始错误，让 httpProblemJsonPlugin 去处理具体的字段映射
//     }
//     // 3. 已经是 HttpError (包含手动 throw 的或内置错误)
//     else if (
//       error &&
//       typeof error === "object" &&
//       "status" in error &&
//       "message" in error
//     ) {
//       errorSource = "http";
//     }
//     // 4. 其他未知错误
//     else {
//       errorSource = "unknown";
//       // 包装为 500
//       processedError = new HttpError.InternalServerError(
//         (error as any)?.message || "服务器内部错误"
//       );
//     }

//     // ========== 第二步：结构化日志记录 (文件/生产) ==========

//     // =================================================================
//     // 🚀 方案 B：直接使用内部 Pino 实例记录深度结构化日志
//     // =================================================================
//     // Pino 的用法: pino.error(obj, msg)
//     // obj 中的所有字段都会成为 JSON 日志的顶级 Key
//     log.pino.error({
//       event: "request_error",
//       source: errorSource,
//       http: {
//         method,
//         url,
//         path,
//         status: processedError.status || 500,
//         // 这里可以记录任何你想要的复杂对象
//         headers: request.headers,
//       },
//       // 直接把 error 对象传给 Pino，它会自动解析 stack
//       err: error,
//       // 记录数据校验细节
//       validation: code === 'VALIDATION' ? (error as any).all : undefined,
//       database: errorSource === "database" ? {
//         code: (error as any).code,
//         detail: (error as any).detail
//       } : undefined
//     }, `[${errorSource.toUpperCase()}] ${processedError.message}`);

//     // ========== 第三步：开发环境控制台美化打印 ==========

//     if (env.NODE_ENV === "development") {
//       const title = `🚨 ${errorSource.toUpperCase()} ERROR DETECTED`;
//       console.error(`\n${createSeparator(title)}`);
//       console.error(chalk.red(`📍 Path:   ${chalk.cyan(`${method} ${path}`)}`));
//       console.error(chalk.red(`🏷️  Source: ${chalk.white(errorSource)}`));
//       console.error(chalk.red(`💬 Message: ${chalk.yellow(processedError.message)}`));

//       if (processedError.status) {
//         console.error(chalk.red(`🔢 Status:  ${chalk.bold(processedError.status)}`));
//       }

//       // 如果是数据库错误，打印原始的 DB Code
//       if (errorSource === "database") {
//         console.error(chalk.magenta(`🗄️ DB Code: ${(error as any).code || 'N/A'}`));
//       }

//       // 如果是校验错误，打印不通过的字段
//       if (errorSource === "validation" && (error as any).all) {
//         console.error(chalk.magenta("📋 Validation Details:"));
//         console.dir((error as any).all, { depth: null, colors: true });
//       }

//       // 打印堆栈信息
//       if (processedError.stack || (error as any).stack) {
//         console.error(chalk.red("📚 Stack Trace:"));
//         formatStack(processedError.stack || (error as any).stack).forEach((line) =>
//           console.error(line)
//         );
//       }

//       console.error(`${chalk.red("═".repeat(80))}\n`);
//     }
//   });

export const errorLoggerPlugin = new Elysia({
  name: "error-logger-plugin",
}).onError({ as: "global" }, ({ code, error, path, request }) => {
  const method = request?.method || "UNKNOWN";

  let processedError: any = error;
  let errorSource: "database" | "http" | "validation" | "unknown" = "unknown";

  // --- 转换逻辑 ---
  if (isDatabaseError(error)) {
    errorSource = "database";
    processedError = mapDatabaseError(error as any);
  } else if (code === "VALIDATION") {
    errorSource = "validation";
    // 这里的 processedError.message 目前是巨大的 JSON
  } else if (error && typeof error === "object" && "status" in error) {
    errorSource = "http";
  } else {
    errorSource = "unknown";
    processedError = new HttpError.InternalServerError(
      (error as any)?.message || "Unknown Error"
    );
  }

  // ========== 1. 静默写文件 (不输出到控制台) ==========
  log.pino.error({
    event: "request_error",
    source: errorSource,
    path,
    err: error,
    validation: code === "VALIDATION" ? (error as any).all : undefined,
  });

  // ========== 2. 开发环境精简美化打印 ==========
  if (process.env.NODE_ENV === "development") {
    const isVal = errorSource === "validation";
    const displayMsg = isVal
      ? getValidationSummary(error)
      : processedError.message;

    console.error(
      `\n${chalk.red("═".repeat(30))} ${chalk.bold.red("ERROR")} ${chalk.red("═".repeat(30))}`
    );
    console.error(
      `${chalk.bold.red("TYPE:")}    ${chalk.white(errorSource.toUpperCase())} (${chalk.yellow(code)})`
    );
    console.error(
      `${chalk.bold.red("PATH:")}    ${chalk.cyan(`${method} ${path}`)}`
    );
    console.error(`${chalk.bold.red("MESSAGE:")} ${chalk.white(displayMsg)}`);

    const filteredStack = filterStack((error as any)?.stack);
    if (filteredStack.length > 0) {
      console.error(chalk.bold.red("\nSOURCE:"));
      filteredStack.forEach((line) => console.error(line));
    } else {
      // 如果过滤后啥也没了，至少给一行原始堆栈，防止没法跳转
      console.error(
        chalk.gray("\n(Internal stack trace hidden, original first line:)")
      );
      console.error(chalk.gray((error as any)?.stack?.split("\n")[1]));
    }
    console.error(`${chalk.red("═".repeat(66))}\n`);
  }
});

/**
 * 统一错误处理套件
 * 顺序：日志转换 -> 标准响应
 */
export const errorSuite = new Elysia({ name: "error-suite" })
  .use(errorLoggerPlugin) // 1. 先抓到，打印并 throw
  .use(httpProblemJsonPlugin()) // 2. 接收 throw 出来的错误并返回 JSON
  .as("global");
