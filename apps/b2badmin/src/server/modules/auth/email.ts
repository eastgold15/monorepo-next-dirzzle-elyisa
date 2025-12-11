import { envConfig } from "@/server/config/config";
import type { Transporter } from "nodemailer";
import nodemailer from "nodemailer";


class EmailService {
  private readonly transporter: Transporter | null;
  private readonly isConfigured: boolean;

  constructor() {
    // 检查邮件服务是否已配置
    this.isConfigured = !!(
      envConfig.EMAIL_USER &&
      envConfig.EMAIL_PASSWORD &&
      envConfig.EMAIL_FROM
    );

    if (this.isConfigured) {
      this.transporter = nodemailer.createTransport({
        host: envConfig.EMAIL_HOST,
        port: envConfig.EMAIL_PORT,
        secure: envConfig.EMAIL_PORT === 465, // true for 465, false for other ports
        auth: {
          user: envConfig.EMAIL_USER,
          pass: envConfig.EMAIL_PASSWORD,
        },
      });
    } else {
      this.transporter = null;
      console.warn("邮件服务未配置，将使用控制台输出代替邮件发送");
    }
  }

  /**
   * 发送验证邮件
   */
  async sendVerificationEmail({
    to,
    subject,
    text,
    html,
  }: {
    to: string;
    subject: string;
    text: string;
    html?: string;
  }) {
    // 如果邮件服务未配置，使用控制台输出
    if (!(this.isConfigured && this.transporter)) {
      console.log("=== 邮件验证链接 ===");
      console.log(`收件人: ${to}`);
      console.log(`主题: ${subject}`);
      console.log(`验证链接: ${text}`);
      console.log("==================");
      return { success: true, devMode: true };
    }

    try {
      const info = await this.transporter.sendMail({
        from: envConfig.EMAIL_FROM,
        to,
        subject,
        text,
        html:
          html ||
          `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">邮箱验证</h2>
          <p>感谢您注册我们的服务！请点击下面的链接验证您的邮箱地址：</p>
          <p><a href="${text}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">验证邮箱</a></p>
          <p>如果按钮无法点击，请复制以下链接到浏览器地址栏：</p>
          <p><code>${text}</code></p>
          <p>此链接将在24小时后过期。</p>
          <hr>
          <p style="color: #666; font-size: 12px;">如果您没有注册此账户，请忽略此邮件。</p>
        </div>
      `,
      });

      console.log("邮件发送成功:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("邮件发送失败:", error);
      return { success: false, error };
    }
  }

  /**
   * 发送密码重置邮件
   */
  async sendPasswordResetEmail({
    to,
    subject,
    text,
    html,
  }: {
    to: string;
    subject: string;
    text: string;
    html?: string;
  }) {
    // 如果邮件服务未配置，使用控制台输出
    if (!(this.isConfigured && this.transporter)) {
      console.log("=== 密码重置链接 ===");
      console.log(`收件人: ${to}`);
      console.log(`主题: ${subject}`);
      console.log(`重置链接: ${text}`);
      console.log("==================");
      return { success: true, devMode: true };
    }

    try {
      const info = await this.transporter.sendMail({
        from: envConfig.EMAIL_FROM,
        to,
        subject,
        text,
        html:
          html ||
          `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">密码重置</h2>
          <p>您请求重置密码。请点击下面的链接重置您的密码：</p>
          <p><a href="${text}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">重置密码</a></p>
          <p>如果按钮无法点击，请复制以下链接到浏览器地址栏：</p>
          <p><code>${text}</code></p>
          <p>此链接将在1小时后过期。</p>
          <hr>
          <p style="color: #666; font-size: 12px;">如果您没有请求重置密码，请忽略此邮件。</p>
        </div>
      `,
      });

      console.log("密码重置邮件发送成功:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("密码重置邮件发送失败:", error);
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
export const emailService = new EmailService();
