import env from "env-var";

export const envConfig = {
  NODE_ENV: env
    .get("NODE_ENV")
    .default("development")
    .asEnum(["production", "test", "development"]),
  APP_PORT: env.get("APP_PORT").default(3000).asPortNumber(),
  API_URL: env.get("API_URL").default("http://localhost:3000").asString(),
  DATABASE_URL: env.get("DATABASE_URL").required().asString(),
  BETTER_AUTH_SECRET: env.get("BETTER_AUTH_SECRET").required().asString(),
  BETTER_AUTH_URL: env.get("BETTER_AUTH_URL").required().asString(),
  GITHUB_CLIENT_ID: env.get("GITHUB_CLIENT_ID").required().asString(),
  GITHUB_CLIENT_SECRET: env.get("GITHUB_CLIENT_SECRET").required().asString(),

  // 邮件服务配置
  EMAIL_HOST: env.get("EMAIL_HOST").default("smtp.gmail.com").asString(),
  EMAIL_PORT: env.get("EMAIL_PORT").asPortNumber(),
  EMAIL_USER: env.get("EMAIL_USER").asString(),
  EMAIL_PASSWORD: env.get("EMAIL_PASSWORD").asString(),
  EMAIL_FROM: env.get("EMAIL_FROM").asString(),
  ALIBABA_CLOUD_ACCESS_KEY_ID: env
    .get("ALIBABA_CLOUD_ACCESS_KEY_ID")
    .default("xxxx")
    .asString(),
  ALIBABA_CLOUD_ACCESS_KEY_SECRET: env
    .get("ALIBABA_CLOUD_ACCESS_KEY_SECRET")
    .default("dddd")
    .asString(),
};
