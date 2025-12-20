import chalk from "chalk";
import { createLogger } from "logixlysia";

// 1. 初始化结构化日志 (Pino)
export const log = createLogger({
  config: {
    logFilePath: "./logs/errors.log",
    // 可以在这里配置自定义的 pino 选项
    // 💡 只有在非开发环境下才启用内部打印，或者干脆禁用它，只依赖你的 errorLoggerPlugin
    disableInternalLogger: false,
  },
});

/**
 * 格式化堆栈信息，突出显示函数名、文件路径和行列号
 */
export function formatStack(stack?: string): string[] {
  if (!stack) return [];

  return stack.split("\n").map((line) => {
    const match = line.match(/at\s+(.+?)\s+\((.+?)(?::(\d+):(\d+))?\)/);
    if (match) {
      const [, fnName, filepath, lineNum, colNum] = match;
      const formattedFn = fnName ? chalk.cyan(fnName) : "";
      const formattedFile = chalk.bold(filepath);
      const formattedLocation =
        lineNum && colNum ? chalk.yellow(`:${lineNum}:${colNum}`) : "";

      return `    at ${formattedFn} (${formattedFile}${formattedLocation})`;
    }

    if (line.trim().startsWith("at ")) {
      return chalk.gray(line);
    }

    return line;
  });
}

/**
 * 创建带标题的分隔线
 */
export function createSeparator(title: string, width = 80): string {
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

/**
 * 🧹 堆栈过滤器：只保留业务代码，过滤掉 node_modules 和 Next.js 内部噪音
 * 这样你就能在终端直接看到并点击你的源码位置
 */

export function filterStack(stack?: string): string[] {
  if (!stack) return [];

  const lines = stack.split("\n");
  const projectLines = lines.filter(
    (line) =>
      (line.includes("src") || line.includes("apps/web")) &&
      !line.includes("node_modules")
  );

  // 如果找不到业务代码行，就保留前 3 行原始信息，至少能看到是哪个 internal 模块报错
  const displayLines =
    projectLines.length > 0 ? projectLines : lines.slice(1, 4);

  return displayLines.map((line) => {
    // 转换 Windows 路径反斜杠并高亮
    const formattedLine = line.replace(/\\/g, "/");
    return `    ${chalk.gray("at")} ${chalk.yellow(formattedLine.trim().replace(/^at\s+/, ""))}`;
  });
}

/**
 * 📝 验证错误精简器：将巨大的 JSON 转化为一句话
 */
export function getValidationSummary(error: any): string {
  if (error.all && Array.isArray(error.all)) {
    return error.all
      .map((e: any) => `${e.path}: ${e.summary || e.message}`)
      .join(" | ");
  }
  return error.message;
}
