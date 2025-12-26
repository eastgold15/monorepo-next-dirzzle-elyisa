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

    GITHUB_CLIENT_ID: z.string().min(1, "GITHUB_CLIENT_ID 是必需的"),
    GITHUB_CLIENT_SECRET: z.string().min(1, "GITHUB_CLIENT_SECRET 是必需的"),

    // 邮件服务（可选）
    EMAIL_HOST: z.string().default("smtp.gmail.com"),
    EMAIL_PORT: z.coerce.number().min(1).max(65_535).optional(),
    EMAIL_USER: z.string().optional(),
    EMAIL_PASSWORD: z.string().optional(),
    EMAIL_FROM: z.string().optional(),

    // 阿里云凭证（可选）
    ALIBABA_CLOUD_ACCESS_KEY_ID: z.string().default("xxxx"),
    ALIBABA_CLOUD_ACCESS_KEY_SECRET: z.string().default("dddd"),

    // OSS 配置（可选）
    ACCESS_KEY_ID: z.string().optional(),
    SECRET_ACCESS_KEY: z.string().optional(),
    BUCKET: z.string().optional(),
    REGION: z.string().optional(),
    ENDPOINT: z.string().optional(),
    DOMAIN: z.string().optional(),
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

    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,

    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    EMAIL_FROM: process.env.EMAIL_FROM,

    ALIBABA_CLOUD_ACCESS_KEY_ID: process.env.ALIBABA_CLOUD_ACCESS_KEY_ID,
    ALIBABA_CLOUD_ACCESS_KEY_SECRET:
      process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET,
    ACCESS_KEY_ID: process.env.ACCESS_KEY_ID,
    SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY,
    BUCKET: process.env.BUCKET,
    REGION: process.env.REGION,
    ENDPOINT: process.env.ENDPOINT,
    DOMAIN: process.env.DOMAIN,

    AUTH_COOKIE: process.env.AUTH_COOKIE,
    SERVER_URL_KEY: process.env.SERVER_URL_KEY,
  },
});
