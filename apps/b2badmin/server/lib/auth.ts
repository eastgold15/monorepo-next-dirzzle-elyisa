import {
  accountTable,
  sessionTable,
  usersTable,
  verificationTable,
} from "@repo/contract";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";
import { env } from "@/env";
import { db } from "../db/connection";
import { sendPasswordResetEmail, sendVerificationEmail } from "./email/email";

// 将正则表达式移到顶层以提高性能
const URL_REPLACE_REGEX = /^(\w+:\/\/[^/]+)(\/.*)$/;

export const auth = betterAuth({
  basePath: "/auth",
  baseURL: env.BETTER_AUTH_BASE_URL,
  secret: env.BETTER_AUTH_SECRET, // 加密密钥
  plugins: [openAPI()],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: usersTable, // ✅ 键名必须是 "user"
      account: accountTable, // ✅ "account"
      session: sessionTable, // ✅ "session"
      verification: verificationTable, // ✅ "verification"
    },
  }),
  advanced: {
    database: {
      generateId: false,
    },
    disableOriginCheck: true,
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      // 使用集成的邮件发送函数
      await sendPasswordResetEmail({
        to: user.email,
        resetUrl: url,
      });
    },
  },
  // 基础邮箱验证
  emailVerification: {
    sendOnSignUp: false,
    sendVerificationEmail: async ({ user, url }) => {
      // 增加`/api/` 才能访问后端
      const newUrls = url.replace(URL_REPLACE_REGEX, "$1/api$2");
      console.log("newUrls:", newUrls);
      // 使用集成的邮件发送函数
      await sendVerificationEmail({
        to: user.email,
        verificationUrl: newUrls,
      });
    },
  },

  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      enabled: !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
    },
  },
  trustedOrigins: [
    "http://localhost:9012", // 前端开发服务器
    "http://localhost:9001", // Vite 默认端口
    "http://localhost:4000",
  ],

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
  },
});
