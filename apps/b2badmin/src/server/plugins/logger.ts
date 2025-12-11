import { envConfig } from "@/lib/env/server/config";
import { Elysia } from "elysia";
import logixlysia from "logixlysia";


export const logPlugin = new Elysia({
  name: "Logixlysia",
})
  // .onTransform(function log({ body, params, path, request: { method } }) {
  //   console.log(`${method} ${path}`, {
  //     body,
  //     params,
  //   });
  // })
  .use(
    logixlysia({
      config: {
        showStartupMessage: true,
        startupMessageFormat: "simple",
        timestamp: {
          translateTime: "yyyy-mm-dd HH:MM:ss",
        },
        ip: true,
        logFilePath: "./logs/example.log",
        logRotation: {
          maxSize: "10m",
          interval: "1d",
          maxFiles: "7d",
          compress: true,
        },
        customLogFormat:
          "🦊 {now} {level} {pathname} {duration} {method}    {status} {message} {ip}",
        logFilter: {
          level:
            envConfig.NODE_ENV === "development"
              ? undefined
              : ["ERROR", "WARNING"],
        },
      },
    })
  )
  .as("global");
