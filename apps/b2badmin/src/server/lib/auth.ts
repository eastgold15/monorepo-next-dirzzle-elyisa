import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";
import { envConfig } from "@/lib/env/server/config";
import { db } from "../db/connection";
import {
  accountTable,
  sessionTable,
  usersTable,
  verificationTable,
} from "../db/schema";
import {
  createEmailVerificationTemplate,
  createPasswordResetTemplate,
} from "../modules/auth/auth.templates";
import { sendEmail } from "../modules/email/email";

// 将正则表达式移到顶层以提高性能
const URL_REPLACE_REGEX = /^(\w+:\/\/[^/]+)(\/.*)$/;

export const auth = betterAuth({
  basePath: "/auth",
  baseURL: envConfig.BETTER_AUTH_URL,
  secret: envConfig.BETTER_AUTH_SECRET, // 加密密钥
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
      generateId: false, // 关闭自动生成 ID，使用数据库默认值
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      // 使用新的邮件模板系统
      const template = createPasswordResetTemplate(user.email, url);

      await sendEmail({
        to: user.email,
        template,
      });
    },
    // onPasswordReset: ({ user }) => {
    //   console.log(`用户 ${user.email} 的密码已重置`);
    // },
  },
  // 基础邮箱验证
  emailVerification: {
    sendOnSignUp: true,
    requireEmailVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      // 增加`/api/` 才能访问后端
      const newUrls = url.replace(URL_REPLACE_REGEX, "$1/api$2");
      console.log("newUrls:", newUrls);
      // 使用新的邮件模板系统
      const template = createEmailVerificationTemplate(user.email, newUrls);
      await sendEmail({
        to: user.email,
        template,
      });
    },
  },

  socialProviders: {
    github: {
      clientId: envConfig.GITHUB_CLIENT_ID,
      clientSecret: envConfig.GITHUB_CLIENT_SECRET,
      enabled: !!(envConfig.GITHUB_CLIENT_ID && envConfig.GITHUB_CLIENT_SECRET),
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
  },
  trustedOrigins: [
    "http://localhost:9012",
    "http://localhost:9013", // 前端开发服务器
    "http://localhost:3000", // 标准前端端口
  ],
});
