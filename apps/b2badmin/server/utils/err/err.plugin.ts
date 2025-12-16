// src/plugins/errorHandler.ts
// 只抛不return
import chalk from "chalk";
import { Elysia } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { createLogger } from "logixlysia";
import { mapDatabaseError } from "./database-error-mapper";
import { isDatabaseError } from "./guards";

const log = createLogger({
  // 这是必须的
  config: { logFilePath: "./logs/errors.log" }, // 需配置输出路径
});

// 格式化堆栈信息，突出显示函数名、文件路径和行列号
function formatStack(stack?: string): string[] {
  if (!stack) return [];

  return stack.split("\n").map((line) => {
    // 匹配类似: at fnName (filePath:line:col)
    const match = line.match(/at\s+(.+?)\s+\((.+?)(?::(\d+):(\d+))?\)/);
    if (match) {
      const [, fnName, filepath, lineNum, colNum] = match;
      const formattedFn = fnName ? chalk.cyan(fnName) : "";
      const formattedFile = chalk.bold(filepath);
      const formattedLocation =
        lineNum && colNum ? chalk.yellow(`:${lineNum}:${colNum}`) : "";

      return `    at ${formattedFn} (${formattedFile}${formattedLocation})`;
    }

    // 简单的 at 行（例如原生错误）
    if (line.trim().startsWith("at ")) {
      return chalk.gray(line);
    }

    return line;
  });
}

// 创建带标题的分隔线
function createSeparator(title: string, width = 80): string {
  const padding = Math.max(0, width - title.length - 4);
  const leftPad = Math.floor(padding / 2);
  const rightPad = padding - leftPad;
  return (
    chalk.red("═".repeat(leftPad)) +
    " " +
    chalk.bold(title) +
    " " +
    chalk.red("═".repeat(rightPad))
  );
}

export const errorPlugin = new Elysia()
  .onError(({ code, error, path, request }) => {
    const method = request?.method || "UNKNOWN";
    const url = request?.url || path;

    // 转换后的错误 (最终将抛出的 HttpError 实例)
    let processedError: any = error;
    // 错误来源标识
    let errorSource: "database" | "http" | "unknown" = "unknown";
    // ========== 第一步：错误识别与转换 ==========
    // 1. 数据库错误 → 转为 HttpError
    if (isDatabaseError(error)) {
      errorSource = "database";
      const dbError = error as {
        code: string;
        detail?: string;
        message?: string;
      };
      processedError = mapDatabaseError(dbError);

      // 开发环境提示
      if (process.env.NODE_ENV === "development") {
        console.error(`\n${createSeparator("🗄️ DATABASE ERROR DETECTED")}`);
        console.error(
          chalk.red(`🚨 DB Error Code: ${chalk.yellow(dbError.code)}`)
        );
        console.error(
          chalk.red(`📝 DB Detail: ${chalk.white(dbError.detail || "N/A")}`)
        );
        console.error(
          chalk.red(
            `💡 Converted to HTTP ${chalk.yellow(processedError.status)}: ${chalk.white(processedError.message)}`
          )
        );
        console.error(`${chalk.red("═".repeat(80))}\n`);
      }
    }
    // 2. 已是 HttpError (包括 Elysia 内置错误)
    else if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      "message" in error
    ) {
      errorSource = "http";
    }
    // 3. 未知错误 → 包装为 500
    else {
      errorSource = "unknown";
      processedError = new HttpError.InternalServerError(
        (error as any)?.message || "服务器内部错误"
      );
    }
    // =================================================================
    // ========== 第二步：统一日志记录 (记录转换后的结果) ==========
    // =================================================================

    // 使用统一的 log 实例记录，确保 log.error 记录的是最终转换后的信息
    log.error(
      {
        // pino 结构化数据
        url,
        headers: request.headers,
        method
      },
      `Request Error [${errorSource.toUpperCase()}]: ${processedError.status} - ${processedError.message}`
    );

    // =================================================================
    // ========== 第三步：开发环境美化输出 (记录转换后的结果) ==========
    // =================================================================
    if (process.env.NODE_ENV === "development") {
      let separator: string;
      switch (errorSource) {
        case "database":
          separator = createSeparator("🗄️ DATABASE → HTTP ERROR");
          break;
        case "http":
          separator = createSeparator("🔥 HTTP ERROR");
          break;
        default:
          separator = createSeparator("💥 UNKNOWN → HTTP ERROR");
      }

      console.error(`\n${separator}`);
      console.error(
        chalk.red(`🚨 Status Code: ${chalk.yellow(processedError.status)}`)
      );
      console.error(
        chalk.red(`💬 Message: ${chalk.white(processedError.message)}`)
      );
      console.error(chalk.red(`📍 Path: ${chalk.cyan(path)}`));
      console.error(
        chalk.red(`🏷️  Source: ${chalk.cyan(errorSource.toUpperCase())}`)
      );

      if (errorSource === "unknown" && error instanceof Error) {
        console.error(
          chalk.red(
            `🔍 Original Error: ${chalk.white(`${error.name}: ${error.message}`)}`
          )
        );
      }

      if (processedError.stack) {
        console.error(chalk.red("📚 Stack Trace:"));
        formatStack(processedError.stack).forEach((line) =>
          console.error(line)
        );
      }

      console.error(`${chalk.red("═".repeat(80))}\n`);
    } else {
      // 生产环境简洁日志 (如果不依赖日志系统，可以保留)
      console.error(
        `[${errorSource.toUpperCase()}][${processedError.status}] ${path}: ${processedError.message}`
      );
    }

    // =================================================================
    // ========== 第四步：返回处理/重新抛出 ==========
    // =================================================================

    // 无论是数据库错误还是未知错误，都需要重新抛出，以便 httpProblemJsonPlugin
    // 捕获这个 HttpError 实例并返回标准的 RFC 7807 响应。
    throw processedError;
  })
  .as("global");
