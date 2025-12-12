import { Type as t } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import { safeParse } from "@/lib/utils/base";

const envSchema = t.Object({
  // 基础配置
  NODE_ENV: t.Union(
    [t.Literal("development"), t.Literal("test"), t.Literal("production")],
    { error: "NODE_ENV 必须是 'development', 'test', 或 'production' 之一" }
  ),
  APP_PORT: t.Number({
    minimum: 1,
    maximum: 65_535,
    error: "APP_PORT 必须是有效的端口号 (1 到 65535 之间)",
  }),
  API_URL: t.String({
    minLength: 1,
    error: "API_URL 必须提供，且不能为空",
  }),

  // 必填项
  DATABASE_URL: t.String({
    minLength: 1,
    error: "DATABASE_URL 数据库连接字符串是必需的",
  }),
  BETTER_AUTH_SECRET: t.String({
    minLength: 1,
    error: "BETTER_AUTH_SECRET 认证密钥是必需的",
  }),
  BETTER_AUTH_URL: t.String({
    minLength: 1,
    error: "BETTER_AUTH_URL 认证服务地址是必需的",
  }),
  GITHUB_CLIENT_ID: t.String({
    minLength: 1,
    error: "GITHUB_CLIENT_ID 是必需的",
  }),
  GITHUB_CLIENT_SECRET: t.String({
    minLength: 1,
    error: "GITHUB_CLIENT_SECRET 是必需的",
  }),

  // 邮件服务（可选，若提供则应为字符串）
  EMAIL_HOST: t.Optional(
    t.String({
      minLength: 1,
      error: "EMAIL_HOST 邮件服务器地址不能为空",
    })
  ),
  EMAIL_PORT: t.Optional(
    t.Number({
      minimum: 1,
      maximum: 65_535,
      error: "EMAIL_PORT 必须是有效的端口号",
    })
  ),
  EMAIL_USER: t.Optional(
    t.String({
      error: "EMAIL_USER 邮件用户名必须是字符串",
    })
  ),
  EMAIL_PASSWORD: t.Optional(
    t.String({
      error: "EMAIL_PASSWORD 邮件密码必须是字符串",
    })
  ),
  EMAIL_FROM: t.Optional(
    t.String({
      error: "EMAIL_FROM 发件人地址必须是字符串",
    })
  ),

  // 阿里云凭证（可选）
  ALIBABA_CLOUD_ACCESS_KEY_ID: t.Optional(
    t.String({
      error: "ALIBABA_CLOUD_ACCESS_KEY_ID 必须是字符串",
    })
  ),
  ALIBABA_CLOUD_ACCESS_KEY_SECRET: t.Optional(
    t.String({
      error: "ALIBABA_CLOUD_ACCESS_KEY_SECRET 必须是字符串",
    })
  ),
  SECRET: t.String({
    minLength: 1,
    error: "SECRET 服务器密钥是必需的",
  }),

  // S3 / MinIO 配置（可选）
  S3_ACCESS_KEY_ID: t.Optional(
    t.String({
      error: "S3_ACCESS_KEY_ID 必须是字符串",
    })
  ),
  S3_SECRET_ACCESS_KEY: t.Optional(
    t.String({
      error: "S3_SECRET_ACCESS_KEY 必须是字符串",
    })
  ),
  S3_REGION: t.Optional(
    t.String({
      error: "S3_REGION 必须是字符串",
    })
  ),
  S3_ENDPOINT: t.Optional(
    t.String({
      error: "S3_ENDPOINT 必须是字符串",
    })
  ),
  S3_BUCKET: t.Optional(
    t.String({
      error: "S3_BUCKET 必须是字符串",
    })
  ),
  S3_SESSION_TOKEN: t.Optional(
    t.String({
      error: "S3_SESSION_TOKEN 必须是字符串",
    })
  ),
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
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID || "minioadmin",
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY || "minioadmin",
  S3_REGION: process.env.S3_REGION || "oss-cn-hongkong",
  S3_ENDPOINT: process.env.S3_ENDPOINT || "http://localhost:9010",
  S3_BUCKET: process.env.S3_BUCKET || "buy4",
  S3_SESSION_TOKEN: process.env.S3_SESSION_TOKEN || "11111",
};

// 安全校验
const envResult = safeParse(envSchemaChecker, rawEnv);

if (!envResult.success) {
  console.error("Environment validation failed. Errors:", envResult.errors);
  const firstError = envResult.errors[0];
  if (firstError) {
    throw new Error(
      `Invalid environment variable: ${firstError.path} - ${firstError.message}`
    );
  }
  throw new Error("Environment validation failed");
}

// 导出类型安全的配置
export const envConfig = envResult.data;
