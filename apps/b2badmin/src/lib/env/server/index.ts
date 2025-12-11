import { Type as t } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import { safeParse } from "@/lib/utils/base";

// 定义环境变量 Schema
const envSchema = t.Object({
  // 基础配置
  NODE_ENV: t.Union(
    [t.Literal("development"), t.Literal("test"), t.Literal("production")],
    { error: "NODE_ENV must be one of 'development', 'test', or 'production'" }
  ),
  APP_PORT: t.Number({
    minimum: 1,
    maximum: 65_535,
    error: "APP_PORT must be a valid port number",
  }),
  API_URL: t.String({ minLength: 1, error: "API_URL is required" }),

  // 必填项
  DATABASE_URL: t.String({ minLength: 1, error: "DATABASE_URL is required" }),
  BETTER_AUTH_SECRET: t.String({
    minLength: 1,
    error: "BETTER_AUTH_SECRET is required",
  }),
  BETTER_AUTH_URL: t.String({
    minLength: 1,
    error: "BETTER_AUTH_URL is required",
  }),
  GITHUB_CLIENT_ID: t.String({
    minLength: 1,
    error: "GITHUB_CLIENT_ID is required",
  }),
  GITHUB_CLIENT_SECRET: t.String({
    minLength: 1,
    error: "GITHUB_CLIENT_SECRET is required",
  }),

  // 邮件服务（可选，带默认值）
  EMAIL_HOST: t.Optional(t.String({ minLength: 1 })),
  EMAIL_PORT: t.Optional(t.Number({ minimum: 1, maximum: 65_535 })),
  EMAIL_USER: t.Optional(t.String()),
  EMAIL_PASSWORD: t.Optional(t.String()),
  EMAIL_FROM: t.Optional(t.String()),

  // 阿里云凭证（可选，默认值在 fallback 中处理）
  ALIBABA_CLOUD_ACCESS_KEY_ID: t.Optional(t.String()),
  ALIBABA_CLOUD_ACCESS_KEY_SECRET: t.Optional(t.String()),
  SECRET: t.String({ minLength: 1, error: "SECRET is required" }),
});

// 编译 schema
const envSchemaChecker = TypeCompiler.Compile(envSchema);

// 从 process.env 读取并提供默认值
const rawEnv = {
  NODE_ENV: process.env.NODE_ENV || "development",
  APP_PORT: process.env.APP_PORT
    ? Number.parseInt(process.env.APP_PORT, 10)
    : 3000,
  API_URL: process.env.API_URL || "http://localhost:3000",

  DATABASE_URL: process.env.DATABASE_URL,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,

  EMAIL_HOST: process.env.EMAIL_HOST || "smtp.gmail.com",
  EMAIL_PORT: process.env.EMAIL_PORT
    ? Number.parseInt(process.env.EMAIL_PORT, 10)
    : undefined,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL_FROM: process.env.EMAIL_FROM,

  ALIBABA_CLOUD_ACCESS_KEY_ID:
    process.env.ALIBABA_CLOUD_ACCESS_KEY_ID || "xxxx",
  ALIBABA_CLOUD_ACCESS_KEY_SECRET:
    process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET || "dddd",
  SECRET: process.env.SECRET || "km12poik3mokpaxnjcojsandfoj1nbjt",
};

// 安全校验
const envResult = safeParse(envSchemaChecker, rawEnv);

if (!envResult.success) {
  const firstError = envResult.errors[0];
  if (firstError) {
    throw new Error(`Invalid environment variable: ${firstError.message}`);
  }
  throw new Error("Environment validation failed");
}

// 导出类型安全的配置
export const envConfig = envResult.data;
