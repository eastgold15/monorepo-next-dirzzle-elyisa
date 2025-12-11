/**
 * 认证模块邮件模板
 * 处理邮箱验证、密码重置等认证相关的邮件模板
 */

import type { EmailTemplate } from "../email/email.types";
import { createVerificationTemplate } from "../email/templates/template.utils";

/**
 * 创建邮箱验证邮件模板
 */
export function createEmailVerificationTemplate(
  email: string,
  verificationLink: string
): EmailTemplate {
  return createVerificationTemplate({
    title: "邮箱验证",
    description: "感谢您注册我们的服务！请点击下面的链接验证您的邮箱地址：",
    buttonText: "验证邮箱",
    link: verificationLink,
    expirationHours: 24,
    additionalContent: `
      <div style="margin-top: 30px; padding: 15px; background-color: #fff3cd; border-radius: 5px; border-left: 4px solid #ffc107;">
        <p style="margin: 0; color: #856404; font-size: 14px;">
          <strong>安全提示：</strong>如果您没有注册此账户，请忽略此邮件。我们不会存储您的信息。
        </p>
      </div>
    `,
  });
}

/**
 * 创建密码重置邮件模板
 */
export function createPasswordResetTemplate(
  email: string,
  resetLink: string
): EmailTemplate {
  return createVerificationTemplate({
    title: "密码重置",
    description: "您请求重置密码。请点击下面的链接重置您的密码：",
    buttonText: "重置密码",
    link: resetLink,
    expirationHours: 1,
    additionalContent: `
      <div style="margin-top: 30px; padding: 15px; background-color: #f8d7da; border-radius: 5px; border-left: 4px solid #dc3545;">
        <p style="margin: 0; color: #721c24; font-size: 14px;">
          <strong>安全提示：</strong>
        </p>
        <ul style="margin: 10px 0 0 20px; color: #721c24; font-size: 14px;">
          <li>此链接仅用于重置密码</li>
          <li>请勿将此链接分享给他人</li>
          <li>如果您没有请求重置密码，请忽略此邮件</li>
          <li>重置后请使用强密码</li>
        </ul>
      </div>
    `,
  });
}

/**
 * 创建欢迎邮件模板
 */
export function createWelcomeTemplate(
  email: string,
  userName: string
): EmailTemplate {
  const subject = `欢迎加入${process.env.COMPANY_NAME || "我们"}！`;
  const text = `亲爱的 ${userName}，欢迎加入我们的平台！感谢您的注册和邮箱验证。`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>欢迎加入</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 20px auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🎉 欢迎加入！</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">感谢您选择我们的平台</p>
        </div>

        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">亲爱的 ${userName}，</h2>

          <p style="font-size: 16px; color: #666; line-height: 1.8;">
            欢迎正式加入我们的大家庭！您的邮箱验证已经完成，现在您可以开始使用我们的所有功能了。
          </p>

          <div style="margin: 30px 0; padding: 20px; background-color: #e8f4f8; border-radius: 5px; border-left: 4px solid #17a2b8;">
            <h3 style="margin-top: 0; color: #17a2b8;">🚀 接下来您可以：</h3>
            <ul style="margin: 15px 0; color: #555;">
              <li>完善您的个人资料</li>
              <li>探索我们的产品和服务</li>
              <li>联系我们的客服团队获得帮助</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.WEBSITE_URL || "#"}"
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              开始探索
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              如果您有任何问题，请随时联系我们的客服团队。
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, text, html };
}
