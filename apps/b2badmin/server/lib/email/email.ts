import type { Transporter } from "nodemailer";
import nodemailer from "nodemailer";
import { env } from "@/env";

import type { EmailRequest, EmailResult, EmailTemplate } from "./email.types";

/**
 * 邮件发送服务
 * 专注于邮件发送功能，不包含任何业务逻辑
 */
class EmailService {
  private readonly transporter: Transporter | null;
  private readonly isConfigured: boolean;

  constructor() {
    // 检查邮件服务是否已配置
    this.isConfigured = !!(
      env.EMAIL_USER &&
      env.EMAIL_PASSWORD &&
      env.EMAIL_FROM
    );

    if (this.isConfigured) {
      this.transporter = nodemailer.createTransport({
        host: env.EMAIL_HOST,
        port: env.EMAIL_PORT,
        secure: env.EMAIL_PORT === 465, // true for 465, false for other ports
        auth: {
          user: env.EMAIL_USER,
          pass: env.EMAIL_PASSWORD,
        },
      });
    } else {
      this.transporter = null;
      console.warn("邮件服务未配置，将使用控制台输出代替邮件发送");
    }
  }

  /**
   * 发送邮件（核心方法）
   * 这是 email 模块对外暴露的唯一核心功能
   */
  async sendEmail(request: EmailRequest): Promise<EmailResult> {
    const { to, cc, bcc, template } = request;

    // 如果邮件服务未配置，使用控制台输出
    if (!(this.isConfigured && this.transporter)) {
      console.log("=== 邮件发送（开发模式） ===");
      console.log(`收件人: ${Array.isArray(to) ? to.join(", ") : to}`);
      if (cc) console.log(`抄送: ${Array.isArray(cc) ? cc.join(", ") : cc}`);
      if (bcc)
        console.log(`密送: ${Array.isArray(bcc) ? bcc.join(", ") : bcc}`);
      console.log(`主题: ${template.subject}`);
      console.log(`内容: ${template.text}`);
      if (template.attachments && template.attachments.length > 0) {
        console.log(
          `附件: ${template.attachments.map((a) => a.filename).join(", ")}`
        );
      }
      console.log("========================");
      return { success: true, devMode: true };
    }

    try {
      const mailOptions: any = {
        from: env.EMAIL_FROM,
        to: Array.isArray(to) ? to.join(", ") : to,
        subject: template.subject,
        text: template.text,
        html: template.html,
        attachments: template.attachments,
      };

      // 添加抄送和密送
      if (cc) {
        mailOptions.cc = Array.isArray(cc) ? cc.join(", ") : cc;
      }
      if (bcc) {
        mailOptions.bcc = Array.isArray(bcc) ? bcc.join(", ") : bcc;
      }

      const info = await this.transporter.sendMail(mailOptions);

      console.log("邮件发送成功:", info.messageId);

      // 构建实际发送的邮箱列表
      const sentTo: string[] = [
        ...(Array.isArray(to) ? to : [to]),
        ...(cc ? (Array.isArray(cc) ? cc : [cc]) : []),
        ...(bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : []),
      ];

      return {
        success: true,
        messageId: info.messageId,
        sentTo,
      };
    } catch (error) {
      console.error("邮件发送失败:", error);
      return { success: false, error };
    }
  }

  /**
   * 验证邮件服务配置
   */
  async verifyConnection() {
    if (!(this.isConfigured && this.transporter)) {
      console.log("邮件服务未配置，跳过连接验证");
      return { success: true, devMode: true };
    }

    try {
      await this.transporter.verify();
      console.log("邮件服务连接验证成功");
      return { success: true };
    } catch (error) {
      console.error("邮件服务连接验证失败:", error);
      return { success: false, error };
    }
  }
}

// 创建单例实例
const emailService = new EmailService();

/**
 * 导出核心邮件发送函数
 * 这是 email 模块对外暴露的唯一功能
 *
 * @param request 邮件请求对象，包含收件人、模板等信息
 * @returns 发送结果
 */
export async function sendEmail(request: EmailRequest): Promise<EmailResult> {
  return await emailService.sendEmail(request);
}

/**
 * 验证邮件服务配置
 */
export async function verifyEmailConnection() {
  return await emailService.verifyConnection();
}

// 业务逻辑方法 - 兼容原有 auth/email.ts 的功能

/**
 * 创建邮箱验证邮件模板
 */
function createEmailVerificationTemplate(
  verificationUrl: string
): EmailTemplate {
  return {
    subject: "验证您的邮箱地址",
    text: `请点击以下链接验证您的邮箱：${verificationUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">邮箱验证</h2>
        <p>感谢您注册我们的服务！请点击下面的链接验证您的邮箱地址：</p>
        <p><a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">验证邮箱</a></p>
        <p>如果按钮无法点击，请复制以下链接到浏览器地址栏：</p>
        <p><code>${verificationUrl}</code></p>
        <p>此链接将在24小时后过期。</p>
        <hr>
        <p style="color: #666; font-size: 12px;">如果您没有注册此账户，请忽略此邮件。</p>
      </div>
    `,
  };
}

/**
 * 创建密码重置邮件模板
 */
function createPasswordResetTemplate(resetUrl: string): EmailTemplate {
  return {
    subject: "重置您的密码",
    text: `请点击以下链接重置您的密码：${resetUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">密码重置</h2>
        <p>您请求重置密码。请点击下面的链接重置您的密码：</p>
        <p><a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">重置密码</a></p>
        <p>如果按钮无法点击，请复制以下链接到浏览器地址栏：</p>
        <p><code>${resetUrl}</code></p>
        <p>此链接将在1小时后过期。</p>
        <hr>
        <p style="color: #666; font-size: 12px;">如果您没有请求重置密码，请忽略此邮件。</p>
      </div>
    `,
  };
}

/**
 * 发送验证邮件
 * 兼容原有 auth/email.ts 的功能
 */
export async function sendVerificationEmail({
  to,
  verificationUrl,
}: {
  to: string;
  verificationUrl: string;
}): Promise<EmailResult> {
  const template = createEmailVerificationTemplate(verificationUrl);
  return await sendEmail({
    to,
    template,
  });
}

/**
 * 发送密码重置邮件
 * 兼容原有 auth/email.ts 的功能
 */
export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: {
  to: string;
  resetUrl: string;
}): Promise<EmailResult> {
  const template = createPasswordResetTemplate(resetUrl);
  return await sendEmail({
    to,
    template,
  });
}

// 导出类型供业务模块使用
export type {
  EmailAttachment,
  EmailRequest,
  EmailResult,
  EmailTemplate,
} from "./email.types";
