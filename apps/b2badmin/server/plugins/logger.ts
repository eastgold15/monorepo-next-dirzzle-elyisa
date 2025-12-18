// src/lib/logger.ts

import { Elysia } from "elysia";
import logixlysia from "logixlysia";

export const loggerPlugin = new Elysia({ name: "loggerPlugin" }).use(
  logixlysia({
    config: {
      showStartupMessage: true,
      startupMessageFormat: "simple",
      timestamp: { translateTime: "yyyy-mm-dd HH:MM:ss" },

      customLogFormat:
        "🦊 {now} {level} {duration} {method} {pathname} {status} {message} {ip}",
      ip: true,
      logFilePath: "./logs/app.log",
      logFilter: {
        level: ["ERROR", "WARNING", "INFO"],
      },
    },
  })
);
