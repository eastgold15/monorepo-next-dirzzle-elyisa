import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * 服务端变量：仅在 Node.js 环境可用。
   * 使用 z.coerce 将 process.env 的字符串自动转换为数字或布尔值。
   */
  server: {
    PORT: z.coerce.number().min(1).max(65_535).default(3000),
    // 必填项
    DATABASE_URL: z.string().min(1, "DATABASE_URL 是必需的"),
    BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET 是必需的"),

    BETTER_AUTH_BASE_URL: z.url("BETTER_AUTH_BASE_URL 必须是有效的 URL"),

    AUTH_COOKIE: z.string().default("better-auth.session-token"),
    SERVER_URL_KEY: z.string().default("x-url"),
  },

  /**
   * 客户端变量：可以在浏览器访问。
   * 必须以 NEXT_PUBLIC_ 开头。
   */
  client: {
    NEXT_PUBLIC_API_URL: z.url().default("http://localhost:3000"),
  },

  /**
   * 运行时映射：Next.js 要求的显式读取。
   * 注意：在这里直接传 process.env.XXX，Zod 的 coerce 会帮你转换类型。
   */
  runtimeEnv: {
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,

    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,

    BETTER_AUTH_BASE_URL: process.env.BETTER_AUTH_BASE_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,

    AUTH_COOKIE: process.env.AUTH_COOKIE,
    SERVER_URL_KEY: process.env.SERVER_URL_KEY,
  },
});
